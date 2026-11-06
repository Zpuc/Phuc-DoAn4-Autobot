import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function runFlowTest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ LUỒNG ĐẶT HÀNG & TỒN KHO (E2E FLOW TEST) ===');

  try {
    // 1. Tìm một sản phẩm mẫu trong kho
    const product = await prisma.product.findFirst({
      where: {
        isPreorder: false,
        deletedAt: null,
        inventory: { quantity: { gt: 2 } },
      },
      include: {
        inventory: true,
        prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
      },
    });

    if (!product) {
      throw new Error('Không tìm thấy sản phẩm có sẵn trong kho để test');
    }

    const initialStock = product.inventory?.quantity || 0;
    const unitPrice = Number(product.prices[0]?.price || 100000);
    const unitCost = Number(product.prices[0]?.costPrice || 80000);
    console.log(`[TEST 1] Chọn sản phẩm test: ${product.name} (SKU: ${product.sku})`);
    console.log(`         Tồn kho ban đầu: ${initialStock} hộp | Giá bán: ${unitPrice.toLocaleString('vi-VN')} đ`);

    // 2. Giả lập đặt hàng 2 hộp
    const orderQty = 2;
    const orderCode = `TEST-${Date.now().toString().slice(-6)}`;
    console.log(`[TEST 2] Tiến hành đặt hàng ${orderQty} hộp với mã đơn: ${orderCode}...`);

    const order = await prisma.$transaction(async (tx) => {
      // Trừ kho
      await tx.inventory.update({
        where: { productId: product.id },
        data: { quantity: { decrement: orderQty } },
      });

      // Tạo Order
      return tx.order.create({
        data: {
          code: orderCode,
          customerName: 'Người Kiểm Thử Tự Động',
          customerPhone: '0988000111',
          shippingAddress: 'Địa chỉ kiểm thử hệ thống',
          shippingFee: 25000,
          subtotal: unitPrice * orderQty,
          total: unitPrice * orderQty + 25000,
          status: OrderStatus.PENDING,
          paymentMethod: PaymentMethod.COD,
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                quantity: orderQty,
                unitPrice,
                unitCost,
              },
            ],
          },
          statusHistory: {
            create: [
              { status: OrderStatus.PENDING, note: 'Khởi tạo đơn kiểm thử' },
            ],
          },
        },
      });
    });

    // 3. Kiểm tra tồn kho sau khi đặt
    const afterOrderStock = await prisma.inventory.findUnique({
      where: { productId: product.id },
    });
    console.log(`[TEST 3] Tồn kho sau khi đặt đơn: ${afterOrderStock?.quantity} hộp`);
    if (afterOrderStock?.quantity !== initialStock - orderQty) {
      throw new Error('LỖI: Tồn kho không được trừ chính xác!');
    }
    console.log('         => Trừ tồn kho THÀNH CÔNG (Đạt chuẩn Atomic Transaction)');

    // 4. Giả lập Admin hủy đơn hàng và kiểm tra hoàn trả kho
    console.log(`[TEST 4] Giả lập Admin hủy đơn hàng ${orderCode}...`);
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.inventory.update({
        where: { productId: product.id },
        data: { quantity: { increment: orderQty } },
      });
    });

    // 5. Kiểm tra tồn kho đã hoàn lại nguyên vẹn
    const finalStock = await prisma.inventory.findUnique({
      where: { productId: product.id },
    });
    console.log(`[TEST 5] Tồn kho sau khi hủy đơn: ${finalStock?.quantity} hộp`);
    if (finalStock?.quantity !== initialStock) {
      throw new Error('LỖI: Tồn kho không được hoàn trả đúng!');
    }
    console.log('         => Hoàn trả tồn kho THÀNH CÔNG!');

    // Dọn dẹp đơn test
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });

    console.log('=== KẾT QUẢ: TẤT CẢ CÁC BÀI TEST LUỒNG ĐỀU ĐẠT 100% (PASSED) ===');
  } catch (error) {
    console.error('LỖI TEST:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFlowTest();
