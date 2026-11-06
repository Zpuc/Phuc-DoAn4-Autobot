import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalProducts,
      ordersByStatus,
      completedOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      // Tổng số sản phẩm đang hoạt động
      this.prisma.product.count({ where: { deletedAt: null } }),

      // Thống kê đơn theo trạng thái
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Đơn hàng đã hoàn thành để tính doanh thu và lãi
      this.prisma.order.findMany({
        where: { status: OrderStatus.COMPLETED },
        include: { items: true },
      }),

      // Sản phẩm sắp hết hàng (tồn kho <= minStock)
      this.prisma.inventory.findMany({
        where: {
          quantity: { lte: 2 },
          product: { deletedAt: null },
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, grade: true },
          },
        },
        take: 10,
      }),

      // Đơn hàng gần nhất
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Tính tổng doanh thu và giá vốn
    let totalRevenue = 0;
    let totalCost = 0;

    for (const order of completedOrders) {
      totalRevenue += Number(order.subtotal);
      for (const item of order.items) {
        totalCost += Number(item.unitCost) * item.quantity;
      }
    }

    const grossProfit = totalRevenue - totalCost;

    // Định dạng số lượng đơn theo status
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PACKING: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      RETURNED: 0,
    };
    ordersByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.id;
    });

    return {
      totalProducts,
      totalOrders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      statusCounts,
      totalRevenue,
      totalCost,
      grossProfit,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((inv) => ({
        id: inv.productId,
        name: inv.product.name,
        sku: inv.product.sku,
        grade: inv.product.grade,
        quantity: inv.quantity,
      })),
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
    };
  }
}

