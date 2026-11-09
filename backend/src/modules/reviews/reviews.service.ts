import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy mô hình Gundam này');
    }

    const reviews = await this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const total = reviews.length;
    let average = 5.0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (total > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rating = Math.min(5, Math.max(1, r.rating));
        breakdown[rating as keyof typeof breakdown]++;
        return acc + r.rating;
      }, 0);
      average = Number((sum / total).toFixed(1));
    }

    return {
      productId,
      stats: {
        total,
        average,
        breakdown,
      },
      reviews,
    };
  }

  async create(dto: CreateReviewDto, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy mô hình Gundam để đánh giá');
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Điểm đánh giá phải từ 1 đến 5 sao');
    }

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId: userId || null,
        userName: dto.userName.trim(),
        userEmail: dto.userEmail?.trim() || null,
        rating: dto.rating,
        title: dto.title?.trim() || null,
        comment: dto.comment.trim(),
        gradeTag: dto.gradeTag || product.grade || 'Gunpla',
      },
    });
  }

  async like(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Không tìm thấy nhận xét này');
    }

    return this.prisma.review.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
  }

  async remove(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Không tìm thấy nhận xét');
    }

    return this.prisma.review.delete({ where: { id } });
  }
}
