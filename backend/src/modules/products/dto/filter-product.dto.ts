import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterProductDto {
  @ApiProperty({ required: false, description: 'Từ khóa tìm kiếm (tên, sku)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Lọc theo Category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Lọc theo Brand ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ required: false, description: 'Phân khúc (HG, RG, MG, PG, SD...)' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ required: false, description: 'Tỉ lệ (1/144, 1/100, 1/60)' })
  @IsOptional()
  @IsString()
  scale?: string;

  @ApiProperty({ required: false, description: 'Vũ trụ/Series (UC, SEED, 00, WFM...)' })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiProperty({ required: false, description: 'Lọc hàng Pre-order' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPreorder?: boolean;

  @ApiProperty({ required: false, description: 'Giá tối thiểu (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ required: false, description: 'Giá tối đa (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ required: false, description: 'Sắp xếp: newest | price_asc | price_desc' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, description: 'Trang hiện tại (Mặc định 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số bản ghi mỗi trang (Mặc định 12)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 12;
}

