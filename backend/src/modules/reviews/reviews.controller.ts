import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reviews - Đánh giá & Bình luận Gunpla')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Lấy toàn bộ nhận xét và điểm số của một mô hình Gundam' })
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách ID các sản phẩm mà tài khoản hiện tại đã đánh giá' })
  @Get('my-reviewed-products')
  getMyReviewedProducts(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    const userEmail = req.user?.email;
    return this.reviewsService.findMyReviewedProducts(userId, userEmail);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kiểm tra tài khoản hiện tại có đủ điều kiện đánh giá sản phẩm (đã mua hoàn thành & chưa đánh giá)' })
  @Get('can-review/:productId')
  canReview(@Param('productId') productId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    const userEmail = req.user?.email;
    return this.reviewsService.checkCanReview(productId, userId, userEmail);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gửi đánh giá và bình luận mô hình (Mỗi tài khoản chỉ đánh giá 1 lần / sản phẩm sau khi nhận hàng)' })
  @Post()
  create(@Body() dto: CreateReviewDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    const userEmail = req.user?.email;
    return this.reviewsService.create(dto, userId, userEmail);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thích (Hữu ích) một bình luận (Mỗi tài khoản chỉ bấm được 1 lần)' })
  @Post(':id/like')
  like(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.reviewsService.like(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Quản trị viên xóa bình luận vi phạm' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}

