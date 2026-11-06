import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { InventoryChangeReason, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterProductDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
        { series: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    if (filter.brandId) {
      where.brandId = filter.brandId;
    }

    if (filter.grade) {
      where.grade = filter.grade;
    }

    if (filter.scale) {
      where.scale = filter.scale;
    }

    if (filter.series) {
      where.series = filter.series;
    }

    if (filter.isPreorder !== undefined) {
      where.isPreorder = filter.isPreorder;
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          inventory: { select: { quantity: true, minStock: true } },
          prices: {
            orderBy: { effectiveFrom: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Format current price
    const formattedItems = items.map((item) => {
      const currentPrice = item.prices[0] || null;
      return {
        ...item,
        currentPrice: currentPrice ? Number(currentPrice.price) : 0,
        costPrice: currentPrice ? Number(currentPrice.costPrice) : 0,
        quantity: item.inventory ? item.inventory.quantity : 0,
      };
    });

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        inventory: true,
        prices: {
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const currentPrice = product.prices[0] || null;
    return {
      ...product,
      currentPrice: currentPrice ? Number(currentPrice.price) : 0,
      costPrice: currentPrice ? Number(currentPrice.costPrice) : 0,
      quantity: product.inventory ? product.inventory.quantity : 0,
      priceHistory: product.prices.map((p) => ({
        id: p.id,
        price: Number(p.price),
        costPrice: Number(p.costPrice),
        effectiveFrom: p.effectiveFrom,
        note: p.note,
      })),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        inventory: true,
        prices: {
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    const currentPrice = product.prices[0] || null;
    return {
      ...product,
      currentPrice: currentPrice ? Number(currentPrice.price) : 0,
      costPrice: currentPrice ? Number(currentPrice.costPrice) : 0,
      quantity: product.inventory ? product.inventory.quantity : 0,
    };
  }

  async create(dto: CreateProductDto) {
    // 1. Kiểm tra unique slug và sku
    const existing = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { sku: dto.sku }],
      },
    });
    if (existing) {
      throw new ConflictException('Slug hoặc mã SKU này đã tồn tại trong hệ thống');
    }

    // 2. Transaction tạo product + price + inventory + images
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          sku: dto.sku,
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          grade: dto.grade,
          scale: dto.scale,
          series: dto.series,
          condition: dto.condition || 'NEW_SEAL',
          description: dto.description,
          status: dto.status || 'ACTIVE',
          isPreorder: dto.isPreorder ?? false,
        },
      });

      // Tạo dòng giá ban đầu trong product_prices
      await tx.productPrice.create({
        data: {
          productId: product.id,
          price: dto.price,
          costPrice: dto.costPrice || 0,
          note: 'Khởi tạo sản phẩm mới',
        },
      });

      // Khởi tạo bảng inventory
      const initialQty = dto.quantity || 0;
      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity: initialQty,
          minStock: 2,
        },
      });

      // Ghi log nhập kho nếu có số lượng ban đầu
      if (initialQty > 0) {
        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            change: initialQty,
            reason: InventoryChangeReason.IMPORT,
            refId: 'INIT_STOCK',
          },
        });
      }

      // Thêm ảnh nếu có
      if (dto.images && dto.images.length > 0) {
        await tx.productImage.createMany({
          data: dto.images.map((url, index) => ({
            productId: product.id,
            url,
            sortOrder: index,
            isThumbnail: index === 0,
          })),
        });
      }

      return product;
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // 1. Nếu có thay đổi giá bán hoặc giá vốn -> Ghi thêm 1 bản ghi vào lịch sử giá
      if (dto.price !== undefined || dto.costPrice !== undefined) {
        const latestPrice = await tx.productPrice.findFirst({
          where: { productId: id },
          orderBy: { effectiveFrom: 'desc' },
        });

        const newPrice = dto.price !== undefined ? dto.price : Number(latestPrice?.price || 0);
        const newCost =
          dto.costPrice !== undefined ? dto.costPrice : Number(latestPrice?.costPrice || 0);

        if (
          !latestPrice ||
          Number(latestPrice.price) !== newPrice ||
          Number(latestPrice.costPrice) !== newCost
        ) {
          await tx.productPrice.create({
            data: {
              productId: id,
              price: newPrice,
              costPrice: newCost,
              note: 'Cập nhật giá theo đợt',
            },
          });
        }
      }

      // 2. Nếu có cập nhật số lượng tồn kho trực tiếp
      if (dto.quantity !== undefined && dto.quantity !== product.quantity) {
        const diff = dto.quantity - product.quantity;
        await tx.inventory.update({
          where: { productId: id },
          data: { quantity: dto.quantity },
        });

        await tx.inventoryLog.create({
          data: {
            productId: id,
            change: diff,
            reason: InventoryChangeReason.ADJUST,
            refId: 'ADMIN_UPDATE',
          },
        });
      }

      // 3. Cập nhật thông tin sản phẩm
      return tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          sku: dto.sku,
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          grade: dto.grade,
          scale: dto.scale,
          series: dto.series,
          condition: dto.condition,
          description: dto.description,
          status: dto.status,
          isPreorder: dto.isPreorder,
        },
      });
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });
  }
}

