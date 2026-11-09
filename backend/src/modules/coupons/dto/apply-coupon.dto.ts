import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponDto {
  @ApiProperty({ example: 'AUTOBOT10', description: 'Mã giảm giá' })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mã giảm giá' })
  code: string;

  @ApiProperty({ example: 500000, description: 'Tạm tính tiền hàng (trước ship)' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}
