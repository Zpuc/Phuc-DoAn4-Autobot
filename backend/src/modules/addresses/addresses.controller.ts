import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Addresses - Sổ địa chỉ nhận hàng')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @ApiOperation({ summary: 'Lấy danh sách địa chỉ nhận hàng của người dùng đang đăng nhập' })
  @Get()
  findMyAddresses(@Request() req: any) {
    return this.addressesService.findMyAddresses(req.user.id);
  }

  @ApiOperation({ summary: 'Thêm địa chỉ nhận hàng mới' })
  @Post()
  create(@Request() req: any, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Cập nhật địa chỉ nhận hàng' })
  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.update(req.user.id, id, dto);
  }

  @ApiOperation({ summary: 'Đặt địa chỉ làm mặc định' })
  @Patch(':id/default')
  setDefault(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.setDefault(req.user.id, id);
  }

  @ApiOperation({ summary: 'Xóa địa chỉ nhận hàng' })
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.remove(req.user.id, id);
  }
}
