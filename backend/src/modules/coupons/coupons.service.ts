import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async applyCoupon(dto: ApplyCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã hết hạn áp dụng');
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      throw new BadRequestException('Mã giảm giá đã hết thời gian hiệu lực');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    const minOrder = Number(coupon.minOrder);
    if (dto.subtotal < minOrder) {
      throw new BadRequestException(
        `Đơn hàng cần đạt tối thiểu ${minOrder.toLocaleString('vi-VN')} đ để sử dụng mã này`,
      );
    }

    let discountAmount = 0;
    const value = Number(coupon.value);
    const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;

    if (coupon.type === CouponType.PERCENT) {
      discountAmount = Math.round((dto.subtotal * value) / 100);
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = Math.min(value, dto.subtotal);
    }

    return {
      valid: true,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      discountAmount,
      finalSubtotal: Math.max(0, dto.subtotal - discountAmount),
    };
  }

  async findAll() {
    const coupons = await this.prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map((c) => ({
      ...c,
      value: Number(c.value),
      minOrder: Number(c.minOrder),
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
    }));
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Mã giảm giá "${code}" đã tồn tại trên hệ thống`);
    }

    return this.prisma.coupon.create({
      data: {
        code,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        minOrder: dto.minOrder || 0,
        maxDiscount: dto.maxDiscount || null,
        usageLimit: dto.usageLimit || 100,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Không tìm thấy mã giảm giá');
    }

    return this.prisma.coupon.delete({ where: { id } });
  }
}
