import React from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, Button, Space, Alert } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  WarningOutlined,
  PlusOutlined,
  FilePdfOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const recentOrders = [
    {
      key: '1',
      code: 'AG-261106-001',
      customer: 'Nguyễn Văn Nam',
      total: 2450000,
      status: 'PENDING',
      date: '06/11/2026 14:20',
      payment: 'Chuyển khoản',
    },
    {
      key: '2',
      code: 'AG-261106-002',
      customer: 'Trần Minh Quang',
      total: 1250000,
      status: 'CONFIRMED',
      date: '06/11/2026 11:05',
      payment: 'COD',
    },
    {
      key: '3',
      code: 'AG-261105-008',
      customer: 'Lê Hoàng Long',
      total: 3600000,
      status: 'SHIPPING',
      date: '05/11/2026 16:45',
      payment: 'COD',
    },
    {
      key: '4',
      code: 'AG-261105-007',
      customer: 'Phạm Đức Duy',
      total: 1150000,
      status: 'COMPLETED',
      date: '05/11/2026 09:30',
      payment: 'Chuyển khoản',
    },
  ];

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (val: number) => <Text strong>{val.toLocaleString('vi-VN')} đ</Text>,
    },
    {
      title: 'Hình thức',
      dataIndex: 'payment',
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
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button size="small" type="link">
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Bảng Điều Khiển Tổng Quan
          </Title>
          <Text type="secondary">Số liệu kinh doanh cửa hàng Gundam AUTOBOT</Text>
        </div>

        <Space>
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
      <Alert
        message="Cảnh báo tồn kho"
        description="Có 3 sản phẩm đang ở mức tồn kho tối thiểu (MG Freedom Gundam 2.0, RG Hi-Nu, HG Aerial). Cần lên kế hoạch nhập hàng."
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 24 }}
        action={
          <Link to="/admin/inventory">
            <Button size="small" type="primary" ghost>
              Kiểm tra kho
            </Button>
          </Link>
        }
      />

      {/* Thống kê chỉ số */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Doanh Thu Tháng Này"
              value={48500000}
              precision={0}
              valueStyle={{ color: '#3f8600', fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ArrowUpOutlined style={{ color: '#3f8600' }} /> Tăng 18.5% so với tháng trước
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Đơn Hàng Mới (Chờ xử lý)"
              value={8}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              prefix={<ShoppingOutlined />}
              suffix="đơn"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cần gọi điện / Zalo xác nhận khách
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng Số Mẫu Gunpla"
              value={142}
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
          <Card bordered={false}>
            <Statistic
              title="Ước Tính Lãi Gộp"
              value={15200000}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tỉ suất lợi nhuận TB: 31.3%
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây */}
      <Card
        title="Đơn Đặt Hàng Mới Gần Đây"
        bordered={false}
        extra={
          <Link to="/admin/orders">
            <Button type="link">Xem toàn bộ đơn hàng →</Button>
          </Link>
        }
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

