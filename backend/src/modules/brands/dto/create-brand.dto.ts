import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Bandai Namco' })
  @IsString()
  @IsNotEmpty({ message: 'Tên hãng không được để trống' })
  name: string;

  @ApiProperty({ example: 'bandai-namco' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @ApiProperty({ example: 'https://example.com/bandai.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

