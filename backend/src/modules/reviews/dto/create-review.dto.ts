import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-product-id' })
  @IsString()
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  productId: string;

  @ApiProperty({ example: 5, description: 'Số sao từ 1 đến 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Tên người đánh giá không được để trống' })
  userName: string;

  @ApiProperty({ example: 'nguyenvana@gmail.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  userEmail?: string;

  @ApiProperty({ example: 'Kit sắc nét, runner không bị ba via', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Khớp rất chắc chắn, đóng gói có bóng xốp 3 lớp chống móp méo hộp.' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung nhận xét không được để trống' })
  comment: string;

  @ApiProperty({ example: 'RG 1/144', required: false })
  @IsOptional()
  @IsString()
  gradeTag?: string;
}
