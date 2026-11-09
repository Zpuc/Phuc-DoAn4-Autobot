import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'GUNDAM20K', description: 'Mã voucher viết hoa không dấu' })
  @IsString()
  @IsNotEmpty({ message: 'Mã voucher không được để trống' })
  code: string;

  @ApiProperty({ example: 'Giảm 20.000đ cho đơn từ 200k', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CouponType, default: CouponType.FIXED_AMOUNT })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 20000, description: 'Giá trị giảm (% hoặc số tiền VNĐ)' })
  @IsNumber()
  @Min(1)
  value: number;

  @ApiProperty({ example: 200000, description: 'Đơn hàng tối thiểu để áp dụng', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrder?: number;

  @ApiProperty({ example: 50000, description: 'Mức giảm tối đa (với loại PERCENT)', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscount?: number;

  @ApiProperty({ example: 100, description: 'Giới hạn số lượt dùng', default: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', required: false })
  @IsDateString()
  @IsOptional()
  validUntil?: string;
}

