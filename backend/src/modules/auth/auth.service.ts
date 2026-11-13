import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateToken(user.id, user.email, user.role);
    return {
      message: 'Đăng ký tài khoản thành công',
      user,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const accessToken = this.generateToken(user.id, user.email, user.role);
    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    return user;
  }

  async updateProfile(userId: string, dto: { name: string; phone?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Cập nhật thông tin thành công',
      user: updated,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async getUsersOverview() {
    const [totalUsers, adminCount, customerCount, allCompletedOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'COMPLETED', userId: { not: null } },
      }),
    ]);

    return {
      totalUsers,
      adminCount,
      customerCount,
      totalMemberSpent: Number(allCompletedOrders._sum.total) || 0,
    };
  }

  async findAllUsers(query: { search?: string; role?: Role; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              addresses: true,
            },
          },
          orders: {
            where: { status: 'COMPLETED' },
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const items = users.map((u) => {
      const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.total), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        ordersCount: u._count.orders,
        reviewsCount: u._count.reviews,
        addressesCount: u._count.addresses,
        totalSpent,
        rank:
          totalSpent >= 20000000
            ? 'VIP Kim Cương'
            : totalSpent >= 10000000
            ? 'VIP Vàng'
            : totalSpent >= 3000000
            ? 'Thành Viên Bạc'
            : 'Thành Viên Mới',
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(targetUserId: string, newRole: Role, currentAdminId: string) {
    if (targetUserId === currentAdminId && newRole !== Role.ADMIN) {
      throw new BadRequestException('Bạn không thể tự hạ quyền Admin của chính tài khoản mình');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return {
      message: `Đã cập nhật vai trò người dùng thành ${newRole}`,
      user: updated,
    };
  }

  private generateToken(userId: string, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}

