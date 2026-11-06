import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED })
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({ example: 'GHN-884920491', required: false })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiProperty({ example: 'Đã xác nhận qua điện thoại với khách', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

