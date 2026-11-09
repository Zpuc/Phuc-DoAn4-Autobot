import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { InventoryChangeReason } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({ example: 'UUID-cua-product' })
  @IsUUID('4')
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @ApiProperty({ example: 8, description: 'Số lượng tồn kho thực tế sau khi kiểm kê' })
  @IsNumber()
  @Min(0, { message: 'Số lượng tồn kho không được âm' })
  actualQuantity: number;

  @ApiProperty({ enum: [InventoryChangeReason.ADJUST, InventoryChangeReason.RETURN], default: InventoryChangeReason.ADJUST })
  @IsOptional()
  @IsEnum(InventoryChangeReason)
  reason?: InventoryChangeReason = InventoryChangeReason.ADJUST;

  @ApiProperty({ example: 'Kiểm kê định kỳ phát hiện hỏng 1 hộp', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
