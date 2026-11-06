import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuotationDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Báo giá phải có ít nhất một sản phẩm');
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const countToday = await this.prisma.quotation.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    });
    const quoteCode = `BG-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

    let totalAmount = 0;
    for (const item of dto.items) {
      totalAmount += Number(item.unitPrice) * Number(item.quantity);
    }

    // Hiệu lực 7 ngày
    const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.quotation.create({
      data: {
        code: quoteCode,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        validUntil,
        totalAmount,
        status: 'SENT',
        note: dto.note || null,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true, grade: true, scale: true },
            },
          },
        },
      },
    });
  }

  async findAll() {
    const list = await this.prisma.quotation.findMany({
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true, grade: true, scale: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((q) => ({
      ...q,
      totalAmount: Number(q.totalAmount),
      items: q.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
      })),
    }));
  }

  async findOne(id: string) {
    const q = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true, grade: true, scale: true },
            },
          },
        },
      },
    });

    if (!q) {
      throw new NotFoundException('Không tìm thấy báo giá');
    }

    return {
      ...q,
      totalAmount: Number(q.totalAmount),
      items: q.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
      })),
    };
  }
}

