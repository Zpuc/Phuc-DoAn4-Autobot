import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @ApiProperty({ example: 'UUID-cua-product' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nguyễn Văn Gundam' })
  @IsString()
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  customerName: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  customerPhone: string;

  @ApiProperty({ example: 'khach@gmail.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  customerEmail?: string;

  @ApiProperty({ example: 'Số 12 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống' })
  shippingAddress: string;

  @ApiProperty({ example: 25000, description: 'Phí giao hàng theo khu vực' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number = 0;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.COD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Giao giờ hành chính, bọc kỹ hộp giúp em', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 'AUTOBOT10', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

