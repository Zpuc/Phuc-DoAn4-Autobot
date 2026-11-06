import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Gunpla Master Grade (MG 1/100)' })
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  name: string;

  @ApiProperty({ example: 'mg-master-grade' })
  @IsString()
  @IsNotEmpty({ message: 'Slug không được để trống' })
  slug: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsUUID('4', { message: 'Parent ID phải là UUID hợp lệ' })
  parentId?: string;
}

