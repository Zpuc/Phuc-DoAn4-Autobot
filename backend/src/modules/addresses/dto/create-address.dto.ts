import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn Gundam', description: 'Tên người nhận' })
  @IsString()
  @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
  receiverName: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại nhận hàng' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @ApiProperty({ example: 'Tỉnh Hưng Yên' })
  @IsString()
  @IsNotEmpty({ message: 'Tỉnh/Thành phố không được để trống' })
  province: string;

  @ApiProperty({ example: 'Huyện Văn Giang' })
  @IsString()
  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  district: string;

  @ApiProperty({ example: 'Xã Phụng Công' })
  @IsString()
  @IsNotEmpty({ message: 'Phường/Xã không được để trống' })
  ward: string;

  @ApiProperty({ example: 'KĐT Ecopark, Căn hộ R102 Rừng Cọ' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  detailAddress: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
