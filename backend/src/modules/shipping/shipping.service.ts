import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async getZones() {
    return this.prisma.shippingZone.findMany({
      orderBy: { fee: 'asc' },
    });
  }
}

