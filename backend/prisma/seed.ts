import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang khởi tạo dữ liệu mẫu (Seed Data) ---');

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

  console.log(`Đã tạo người dùng: ${admin.email}, ${staff.email}, ${customer.email}`);

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
  console.log('Đã tạo các thương hiệu Gundam mẫu');

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
  console.log('Đã tạo các danh mục phân khúc Gunpla mẫu');

  // 4. Tạo Shipping Zones mẫu
  const existingZone = await prisma.shippingZone.findFirst();
  if (!existingZone) {
    await prisma.shippingZone.createMany({
      data: [
        {
          name: 'Nội thành TP.HCM (Giao hỏa tốc)',
          districts: 'Quận 1, Quận 3, Quận 5, Quận 10, Phú Nhuận, Bình Thạnh',
          fee: 25000,
          isLocal: true,
        },
        {
          name: 'Ngoại thành TP.HCM',
          districts: 'Quận 7, Quận 8, Quận 12, Bình Tân, Thủ Đức, Gò Vấp',
          fee: 35000,
          isLocal: true,
        },
        {
          name: 'Toàn quốc (Chuyển phát nhanh GHN/GHTK)',
          districts: 'Tất cả các tỉnh thành khác',
          fee: 45000,
          isLocal: false,
        },
      ],
    });
    console.log('Đã tạo các khu vực vận chuyển mẫu');
  }

  // 5. Tạo các sản phẩm Gundam mẫu
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
      quantity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=60',
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
  ];

  for (const p of sampleProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
    });

    if (!existing) {
      const created = await prisma.product.create({
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

      // Price
      await prisma.productPrice.create({
        data: {
          productId: created.id,
          price: p.price,
          costPrice: p.costPrice,
          note: 'Khởi tạo theo đợt nhập ban đầu',
        },
      });

      // Inventory
      await prisma.inventory.create({
        data: {
          productId: created.id,
          quantity: p.quantity,
          minStock: 2,
        },
      });

      // Image
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: p.imageUrl,
          sortOrder: 0,
          isThumbnail: true,
        },
      });
    }
  }

  console.log(`Đã nạp ${sampleProducts.length} sản phẩm Gundam mẫu.`);
  console.log('--- Khởi tạo dữ liệu mẫu hoàn tất! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
