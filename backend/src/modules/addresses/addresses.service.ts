import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async findMyAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      // Bỏ default của các địa chỉ cũ
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    } else {
      // Nếu là địa chỉ đầu tiên thì tự set default
      const count = await this.prisma.address.count({ where: { userId } });
      if (count === 0) {
        dto.isDefault = true;
      }
    }

    return this.prisma.address.create({
      data: {
        userId,
        receiverName: dto.receiverName,
        phone: dto.phone,
        province: dto.province,
        district: dto.district,
        ward: dto.ward,
        detailAddress: dto.detailAddress,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async update(userId: string, id: string, dto: Partial<CreateAddressDto>) {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy địa chỉ giao hàng');
    }

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  async setDefault(userId: string, id: string) {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy địa chỉ để xóa');
    }

    return this.prisma.address.delete({
      where: { id },
    });
  }
}
