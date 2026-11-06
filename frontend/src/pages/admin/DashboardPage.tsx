import React, { useState, useEffect } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Alert,
  Spin,
} from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  WarningOutlined,
  PlusOutlined,
  FilePdfOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/reports/dashboard');
      setStats(res);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <Link to={`/admin/orders`}>
          <Text strong style={{ color: '#1890ff' }}>
            {text}
          </Text>
        </Link>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customer',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (val: number) => <Text strong>{Number(val).toLocaleString('vi-VN')} đ</Text>,
    },
    {
      title: 'Hình thức',
      dataIndex: 'paymentMethod',
      key: 'payment',
      render: (val: string) => <Tag color={val === 'COD' ? 'orange' : 'green'}>{val}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const map: Record<string, { color: string; label: string }> = {
          PENDING: { color: 'gold', label: 'Chờ xác nhận' },
          CONFIRMED: { color: 'blue', label: 'Đã xác nhận' },
          PACKING: { color: 'cyan', label: 'Đang đóng gói' },
          SHIPPING: { color: 'purple', label: 'Đang giao' },
          COMPLETED: { color: 'green', label: 'Hoàn thành' },
          CANCELLED: { color: 'red', label: 'Đã hủy' },
        };
        const item = map[status] || { color: 'default', label: status };
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
  ];

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue || 0;
  const grossProfit = stats?.grossProfit || 0;
  const pendingOrders = stats?.statusCounts?.PENDING || 0;
  const totalProducts = stats?.totalProducts || 0;
  const lowStockProducts = stats?.lowStockProducts || [];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Bảng Điều Khiển Tổng Quan
          </Title>
          <Text type="secondary">Số liệu kinh doanh cửa hàng Gundam AUTOBOT thời gian thực</Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchStats}>
            Cập nhật
          </Button>
          <Link to="/admin/products">
            <Button type="primary" icon={<PlusOutlined />} style={{ background: '#e53935' }}>
              Thêm Mô Hình Mới
            </Button>
          </Link>
          <Link to="/admin/quotations">
            <Button icon={<FilePdfOutlined />}>Tạo Báo Giá PDF</Button>
          </Link>
        </Space>
      </div>

      {/* Cảnh báo kho */}
      {lowStockProducts.length > 0 && (
        <Alert
          message={`Cảnh báo tồn kho (${lowStockProducts.length} mẫu sắp hết)`}
          description={
            <div>
              Các mẫu sau đang ở mức tồn kho tối thiểu:{' '}
              {lowStockProducts.map((p: any) => `${p.name} (còn ${p.quantity} hộp)`).join(', ')}.
            </div>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24, borderRadius: 8 }}
          action={
            <Link to="/admin/products">
              <Button size="small" type="primary" ghost>
                Nhập hàng
              </Button>
            </Link>
          }
        />
      )}

      {/* Thống kê chỉ số */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Tổng Doanh Thu Đã Thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#3f8600', fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#3f8600' }} /> Từ các đơn hàng hoàn tất
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Đơn Hàng Chờ Xử Lý"
              value={pendingOrders}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              suffix="đơn"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cần gọi điện / Zalo xác nhận
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Tổng Số Mẫu Gunpla"
              value={totalProducts}
              valueStyle={{ color: '#1890ff', fontWeight: 700 }}
              prefix={<AppstoreOutlined />}
              suffix="mã"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Bao gồm Bandai, Daban, Motor Nuclear
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title="Ước Tính Lãi Gộp"
              value={grossProfit}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Doanh thu trừ giá vốn thời điểm mua
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây */}
      <Card
        title="Đơn Đặt Hàng Gần Đây"
        bordered={false}
        style={{ borderRadius: 8 }}
        extra={
          <Link to="/admin/orders">
            <Button type="link">Xem toàn bộ đơn hàng →</Button>
          </Link>
        }
      >
        <Table
          columns={columns}
          dataSource={stats?.recentOrders || []}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};
