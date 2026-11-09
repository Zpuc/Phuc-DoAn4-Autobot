import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Typography,
  Space,
  Button,
  Divider,
  Alert,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  RiseOutlined,
  ShoppingOutlined,
  WarningOutlined,
  PrinterOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  statusCounts: Record<string, number>;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  lowStockCount: number;
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    grade: string | null;
    quantity: number;
  }[];
  recentOrders: {
    id: string;
    code: string;
    customerName: string;
    customerPhone: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get('/reports/dashboard');
      setData(res);
    } catch {
      // bỏ qua lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tổng hợp báo cáo tài chính Gunpla..." />
      </div>
    );
  }

  const revenue = data?.totalRevenue || 0;
  const cost = data?.totalCost || 0;
  const profit = data?.grossProfit || 0;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';
  const totalOrders = data?.totalOrders || 0;
  const statusCounts = data?.statusCounts || {};

  const completedCount = statusCounts['COMPLETED'] || 0;
  const pendingCount = statusCounts['PENDING'] || 0;
  const confirmedCount = statusCounts['CONFIRMED'] || 0;
  const packingCount = statusCounts['PACKING'] || 0;
  const shippingCount = statusCounts['SHIPPING'] || 0;
  const cancelledCount = statusCounts['CANCELLED'] || 0;

  const completionRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;

  const lowStockColumns: ColumnsType<any> = [
    {
      title: 'Mô hình Gundam',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong>{name}</Text>
          <div>
            <Tag color="geekblue">{record.sku}</Tag>
            {record.grade && <Tag color="red">{record.grade}</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho thực tế',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      render: (qty: number) => (
        <Tag color={qty <= 0 ? 'error' : 'warning'} style={{ fontWeight: 'bold' }}>
          {qty <= 0 ? 'Hết hàng (0)' : `Còn ${qty} hộp`}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh
          </Title>
          <Text type="secondary">
            Số liệu thống kê thời gian thực từ các đơn hàng hoàn tất và tồn kho Gundam Autobot.
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
            Làm mới số liệu
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In báo cáo
          </Button>
        </Space>
      </div>

      {/* KPI Doanh thu & Lợi nhuận */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Tổng doanh thu thực tế"
              value={revenue}
              precision={0}
              suffix="đ"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: 24 }}
              prefix={<DollarOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Từ {completedCount} đơn hàng giao thành công
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Tổng giá vốn hàng bán (COGS)"
              value={cost}
              precision={0}
              suffix="đ"
              valueStyle={{ color: '#595959', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Chi phí nhập khẩu kits Gundam
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Lợi nhuận gộp (Gross Profit)"
              value={profit}
              precision={0}
              suffix="đ"
              valueStyle={{ color: profit >= 0 ? '#1677ff' : '#ff4d4f', fontWeight: 'bold', fontSize: 24 }}
              prefix={<RiseOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Doanh thu trừ đi giá vốn kit
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Tỉ suất lợi nhuận gộp"
              value={profitMargin}
              suffix="%"
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              Hiệu suất sinh lời trên mỗi hộp
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tình hình xử lý đơn hàng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ShoppingOutlined /> Tình Trạng Xử Lý Đơn Hàng
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text strong>Tỷ lệ hoàn thành đơn</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {completionRate}% ({completedCount}/{totalOrders} đơn)
                </Text>
              </div>
              <Progress percent={completionRate} strokeColor="#52c41a" status="active" />
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div style={{ padding: '12px', background: '#fafafa', borderRadius: 6, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chờ xác nhận
                  </Text>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>
                    {pendingCount}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: '12px', background: '#fafafa', borderRadius: 6, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Đã duyệt / Đóng gói
                  </Text>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>
                    {confirmedCount + packingCount}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: '12px', background: '#fafafa', borderRadius: 6, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Đang vận chuyển
                  </Text>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#13c2c2' }}>
                    {shippingCount}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '12px', background: '#f6ffed', borderRadius: 6, textAlign: 'center', border: '1px solid #b7eb8f' }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text strong style={{ color: '#52c41a' }}>
                      Giao thành công: {completedCount}
                    </Text>
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '12px', background: '#fff1f0', borderRadius: 6, textAlign: 'center', border: '1px solid #ffa39e' }}>
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <Text strong style={{ color: '#ff4d4f' }}>
                      Đã hủy: {cancelledCount}
                    </Text>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Cảnh báo kho */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#fa8c16' }} /> Cảnh Báo Tồn Kho Thấp (≤ 2 hộp)
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 8 }}
          >
            {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={data.lowStockProducts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Alert
                message="Tất cả các mô hình Gunpla đều đang đủ tồn kho an toàn"
                type="success"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
