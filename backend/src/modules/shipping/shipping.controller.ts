import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping - Vận chuyển & Phí giao hàng')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @ApiOperation({ summary: 'Lấy danh sách các khu vực giao hàng và biểu phí' })
  @Get('zones')
  getZones() {
    return this.shippingService.getZones();
  }
}
