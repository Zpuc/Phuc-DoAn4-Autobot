import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Quotations - Báo giá theo yêu cầu')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @ApiOperation({ summary: 'Khách hàng / Admin tạo phiếu báo giá' })
  @Post()
  create(@Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({ summary: 'Danh sách các bản báo giá (Admin / Staff)' })
  @Get()
  findAll() {
    return this.quotationsService.findAll();
  }

  @ApiOperation({ summary: 'Xem chi tiết bản báo giá theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationsService.findOne(id);
  }
}

