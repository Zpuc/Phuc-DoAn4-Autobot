import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Coupons - Mã giảm giá Gunpla')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiOperation({ summary: 'Khách hàng áp dụng / kiểm tra mã giảm giá khi thanh toán' })
  @Post('apply')
  applyCoupon(@Body() dto: ApplyCouponDto) {
    return this.couponsService.applyCoupon(dto);
  }

  @ApiOperation({ summary: 'Danh sách các mã voucher đang hoạt động' })
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin lấy toàn bộ danh sách mã voucher (kể cả đã tắt)' })
  @Get('admin')
  findAllAdmin() {
    return this.couponsService.findAllAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin bật / tắt trạng thái mã voucher' })
  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.couponsService.toggleActive(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin tạo mã voucher mới' })
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xóa mã voucher' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
