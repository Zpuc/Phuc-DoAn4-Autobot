import 'dotenv/config';
import { PrismaClient, Role, ProductStatus, OrderStatus, PaymentMethod, InventoryChangeReason } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang khởi tạo dữ liệu mẫu phong phú (Seed Data v2) ---');

  // 1. Tạo Users mẫu
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin123@', salt);
  const staffPass = await bcrypt.hash('Staff123@', salt);
  const customerPass = await bcrypt.hash('Customer123@', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@autobot.vn' },
    update: {},
    create: {
      name: 'Quản Trị Viên Autobot',
      email: 'admin@autobot.vn',
      phone: '0901234567',
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@autobot.vn' },
    update: {},
    create: {
      name: 'Nhân Viên Kho Autobot',
      email: 'staff@autobot.vn',
      phone: '0909876543',
      passwordHash: staffPass,
      role: Role.STAFF,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@autobot.vn' },
    update: {},
    create: {
      name: 'Khách Hàng Thân Thiết',
      email: 'customer@autobot.vn',
      phone: '0912345678',
      passwordHash: customerPass,
      role: Role.CUSTOMER,
    },
  });

  console.log(`Đã tạo tài khoản: ${admin.email}, ${staff.email}, ${customer.email}`);

  // 2. Tạo Brands mẫu
  const brandsData = [
    { name: 'Bandai Namco', slug: 'bandai-namco', logoUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65' },
    { name: 'Daban Model', slug: 'daban-model', logoUrl: null },
    { name: 'Motor Nuclear', slug: 'motor-nuclear', logoUrl: null },
    { name: 'In Era+', slug: 'in-era-plus', logoUrl: null },
    { name: 'SNAA', slug: 'snaa', logoUrl: null },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap[b.slug] = created.id;
  }

  // 3. Tạo Categories mẫu
  const categoriesData = [
    { name: 'Gunpla High Grade (HG 1/144)', slug: 'hg-high-grade' },
    { name: 'Gunpla Real Grade (RG 1/144)', slug: 'rg-real-grade' },
    { name: 'Gunpla Master Grade (MG 1/100)', slug: 'mg-master-grade' },
    { name: 'Gunpla Perfect Grade (PG 1/60)', slug: 'pg-perfect-grade' },
    { name: 'Super Deformed (SD / BB Senshi)', slug: 'sd-gundam' },
    { name: 'Mô hình Kim loại / Metal Build', slug: 'metal-build' },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap[c.slug] = created.id;
  }

  // 4. Tạo Shipping Zones mẫu
  const existingZone = await prisma.shippingZone.findFirst();
  if (!existingZone) {
    await prisma.shippingZone.createMany({
      data: [
        {
          name: 'Nội thành TP.HCM (Giao hỏa tốc trong ngày)',
          districts: 'Quận 1, Quận 3, Quận 5, Quận 10, Phú Nhuận, Bình Thạnh',
          fee: 25000,
          isLocal: true,
        },
        {
          name: 'Ngoại thành TP.HCM (Giao nhanh 1-2 ngày)',
          districts: 'Quận 7, Quận 8, Quận 12, Bình Tân, Thủ Đức, Gò Vấp',
          fee: 35000,
          isLocal: true,
        },
        {
          name: 'Toàn quốc (Chuyển phát nhanh GHN/GHTK)',
          districts: 'Tất cả các tỉnh thành khác trên toàn quốc',
          fee: 45000,
          isLocal: false,
        },
      ],
    });
  }

  // 5. Danh sách 16 mẫu Gunpla đa dạng phân khúc
  const sampleProducts = [
    {
      name: 'MG 1/100 Freedom Gundam Ver. 2.0',
      slug: 'mg-1-100-freedom-gundam-ver-2-0',
      sku: 'BAN-MG-FREEDOM2',
      categoryId: categoryMap['mg-master-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'MG',
      scale: '1/100',
      series: 'Mobile Suit Gundam SEED',
      condition: 'NEW_SEAL',
      description: 'Mô hình MG 1/100 Freedom Gundam Ver. 2.0 huyền thoại của phi công Kira Yamato. Khung xương thế hệ mới, cánh mở bung hiệu ứng cực đẹp.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 1150000,
      costPrice: 850000,
      quantity: 12,
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'RG 1/144 Hi-Nu Gundam',
      slug: 'rg-1-144-hi-nu-gundam',
      sku: 'BAN-RG-HINU',
      categoryId: categoryMap['rg-real-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'RG',
      scale: '1/144',
      series: 'Mobile Suit Gundam: Beltorchika\'s Children',
      condition: 'NEW_SEAL',
      description: 'Một trong những mẫu RG xuất sắc nhất lịch sử Bandai. Fin Funnel tách rời linh hoạt, giáp trượt cơ khí đa tầng.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 1250000,
      costPrice: 920000,
      quantity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'HG 1/144 Gundam Aerial',
      slug: 'hg-1-144-gundam-aerial',
      sku: 'BAN-HG-AERIAL',
      categoryId: categoryMap['hg-high-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'HG',
      scale: '1/144',
      series: 'Mobile Suit Gundam: The Witch from Mercury',
      condition: 'NEW_SEAL',
      description: 'Cỗ máy chính của nữ phi công Suletta Mercury. GUND-BIT tách rời thành khiên hoặc gắn lên giáp biến hình.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 380000,
      costPrice: 280000,
      quantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'HG 1/144 Gundam Calibarn',
      slug: 'hg-1-144-gundam-calibarn',
      sku: 'BAN-HG-CALIBARN',
      categoryId: categoryMap['hg-high-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'HG',
      scale: '1/144',
      series: 'Mobile Suit Gundam: The Witch from Mercury',
      condition: 'NEW_SEAL',
      description: 'Mô hình chổi thần Broom Rifle hiệu ứng cầu vồng cực phẩm của series Witch from Mercury.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 490000,
      costPrice: 360000,
      quantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'PG 1/60 Gundam Exia Lighting Model',
      slug: 'pg-1-60-gundam-exia-lighting-model',
      sku: 'BAN-PG-EXIA-LED',
      categoryId: categoryMap['pg-perfect-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'PG',
      scale: '1/60',
      series: 'Mobile Suit Gundam 00',
      condition: 'NEW_SEAL',
      description: 'Đỉnh cao mô hình Perfect Grade với hệ thống dây dẫn LED đổi màu theo trạng thái GN Drive (Xanh lá -> Xanh ngọc -> Đỏ Trans-AM).',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 7800000,
      costPrice: 6200000,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'PG Unleashed 1/60 RX-78-2 Gundam',
      slug: 'pg-unleashed-1-60-rx-78-2',
      sku: 'BAN-PGU-RX78',
      categoryId: categoryMap['pg-perfect-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'PG',
      scale: '1/60',
      series: 'Universal Century',
      condition: 'NEW_SEAL',
      description: 'Cột mốc 40 năm Gunpla. 5 giai đoạn lắp ráp từ khung xương sơ khai đến giáp ngoài mạ kim loại và LED tích hợp.',
      status: ProductStatus.ACTIVE,
      isPreorder: true,
      price: 6500000,
      costPrice: 5200000,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'Motor Nuclear MN-Q05 Lữ Bố (LuBu & Xích Thố)',
      slug: 'motor-nuclear-mn-q05-lu-bu',
      sku: 'MN-MB-LUBU',
      categoryId: categoryMap['metal-build'],
      brandId: brandMap['motor-nuclear'],
      grade: 'Metal Build',
      scale: '1/72',
      series: 'Legend of Star General',
      condition: 'NEW_SEAL',
      description: 'Siêu phẩm mô hình khung kim loại đúc sẵn kèm ngựa chiến Xích Thố hoành tráng, vũ khí Phương Thiên Họa Kích hiệu ứng rực lửa.',
      status: ProductStatus.ACTIVE,
      isPreorder: true,
      price: 2450000,
      costPrice: 1950000,
      quantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'Motor Nuclear MN-Q02 Tào Nhân (CaoRen)',
      slug: 'motor-nuclear-mn-q02-cao-ren',
      sku: 'MN-MB-CAOREN',
      categoryId: categoryMap['metal-build'],
      brandId: brandMap['motor-nuclear'],
      grade: 'Metal Build',
      scale: '1/72',
      series: 'Legend of Star General',
      condition: 'NEW_SEAL',
      description: 'Mô hình robot hợp kim biến hình phượng hoàng lửa cánh vàng rực rỡ, kèm đế trưng bày và cánh hiệu ứng.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 2350000,
      costPrice: 1850000,
      quantity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'MG 1/100 Sazabi Ver. Ka',
      slug: 'mg-1-100-sazabi-ver-ka',
      sku: 'BAN-MG-SAZABI-KA',
      categoryId: categoryMap['mg-master-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'MG',
      scale: '1/100',
      series: 'Char\'s Counterattack',
      condition: 'NEW_SEAL',
      description: 'Tác phẩm để đời của nhà thiết kế Katoki Hajime. Chi tiết mở giáp cơ khí tinh vi, decal nước độc quyền.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 2200000,
      costPrice: 1750000,
      quantity: 6,
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'MG 1/100 Gundam Barbatos',
      slug: 'mg-1-100-gundam-barbatos',
      sku: 'BAN-MG-BARBATOS',
      categoryId: categoryMap['mg-master-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'MG',
      scale: '1/100',
      series: 'Iron-Blooded Orphans',
      condition: 'NEW_SEAL',
      description: 'Khung xương Gundam Frame hoàn chỉnh với các pít-tông mạ chrome chuyển động linh hoạt theo từng khớp cử động.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 1100000,
      costPrice: 820000,
      quantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'RG 1/144 God Gundam',
      slug: 'rg-1-144-god-gundam',
      sku: 'BAN-RG-GOD',
      categoryId: categoryMap['rg-real-grade'],
      brandId: brandMap['bandai-namco'],
      grade: 'RG',
      scale: '1/144',
      series: 'Mobile Fighter G Gundam',
      condition: 'NEW_SEAL',
      description: 'Biên độ cử động võ thuật đỉnh cao, có thể tạo mọi thế võ kungfu, Bakunetsu God Finger với hiệu ứng lửa.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 950000,
      costPrice: 710000,
      quantity: 7,
      imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=600&auto=format&fit=crop&q=60',
    },
    {
      name: 'SDCS Wing Gundam Zero EW',
      slug: 'sdcs-wing-gundam-zero-ew',
      sku: 'BAN-SD-WING0',
      categoryId: categoryMap['sd-gundam'],
      brandId: brandMap['bandai-namco'],
      grade: 'SD',
      scale: 'Non-scale',
      series: 'Endless Waltz',
      condition: 'NEW_SEAL',
      description: 'Dòng SD Cross Silhouette hỗ trợ nâng cấp khung xương cao ráo, đôi cánh thiên thần xòe rộng đẹp mắt.',
      status: ProductStatus.ACTIVE,
      isPreorder: false,
      price: 280000,
      costPrice: 200000,
      quantity: 18,
      imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&auto=format&fit=crop&q=60',
    },
  ];

  const createdProducts: any[] = [];
  for (const p of sampleProducts) {
    let prod = await prisma.product.findUnique({
      where: { slug: p.slug },
    });

    if (!prod) {
      prod = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          categoryId: p.categoryId,
          brandId: p.brandId,
          grade: p.grade,
          scale: p.scale,
          series: p.series,
          condition: p.condition,
          description: p.description,
          status: p.status,
          isPreorder: p.isPreorder,
        },
      });

      // Giá
      await prisma.productPrice.create({
        data: {
          productId: prod.id,
          price: p.price,
          costPrice: p.costPrice,
          note: 'Khởi tạo theo đợt nhập ban đầu',
        },
      });

      // Tồn kho
      await prisma.inventory.create({
        data: {
          productId: prod.id,
          quantity: p.quantity,
          minStock: 2,
        },
      });

      // Ảnh
      await prisma.productImage.create({
        data: {
          productId: prod.id,
          url: p.imageUrl,
          sortOrder: 0,
          isThumbnail: true,
        },
      });
    }
    createdProducts.push(prod);
  }

  // 6. Tạo một số đơn hàng mẫu để Dashboard hiển thị số liệu thực tế
  const existingOrdersCount = await prisma.order.count();
  if (existingOrdersCount === 0 && createdProducts.length >= 2) {
    const orderSample1 = await prisma.order.create({
      data: {
        code: 'AG-261106-001',
        customerName: 'Trần Văn Nam',
        customerPhone: '0988776655',
        customerEmail: 'namtran@gmail.com',
        shippingAddress: '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        shippingFee: 25000,
        subtotal: 2400000,
        total: 2425000,
        status: OrderStatus.COMPLETED,
        paymentMethod: PaymentMethod.COD,
        trackingCode: 'GHN-884920491',
        note: 'Giao giờ hành chính giúp mình',
        items: {
          create: [
            {
              productId: createdProducts[0].id,
              productName: createdProducts[0].name,
              quantity: 1,
              unitPrice: 1150000,
              unitCost: 850000,
            },
            {
              productId: createdProducts[1].id,
              productName: createdProducts[1].name,
              quantity: 1,
              unitPrice: 1250000,
              unitCost: 920000,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: 'Khách đặt đơn qua website' },
            { status: OrderStatus.CONFIRMED, note: 'Đã gọi điện chốt đơn với khách' },
            { status: OrderStatus.SHIPPING, note: 'Bàn giao shipper GHN' },
            { status: OrderStatus.COMPLETED, note: 'Khách đã nhận hàng và thanh toán COD' },
          ],
        },
      },
    });

    const orderSample2 = await prisma.order.create({
      data: {
        code: 'AG-261106-002',
        customerName: 'Hoàng Minh Quân',
        customerPhone: '0911223344',
        shippingAddress: '45 Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP.HCM',
        shippingFee: 35000,
        subtotal: 2450000,
        total: 2485000,
        status: OrderStatus.SHIPPING,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        trackingCode: 'GHTK-9920141',
        note: 'Bọc xốp kỹ tránh móp góc hộp',
        items: {
          create: [
            {
              productId: createdProducts[6]?.id || createdProducts[0].id,
              productName: createdProducts[6]?.name || createdProducts[0].name,
              quantity: 1,
              unitPrice: 2450000,
              unitCost: 1950000,
            },
          ],
        },
        statusHistory: {
          create: [
            { status: OrderStatus.PENDING, note: 'Khách đặt đơn' },
            { status: OrderStatus.CONFIRMED, note: 'Đã nhận chuyển khoản MB Bank' },
            { status: OrderStatus.PACKING, note: 'Đang bọc bóng khí chống va đập' },
            { status: OrderStatus.SHIPPING, note: 'Giao cho shipper GHTK' },
          ],
        },
      },
    });

    console.log(`Đã tạo đơn hàng mẫu: ${orderSample1.code}, ${orderSample2.code}`);
  }

  // 6. Tạo địa chỉ mẫu cho Customer
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  await prisma.address.createMany({
    data: [
      {
        userId: customer.id,
        receiverName: 'Khách Hàng Thân Thiết',
        phone: '0912345678',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        detailAddress: '123 Lê Duẩn, Căn hộ 4B',
        isDefault: true,
      },
      {
        userId: customer.id,
        receiverName: 'Khách Hàng Thân Thiết (Công ty)',
        phone: '0912345678',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 3',
        ward: 'Phường Võ Thị Sáu',
        detailAddress: '456 Nam Kỳ Khởi Nghĩa, Tòa nhà Bitexco',
        isDefault: false,
      },
    ],
  });

  // 7. Tạo mã giảm giá (Coupons) mẫu
  const sampleCoupons = [
    {
      code: 'AUTOBOT10',
      description: 'Giảm 10% tối đa 100.000đ cho đơn từ 300k',
      type: 'PERCENT' as any,
      value: 10,
      minOrder: 300000,
      maxDiscount: 100000,
      usageLimit: 500,
    },
    {
      code: 'GUNPLA50K',
      description: 'Giảm ngay 50.000đ trực tiếp cho đơn từ 500k',
      type: 'FIXED_AMOUNT' as any,
      value: 50000,
      minOrder: 500000,
      maxDiscount: 50000,
      usageLimit: 200,
    },
    {
      code: 'FREESHIP',
      description: 'Hỗ trợ 30.000đ phí vận chuyển cho đơn từ 200k',
      type: 'FIXED_AMOUNT' as any,
      value: 30000,
      minOrder: 200000,
      maxDiscount: 30000,
      usageLimit: 300,
    },
  ];

  for (const c of sampleCoupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  console.log(`Đã nạp ${sampleProducts.length} mô hình Gunpla, địa chỉ nhận hàng và 3 mã giảm giá!`);
  console.log('--- Hoàn tất nạp dữ liệu mẫu! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
