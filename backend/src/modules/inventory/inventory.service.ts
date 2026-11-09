import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ImportStockDto } from './dto/import-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { FilterInventoryDto } from './dto/filter-inventory.dto';
import { InventoryChangeReason, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventoryOverview() {
    const [allInventory, lowStockCount, outOfStockCount] = await Promise.all([
      this.prisma.inventory.aggregate({
        _sum: { quantity: true },
        _count: { productId: true },
        where: { product: { deletedAt: null } },
      }),
      this.prisma.inventory.count({
        where: {
          quantity: { lte: 2, gt: 0 },
          product: { deletedAt: null },
        },
      }),
      this.prisma.inventory.count({
        where: {
          quantity: { lte: 0 },
          product: { deletedAt: null },
        },
      }),
    ]);

    return {
      totalBoxes: allInventory._sum.quantity || 0,
      totalTrackedProducts: allInventory._count.productId || 0,
      lowStockCount,
      outOfStockCount,
    };
  }

  async findAll(filter: FilterInventoryDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 15;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.warningOnly) {
      where.inventory = {
        quantity: { lte: 2 },
      };
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          inventory: true,
          prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
        },
        orderBy: {
          inventory: { quantity: 'asc' },
        },
      }),
    ]);

    const items = products.map((p) => {
      const qty = p.inventory?.quantity ?? 0;
      const minStock = p.inventory?.minStock ?? 2;
      const currentPrice = p.prices[0] ? Number(p.prices[0].price) : 0;
      const costPrice = p.prices[0] ? Number(p.prices[0].costPrice) : 0;

      let stockStatus: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'OK';
      if (qty <= 0) stockStatus = 'OUT_OF_STOCK';
      else if (qty <= minStock) stockStatus = 'LOW_STOCK';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        grade: p.grade,
        scale: p.scale,
        brand: p.brand?.name || 'N/A',
        category: p.category?.name || 'N/A',
        imageUrl: p.images[0]?.url || null,
        quantity: qty,
        minStock,
        currentPrice,
        costPrice,
        stockStatus,
        updatedAt: p.inventory?.updatedAt || p.updatedAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async importStock(dto: ImportStockDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, deletedAt: null },
      include: {
        inventory: true,
        prices: { orderBy: { effectiveFrom: 'desc' }, take: 1 },
      },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm cần nhập hàng');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Tăng tồn kho
      const updatedInventory = await tx.inventory.upsert({
        where: { productId: dto.productId },
        update: {
          quantity: { increment: dto.quantity },
        },
        create: {
          productId: dto.productId,
          quantity: dto.quantity,
          minStock: 2,
        },
      });

      // 2. Ghi vết nhật ký biến động kho
      const log = await tx.inventoryLog.create({
        data: {
          productId: dto.productId,
          change: dto.quantity,
          reason: InventoryChangeReason.IMPORT,
          refId: dto.note || `IMPORT_MANUAL_${new Date().toISOString().slice(0, 10)}`,
        },
      });

      // 3. Nếu có cập nhật giá vốn nhập đợt này
      if (dto.unitCost !== undefined) {
        const latestPrice = product.prices[0];
        const currentSellPrice = latestPrice ? Number(latestPrice.price) : 0;
        await tx.productPrice.create({
          data: {
            productId: dto.productId,
            price: currentSellPrice,
            costPrice: dto.unitCost,
            note: dto.note || 'Cập nhật giá vốn đợt nhập hàng',
          },
        });
      }

      return {
        message: `Đã nhập thêm ${dto.quantity} hộp vào kho thành công`,
        currentQuantity: updatedInventory.quantity,
        logId: log.id,
      };
    });
  }

  async adjustStock(dto: AdjustStockDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, deletedAt: null },
      include: { inventory: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm cần điều chỉnh kho');
    }

    const currentQty = product.inventory?.quantity ?? 0;
    const diff = dto.actualQuantity - currentQty;

    return this.prisma.$transaction(async (tx) => {
      // Cập nhật tồn kho thực tế
      const updatedInventory = await tx.inventory.upsert({
        where: { productId: dto.productId },
        update: {
          quantity: dto.actualQuantity,
        },
        create: {
          productId: dto.productId,
          quantity: dto.actualQuantity,
          minStock: 2,
        },
      });

      // Ghi vết nhật ký kiểm kê
      const log = await tx.inventoryLog.create({
        data: {
          productId: dto.productId,
          change: diff,
          reason: dto.reason || InventoryChangeReason.ADJUST,
          refId: dto.note || `AUDIT_${new Date().toISOString().slice(0, 10)}`,
        },
      });

      return {
        message: `Đã cập nhật tồn kho về ${dto.actualQuantity} hộp (Biến động: ${diff > 0 ? '+' : ''}${diff})`,
        currentQuantity: updatedInventory.quantity,
        logId: log.id,
      };
    });
  }

  async getLogs(productId?: string, limit: number = 30) {
    const where: Prisma.InventoryLogWhereInput = {};
    if (productId) {
      where.productId = productId;
    }

    const logs = await this.prisma.inventoryLog.findMany({
      where,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            grade: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }
}
