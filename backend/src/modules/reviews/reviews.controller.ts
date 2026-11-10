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

  @ApiOperation({ summary: 'Gửi đánh giá và bình luận mô hình (Khách hoặc Thành viên)' })
  @Post()
  create(@Body() dto: CreateReviewDto, @Req() req: any) {
    // Nếu có token gửi kèm thì trích xuất userId
    const userId = req.user?.id || req.user?.userId;
    return this.reviewsService.create(dto, userId);
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

