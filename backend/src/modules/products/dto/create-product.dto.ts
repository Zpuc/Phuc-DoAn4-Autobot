import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'MG 1/100 Freedom Gundam Ver 2.0' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @ApiProperty({ example: 'mg-1-100-freedom-gundam-ver-2-0' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @ApiProperty({ example: 'BAN-MG-FREEDOM2' })
  @IsString()
  @IsNotEmpty({ message: 'Mã SKU không được để trống' })
  sku: string;

  @ApiProperty({ example: 'UUID' })
  @IsUUID('4', { message: 'Category ID không hợp lệ' })
  categoryId: string;

  @ApiProperty({ example: 'UUID' })
  @IsUUID('4', { message: 'Brand ID không hợp lệ' })
  brandId: string;

  @ApiProperty({ example: 'MG', description: 'HG, RG, MG, PG, SD, Mega Size' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ example: '1/100', description: '1/144, 1/100, 1/60...' })
  @IsOptional()
  @IsString()
  scale?: string;

  @ApiProperty({ example: 'SEED', description: 'UC, SEED, 00, WFM...' })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiProperty({ example: 'NEW_SEAL', description: 'NEW_SEAL, DENTED_BOX, ASSEMBLED' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiProperty({ example: 'Mô hình Master Grade với biên độ cử động tuyệt đỉnh.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isPreorder?: boolean;

  @ApiProperty({ example: 1150000, description: 'Giá bán hiện tại (VND)' })
  @IsNumber()
  @Min(0, { message: 'Giá bán không được âm' })
  price: number;

  @ApiProperty({ example: 850000, description: 'Giá vốn nhập vào (VND)' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Giá vốn không được âm' })
  costPrice?: number;

  @ApiProperty({ example: 10, description: 'Số lượng tồn kho ban đầu' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  quantity?: number;

  @ApiProperty({ example: ['https://example.com/img1.jpg'], required: false })
  @IsOptional()
  images?: string[];
}

