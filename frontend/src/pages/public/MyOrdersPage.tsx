import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  Empty,
  Spin,
  Alert,
  Image,
  Breadcrumb,
  Popconfirm,
  message,
} from 'antd';
import {
  ShoppingOutlined,
  HomeOutlined,
  CarOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string | null;
}

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  trackingCode: string | null;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'orange' },
  CONFIRMED: { label: 'Đơn hàng đang được giao', color: 'purple' },
  PACKING: { label: 'Đơn hàng đang được giao', color: 'purple' },
  SHIPPING: { label: 'Đơn hàng đang được giao', color: 'purple' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
  RETURNED: { label: 'Hoàn trả hàng', color: 'default' },
};

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.get('/orders/my-orders');
      setOrders(data || []);
    } catch {
      // bỏ qua lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      await apiClient.patch(`/orders/${orderId}/cancel`, {
        reason: 'Khách hàng chủ động hủy đơn trên hệ thống',
      });
      message.success('Đã hủy đơn hàng và hoàn lại số lượng kho thành công');
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng này');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <Card style={{ borderRadius: 12, padding: '32px 20px' }}>
          <ShoppingOutlined style={{ fontSize: 48, color: '#e53935', marginBottom: 16 }} />
          <Title level={4}>Bạn cần đăng nhập để xem lịch sử đơn hàng</Title>
          <Paragraph type="secondary">
            Đăng nhập tài khoản Autobot Gundam để tra cứu toàn bộ đơn hàng và trạng thái vận chuyển của bạn.
          </Paragraph>
          <Space size={16} style={{ marginTop: 16 }}>
            <Button type="primary" size="large" onClick={() => navigate('/login')}>
              Đăng nhập ngay
            </Button>
            <Button size="large" onClick={() => navigate('/products')}>
              Xem danh mục sản phẩm
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '30px auto', padding: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Đơn hàng của tôi' },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Lịch Sử Mua Hàng
          </Title>
          <Text type="secondary">
            Tài khoản: <strong>{user?.name}</strong> ({user?.email})
          </Text>
        </div>

        <Button type="primary" onClick={() => navigate('/products')}>
          Tiếp tục mua sắm
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải lịch sử đơn hàng..." />
        </div>
      ) : orders.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 20px' }}>
          <Empty
            description={
              <div>
                <Title level={4}>Bạn chưa có đơn hàng nào</Title>
                <Text type="secondary">
                  Hãy khám phá hàng trăm mô hình Gundam chính hãng Bandai có sẵn tại kho!
                </Text>
              </div>
            }
          >
            <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>
              Khám phá Gunpla ngay
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {orders.map((order) => {
            const statusConfig = statusMap[order.status] || { label: order.status, color: 'default' };

            return (
              <Card
                key={order.id}
                bordered={false}
                style={{
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Header đơn */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingBottom: 16,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Space size={12} wrap>
                    <Text strong style={{ fontSize: 16 }}>
                      Mã đơn: <Text copyable style={{ color: '#e53935' }}>{order.code}</Text>
                    </Text>
                    <Tag color={statusConfig.color} style={{ fontSize: 13, padding: '2px 8px' }}>
                      {statusConfig.label}
                    </Tag>
                    {order.trackingCode && (
                      <Tag color="cyan">
                        <CarOutlined /> Vận đơn: {order.trackingCode}
                      </Tag>
                    )}
                  </Space>

                  <Space size={6}>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </Space>
                </div>

                {/* Danh sách items */}
                <div style={{ padding: '16px 0' }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '1px dashed #f5f5f5',
                      }}
                    >
                      <Space size={14} align="center">
                        <Image
                          src={item.productImage || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120'}
                          alt={item.productName}
                          width={52}
                          height={52}
                          style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                          fallback="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120"
                        />
                        <div>
                          <Text strong style={{ display: 'block', fontSize: 14 }}>
                            {item.productName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Số lượng: x{item.quantity}
                          </Text>
                        </div>
                      </Space>

                      <Text strong style={{ fontSize: 14 }}>
                        {item.totalPrice.toLocaleString('vi-VN')} đ
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Footer đơn */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                      Địa chỉ nhận: {order.shippingAddress}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Phí vận chuyển: {order.shippingFee.toLocaleString('vi-VN')} đ
                    </Text>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ marginRight: 8 }}>Tổng thanh toán:</Text>
                      <Text strong style={{ fontSize: 18, color: '#e53935' }}>
                        {order.total.toLocaleString('vi-VN')} đ
                      </Text>
                    </div>
                    {order.trackingCode && (
                      <div style={{ fontSize: 12, color: '#595959', marginBottom: 8 }}>
                        Đơn vị vận chuyển / Mã vận đơn: <Text strong style={{ color: '#13c2c2' }}>{order.trackingCode}</Text>
                      </div>
                    )}
                    <Space size={8} wrap>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<EnvironmentOutlined />}
                        onClick={() => navigate(`/track-order?code=${order.code}`)}
                      >
                        Xem lộ trình đơn hàng
                      </Button>
                      {order.status === 'PENDING' && (
                        <Popconfirm
                          title="Xác nhận hủy đơn hàng?"
                          description="Đơn hàng sẽ được hủy và hoàn lại số lượng vào kho."
                          onConfirm={() => handleCancelOrder(order.id)}
                          okText="Đồng ý hủy"
                          cancelText="Không"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            loading={cancellingId === order.id}
                          >
                            Hủy đơn hàng
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                </div>
              </Card>
            );
          })}
        </Space>
      )}
    </div>
  );
};
