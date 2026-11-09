import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { ImportStockDto } from './dto/import-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { FilterInventoryDto } from './dto/filter-inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Inventory - Quản lý Kho & Tồn Kho Gunpla')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Tổng quan tồn kho (Tổng số hộp, cảnh báo sắp hết hàng)' })
  @Get('overview')
  getOverview() {
    return this.inventoryService.getInventoryOverview();
  }

  @ApiOperation({ summary: 'Danh sách tồn kho theo từng kit Gundam' })
  @Get()
  findAll(@Query() filter: FilterInventoryDto) {
    return this.inventoryService.findAll(filter);
  }

  @ApiOperation({ summary: 'Nhập hàng vào kho (tăng số lượng, ghi log & cập nhật giá vốn)' })
  @Post('import')
  importStock(@Body() dto: ImportStockDto) {
    return this.inventoryService.importStock(dto);
  }

  @ApiOperation({ summary: 'Kiểm kê / Điều chỉnh tồn kho thực tế' })
  @Post('adjust')
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }

  @ApiOperation({ summary: 'Xem lịch sử biến động kho (Nhập/Xuất/Đơn hàng/Kiểm kê)' })
  @Get('logs')
  getLogs(
    @Query('productId') productId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getLogs(productId, limit ? Number(limit) : 30);
  }
}
