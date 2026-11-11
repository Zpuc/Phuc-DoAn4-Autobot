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

  async findMyReviewedProducts(userId?: string, userEmail?: string) {
    if (!userId && !userEmail) {
      return { productIds: [] };
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ userEmail }] : []),
        ],
      },
      select: { productId: true },
    });

    const productIds = Array.from(new Set(reviews.map((r) => r.productId)));
    return { productIds };
  }

  async checkCanReview(productId: string, userId?: string, userEmail?: string) {
    if (!userId && !userEmail) {
      return {
        canReview: false,
        hasReviewed: false,
        hasCompletedOrder: false,
        reason: 'Vui lòng đăng nhập tài khoản để gửi đánh giá.',
      };
    }

    const existingReview = await this.prisma.review.findFirst({
      where: {
        productId,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ userEmail }] : []),
        ],
      },
      select: { id: true },
    });

    if (existingReview) {
      return {
        canReview: false,
        hasReviewed: true,
        hasCompletedOrder: true,
        reason: 'Tài khoản của bạn đã đánh giá mô hình này rồi.',
      };
    }

    const completedOrder = await this.prisma.order.findFirst({
      where: {
        status: 'COMPLETED',
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ customerEmail: userEmail }] : []),
        ],
        items: {
          some: { productId },
        },
      },
      select: { id: true },
    });

    if (!completedOrder) {
      return {
        canReview: false,
        hasReviewed: false,
        hasCompletedOrder: false,
        reason: 'Chỉ khách hàng đã mua và hoàn thành đơn hàng cho sản phẩm này mới có thể đánh giá.',
      };
    }

    return {
      canReview: true,
      hasReviewed: false,
      hasCompletedOrder: true,
    };
  }

  async create(dto: CreateReviewDto, userId?: string, authEmail?: string) {
    if (!userId) {
      throw new BadRequestException('Vui lòng đăng nhập tài khoản để gửi đánh giá sản phẩm');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy mô hình Gundam để đánh giá');
    }

    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Điểm đánh giá phải từ 1 đến 5 sao');
    }

    const emailToCheck = authEmail || dto.userEmail?.trim();
    const eligibility = await this.checkCanReview(dto.productId, userId, emailToCheck);
    if (!eligibility.canReview) {
      throw new BadRequestException(
        eligibility.reason || 'Bạn không đủ điều kiện đánh giá sản phẩm này',
      );
    }

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        userName: dto.userName.trim(),
        userEmail: emailToCheck || null,
        rating: dto.rating,
        title: dto.title?.trim() || null,
        comment: dto.comment.trim(),
        imageUrl: dto.imageUrl?.trim() || null,
        gradeTag: dto.gradeTag || product.grade || 'Gunpla',
      },
    });
  }

  async like(id: string, userId: string) {
    if (!userId) {
      throw new BadRequestException('Vui lòng đăng nhập tài khoản để bấm Hữu ích');
    }

    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Không tìm thấy nhận xét này');
    }

    const currentLikedUsers = review.likedUserIds || [];
    if (currentLikedUsers.includes(userId)) {
      throw new BadRequestException('Tài khoản của bạn đã bấm Hữu ích cho đánh giá này rồi');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        likes: { increment: 1 },
        likedUserIds: { push: userId },
      },
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

