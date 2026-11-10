import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { InventoryChangeReason, OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, userId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra từng sản phẩm và tính toán giá
      let subtotal = 0;
      const preparedItems: {
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        unitCost: number;
      }[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId, deletedAt: null },
          include: {
            inventory: true,
            prices: {
              orderBy: { effectiveFrom: 'desc' },
              take: 1,
            },
          },
        });

        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${item.productId}`);
        }

        // Kiểm tra tồn kho đối với hàng có sẵn (không phải pre-order)
        if (!product.isPreorder) {
          const currentStock = product.inventory?.quantity || 0;
          if (currentStock < item.quantity) {
            throw new BadRequestException(
              `Mô hình "${product.name}" hiện chỉ còn ${currentStock} hộp trong kho, không đủ số lượng bạn yêu cầu.`,
            );
          }
        }

        const latestPrice = product.prices[0];
        const unitPrice = latestPrice ? Number(latestPrice.price) : 0;
        const unitCost = latestPrice ? Number(latestPrice.costPrice) : 0;

        subtotal += unitPrice * item.quantity;

        preparedItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          unitCost,
        });
      }

      // Xử lý mã giảm giá coupon (nếu có)
      let discountAmount = 0;
      let appliedCouponCode: string | null = null;
      if (dto.couponCode) {
        const cleanCode = dto.couponCode.trim().toUpperCase();
        const coupon = await tx.coupon.findUnique({ where: { code: cleanCode } });
        if (
          coupon &&
          coupon.isActive &&
          (!coupon.validUntil || new Date() <= coupon.validUntil) &&
          coupon.usedCount < coupon.usageLimit
        ) {
          const minOrder = Number(coupon.minOrder);
          if (subtotal >= minOrder) {
            const val = Number(coupon.value);
            if (coupon.type === 'PERCENT') {
              discountAmount = Math.round((subtotal * val) / 100);
              if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                discountAmount = Number(coupon.maxDiscount);
              }
            } else {
              discountAmount = Math.min(val, subtotal);
            }
            appliedCouponCode = coupon.code;
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }

      const shippingFee = Number(dto.shippingFee) || 0;
      const total = Math.max(0, subtotal - discountAmount + shippingFee);

      // 2. Sinh mã đơn hàng tự động định dạng: AG-YYMMDD-XXX
      const now = new Date();
      const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
      const countToday = await tx.order.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
      });
      const orderCode = `AG-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

      // 3. Tạo Order
      const order = await tx.order.create({
        data: {
          code: orderCode,
          userId: userId || null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail || null,
          shippingAddress: dto.shippingAddress,
          shippingFee,
          subtotal,
          couponCode: appliedCouponCode,
          discountAmount,
          total,
          status: OrderStatus.PENDING,
          paymentMethod: dto.paymentMethod,
          note: dto.note || null,
        },
      });

      // 4. Tạo OrderItems và Trừ tồn kho
      for (const item of preparedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost,
          },
        });

        // Trừ kho nếu là hàng có sẵn
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        // Ghi vết nhật ký xuất kho
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: InventoryChangeReason.SALE,
            refId: orderCode,
          },
        });
      }

      // 5. Ghi vết lịch sử trạng thái ban đầu
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDING,
          changedBy: userId || null,
          note: 'Khách hàng gửi yêu cầu đặt hàng',
        },
      });

      if (userId) {
        await tx.notification.create({
          data: {
            userId,
            orderCode: order.code,
            title: `Đặt hàng thành công: ${order.code}`,
            message: `Đơn hàng ${order.code} đã được tiếp nhận và đang ở trạng thái Chờ xác nhận.`,
          },
        });
      }

      return order;
    });
  }

  async findAll(filter: FilterOrderDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (filter.search) {
      where.OR = [
        { code: { contains: filter.search, mode: 'insensitive' } },
        { customerName: { contains: filter.search, mode: 'insensitive' } },
        { customerPhone: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.status) {
      where.status = filter.status;
    }

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: true,
          statusHistory: {
            orderBy: { changedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: items.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingFee: Number(o.shippingFee),
        total: Number(o.total),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCode(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { code },
      include: {
        items: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng có mã: ${code}`);
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: Number(order.discountAmount || 0),
      total: Number(order.total),
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discountAmount: Number(order.discountAmount || 0),
      total: Number(order.total),
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, changedBy?: string) {
    const order = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Nếu hủy đơn hàng mà trước đó chưa hủy -> Hoàn trả tồn kho
      if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              change: item.quantity,
              reason: InventoryChangeReason.RETURN,
              refId: `CANCEL_${order.code}`,
            },
          });
        }
      }

      // Cập nhật trạng thái
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          trackingCode: dto.trackingCode !== undefined ? dto.trackingCode : order.trackingCode,
        },
      });

      // Ghi nhận lịch sử thay đổi
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: dto.status,
          changedBy: changedBy || null,
          note: dto.note || `Chuyển trạng thái sang ${dto.status}`,
        },
      });

      let targetUserId = order.userId;
      if (!targetUserId && order.customerEmail) {
        const matchedUser = await tx.user.findUnique({
          where: { email: order.customerEmail },
        });
        if (matchedUser) targetUserId = matchedUser.id;
      }

      if (targetUserId) {
        const statusTitleMap: Record<string, string> = {
          PENDING: 'Chờ xác nhận',
          CONFIRMED: 'Đã xác nhận & Đang giao hàng',
          PACKING: 'Đang đóng gói & Giao hàng',
          SHIPPING: 'Đơn hàng đang được giao',
          COMPLETED: 'Giao hàng hoàn thành',
          CANCELLED: 'Đơn hàng đã bị hủy',
          RETURNED: 'Đơn hàng hoàn trả',
        };
        const statusLabel = statusTitleMap[dto.status] || dto.status;
        const trackingInfo = dto.trackingCode ? ` (Mã vận đơn: ${dto.trackingCode})` : '';

        await tx.notification.create({
          data: {
            userId: targetUserId,
            orderCode: order.code,
            title: `Đơn ${order.code}: ${statusLabel}`,
            message:
              (dto.note ? `${dto.note}` : `Đơn hàng ${order.code} đã chuyển sang bước: ${statusLabel}`) +
              trackingInfo,
          },
        });
      }

      return updated;
    });
  }

  async findMyOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                grade: true,
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      shippingFee: Number(o.shippingFee),
      discountAmount: Number(o.discountAmount || 0),
      total: Number(o.total),
      items: o.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        unitCost: Number(i.unitCost),
        totalPrice: Number(i.unitPrice) * i.quantity,
        productImage: i.product?.images[0]?.url || null,
        productSlug: i.product?.slug || null,
        productGrade: i.product?.grade || null,
      })),
    }));
  }

  async cancelMyOrder(id: string, userId: string, reason?: string) {
    const order = await this.findOne(id);

    if (order.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xác nhận');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { increment: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: item.quantity,
            reason: InventoryChangeReason.RETURN,
            refId: `CANCEL_${order.code}`,
          },
        });
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: OrderStatus.CANCELLED,
          changedBy: userId,
          note: reason || 'Khách hàng chủ động hủy đơn hàng',
        },
      });

      await tx.notification.create({
        data: {
          userId,
          orderCode: order.code,
          title: `Đã hủy đơn hàng: ${order.code}`,
          message: `Bạn đã hủy đơn hàng ${order.code} thành công. Số lượng mô hình đã được hoàn lại kho.`,
        },
      });

      return updated;
    });
  }

  async getMyNotifications(userId: string) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, unreadCount };
  }

  async markNotificationRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

