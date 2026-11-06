import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders - Đơn hàng Gundam')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Khách hàng đặt hàng (Transaction trừ kho & tính tiền)' })
  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.id || undefined;
    return this.ordersService.createOrder(dto, userId);
  }

  @ApiOperation({ summary: 'Khách tra cứu đơn hàng theo Mã Đơn (Không cần đăng nhập)' })
  @Get('track/:code')
  findByCode(@Param('code') code: string) {
    return this.ordersService.findByCode(code);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Danh sách đơn hàng phía Quản trị (Admin / Staff)' })
  @Get()
  findAll(@Query() filter: FilterOrderDto) {
    return this.ordersService.findAll(filter);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Xem chi tiết đơn hàng theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (Confirmed, Packing, Shipping, Completed, Cancelled)' })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    const changedBy = req.user?.id;
    return this.ordersService.updateStatus(id, dto, changedBy);
  }
}

