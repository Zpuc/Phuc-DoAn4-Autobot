import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Nguyễn Văn Gundam', description: 'Họ và tên' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại liên hệ' })
  @IsString()
  @IsOptional()
  phone?: string;
}
