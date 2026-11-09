import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ImportStockDto {
  @ApiProperty({ example: 'UUID-cua-product' })
  @IsUUID('4')
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @ApiProperty({ example: 10, description: 'Số lượng hộp nhập thêm' })
  @IsNumber()
  @Min(1, { message: 'Số lượng nhập phải lớn hơn 0' })
  quantity: number;

  @ApiProperty({ example: 850000, description: 'Giá vốn nhập đợt này (VND)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiProperty({ example: 'Nhập lô hàng Bandai tháng 11', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
