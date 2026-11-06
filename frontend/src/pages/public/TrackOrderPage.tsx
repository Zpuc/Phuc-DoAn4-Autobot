import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Steps,
  Row,
  Col,
  Descriptions,
  Table,
  Tag,
  Alert,
  Breadcrumb,
  Spin,
  Timeline,
  Space,
} from 'antd';
import {
  SearchOutlined,
  HomeOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderHistory {
  id: string;
  status: string;
  note?: string;
  changedAt: string;
}

interface OrderDetail {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  trackingCode?: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderHistory[];
}

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get('code') || '');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      setSearched(true);
      const res: any = await apiClient.get(`/orders/track/${codeToSearch.trim().toUpperCase()}`);
      setOrder(res);
      setSearchParams({ code: codeToSearch.trim().toUpperCase() });
    } catch (err: any) {
      setOrder(null);
      setErrorMsg(err.message || 'Không tìm thấy đơn hàng với mã này');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      fetchOrder(code);
    }
  }, []);

  const getStepCurrent = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PACKING':
        return 2;
      case 'SHIPPING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Tra cứu tình trạng đơn hàng' },
        ]}
      />

      <Card style={{ borderRadius: 12, marginBottom: 24, textAlign: 'center', padding: '16px 8px' }}>
        <Title level={2} style={{ margin: '0 0 8px 0' }}>
          Tra Cứu Tiến Độ Đơn Hàng Gunpla
        </Title>
        <Paragraph type="secondary" style={{ maxWidth: 600, margin: '0 auto 24px auto' }}>
          Nhập mã đơn hàng bạn nhận được lúc đặt (Ví dụ: <strong>AG-261106-001</strong>) để theo dõi trạng thái đóng gói, mã vận đơn và lộ trình giao nhận.
        </Paragraph>

        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <Input.Search
            placeholder="Nhập mã đơn hàng (Ví dụ: AG-261106-001)"
            enterButton="Tra Cứu"
            size="large"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            onSearch={() => fetchOrder(orderCode)}
            loading={loading}
          />
        </div>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tra cứu cơ sở dữ liệu đơn hàng...</p>
        </div>
      )}

      {errorMsg && (
        <Alert
          type="error"
          message={errorMsg}
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      {order && !loading && (
        <div>
          {/* Thông báo nếu đơn bị hủy */}
          {order.status === 'CANCELLED' && (
            <Alert
              type="error"
              showIcon
              message="Đơn hàng này đã bị hủy"
              description="Đơn hàng đã được ghi nhận hủy và tồn kho đã được hoàn lại. Nếu cần hỗ trợ, vui lòng liên hệ hotline shop."
              style={{ marginBottom: 20 }}
            />
          )}

          {/* Tiến trình đơn hàng (Steps) */}
          {order.status !== 'CANCELLED' && (
            <Card style={{ borderRadius: 12, marginBottom: 24 }}>
              <Steps
                current={getStepCurrent(order.status)}
                items={[
                  {
                    title: 'Chờ xác nhận',
                    description: 'Shop đang xử lý',
                    icon: <ClockCircleOutlined />,
                  },
                  {
                    title: 'Đã xác nhận',
                    description: 'Gọi/Zalo khách',
                    icon: <CheckCircleOutlined />,
                  },
                  {
                    title: 'Đang đóng gói',
                    description: 'Bọc xốp 3 lớp',
                    icon: <InboxOutlined />,
                  },
                  {
                    title: 'Đang giao hàng',
                    description: order.trackingCode ? `Mã: ${order.trackingCode}` : 'Bàn giao shipper',
                    icon: <CarOutlined />,
                  },
                  {
                    title: 'Hoàn thành',
                    description: 'Đã nhận hàng',
                    icon: <CheckCircleOutlined />,
                  },
                ]}
              />

              {order.trackingCode && (
                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <Tag color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                    Mã vận đơn bưu cục (GHN/GHTK): <strong>{order.trackingCode}</strong>
                  </Tag>
                </div>
              )}
            </Card>
          )}

          {/* Chi tiết người nhận & Đơn hàng */}
          <Row gutter={[20, 20]}>
            <Col xs={24} md={14}>
              <Card title="Chi Tiết Đơn Hàng" style={{ borderRadius: 12, height: '100%' }}>
                <Descriptions column={1} size="small" bordered style={{ marginBottom: 20 }}>
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text copyable strong style={{ color: '#e53935' }}>
                      {order.code}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người nhận">
                    <strong>{order.customerName}</strong> ({order.customerPhone})
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ giao hàng">
                    {order.shippingAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hình thức thanh toán">
                    <Tag color={order.paymentMethod === 'COD' ? 'orange' : 'green'}>
                      {order.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian đặt">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  {order.note && (
                    <Descriptions.Item label="Ghi chú khách hàng">
                      {order.note}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Title level={5} style={{ marginBottom: 12 }}>
                  Danh Sách Mô Hình Đặt Mua
                </Title>
                <Table
                  dataSource={order.items}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Tên mô hình',
                      dataIndex: 'productName',
                      key: 'name',
                    },
                    {
                      title: 'Số lượng',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 80,
                      render: (q) => `x${q}`,
                    },
                    {
                      title: 'Đơn giá',
                      dataIndex: 'unitPrice',
                      key: 'price',
                      render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
                    },
                    {
                      title: 'Thành tiền',
                      key: 'total',
                      render: (_, r) =>
                        `${(Number(r.unitPrice) * r.quantity).toLocaleString('vi-VN')} đ`,
                    },
                  ]}
                />

                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <p>Tạm tính: <strong>{order.subtotal.toLocaleString('vi-VN')} đ</strong></p>
                  <p>Phí vận chuyển: <strong>{order.shippingFee.toLocaleString('vi-VN')} đ</strong></p>
                  <p style={{ fontSize: 18, color: '#e53935' }}>
                    Tổng tiền: <strong>{order.total.toLocaleString('vi-VN')} đ</strong>
                  </p>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={10}>
              <Card title="Lịch Sử Cập Nhật Đơn Hàng" style={{ borderRadius: 12, height: '100%' }}>
                <Timeline
                  mode="left"
                  items={order.statusHistory.map((hist) => ({
                    label: new Date(hist.changedAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    children: (
                      <div>
                        <Tag color="blue">{hist.status}</Tag>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {hist.note || 'Cập nhật trạng thái'}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(hist.changedAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

