import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterInventoryDto {
  @ApiProperty({ required: false, description: 'Tìm theo tên mô hình, mã SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Chỉ lọc các mô hình sắp hết hàng hoặc hết hàng' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  warningOnly?: boolean;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 15;
}
