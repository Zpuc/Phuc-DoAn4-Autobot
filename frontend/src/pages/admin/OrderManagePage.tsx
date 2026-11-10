import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Typography,
  Modal,
  Form,
  message,
  Descriptions,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
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
  trackingCode?: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export const OrderManagePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');

  // Modal Đổi trạng thái
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Modal Xem chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res: any = await apiClient.get('/orders', { params });
      setOrders(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleOpenStatusModal = (record: Order) => {
    setSelectedOrder(record);
    form.resetFields();
    form.setFieldsValue({
      status: record.status,
      trackingCode: record.trackingCode || '',
      note: '',
    });
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await apiClient.patch(`/orders/${selectedOrder.id}/status`, {
        status: values.status,
        trackingCode: values.trackingCode || undefined,
        note: values.note || undefined,
      });

      message.success('Cập nhật trạng thái đơn hàng thành công');
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (record: Order) => {
    setDetailOrder(record);
    setIsDetailModalOpen(true);
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'gold', label: 'Chờ xác nhận' },
      CONFIRMED: { color: 'purple', label: 'Đơn hàng đang được giao' },
      PACKING: { color: 'purple', label: 'Đơn hàng đang được giao' },
      SHIPPING: { color: 'purple', label: 'Đơn hàng đang được giao' },
      COMPLETED: { color: 'green', label: 'Hoàn thành' },
      CANCELLED: { color: 'red', label: 'Đã hủy (Hoàn kho)' },
      RETURNED: { color: 'magenta', label: 'Trả hàng' },
    };
    const item = map[status] || { color: 'default', label: status };
    return <Tag color={item.color}>{item.label}</Tag>;
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'code',
      key: 'code',
      width: 155,
      render: (code: string) => (
        <Text copyable strong style={{ color: '#1890ff', whiteSpace: 'nowrap' }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Khách Hàng',
      key: 'customer',
      width: 210,
      render: (_: any, record: Order) => (
        <div style={{ minWidth: 180 }}>
          <Text strong style={{ display: 'block', whiteSpace: 'nowrap' }}>
            {record.customerName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            SĐT: {record.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'total',
      key: 'total',
      width: 135,
      render: (val: number) => (
        <Text strong style={{ color: '#e53935', whiteSpace: 'nowrap' }}>
          {Number(val).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: 'Hình Thức',
      dataIndex: 'paymentMethod',
      key: 'payment',
      width: 130,
      render: (val: string) => (
        <Tag color={val === 'COD' ? 'orange' : 'green'}>
          {val === 'COD' ? 'COD' : 'Chuyển khoản'}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 175,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Mã Vận Đơn',
      dataIndex: 'trackingCode',
      key: 'tracking',
      width: 135,
      render: (code: string) => (code ? <Tag color="geekblue">{code}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: 'Ngày Đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 115,
      render: (d: string) => (
        <span style={{ whiteSpace: 'nowrap' }}>{new Date(d).toLocaleDateString('vi-VN')}</span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 155,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ background: '#e53935' }}
            onClick={() => handleOpenStatusModal(record)}
          >
            Đổi trạng thái
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý Đơn Đặt Hàng Gunpla
            </Title>
            <Text type="secondary">
              Theo dõi đơn đặt hàng, cập nhật đóng gói và nhập mã vận đơn GHN/GHTK
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
              Làm mới danh sách
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchOrders();
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="SHIPPING">Đơn hàng đang được giao</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: (p) => setPage(p),
            showTotal: (totalCount) => `Tổng cộng ${totalCount} đơn hàng`,
          }}
        />
      </Card>

      {/* Modal Cập Nhật Trạng Thái Đơn Hàng */}
      <Modal
        title={`Cập Nhật Đơn Hàng: ${selectedOrder?.code}`}
        open={isStatusModalOpen}
        onOk={handleSaveStatus}
        onCancel={() => setIsStatusModalOpen(false)}
        confirmLoading={submitting}
        okText="Cập Nhật"
        cancelText="Đóng"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="status"
            label="Trạng thái tiến độ đơn hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái mới' }]}
          >
            <Select size="large">
              <Option value="PENDING">1. Chờ xác nhận</Option>
              <Option value="SHIPPING">2. Đơn hàng đang được giao</Option>
              <Option value="COMPLETED">3. Hoàn thành</Option>
              <Option value="CANCELLED">Hủy đơn (Tự động hoàn lại tồn kho)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="trackingCode"
            label="Mã vận đơn bưu cục (GHN / GHTK / ViettelPost)"
          >
            <Input prefix={<CarOutlined />} placeholder="Ví dụ: GHN-192837482" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú nội bộ cho lần cập nhật này">
            <Input.TextArea rows={2} placeholder="Ví dụ: Đã gọi điện Zalo chốt đơn với khách..." />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            message="Lưu ý cơ chế tồn kho"
            description="Khi chuyển trạng thái sang 'Đã hủy', hệ thống sẽ tự động hoàn trả số lượng mô hình về lại kho hàng và ghi nhật ký xuất nhập."
          />
        </Form>
      </Modal>

      {/* Modal Chi Tiết Đơn Hàng */}
      <Modal
        title={`Chi Tiết Đơn Hàng: ${detailOrder?.code}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {detailOrder && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã đơn">{detailOrder.code}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(detailOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {detailOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {detailOrder.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailOrder.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức">
                {detailOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn">
                {detailOrder.trackingCode || 'Chưa có'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Mô Hình Đặt Mua</Title>
            <Table
              dataSource={detailOrder.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Tên mô hình', dataIndex: 'productName' },
                { title: 'Số lượng', dataIndex: 'quantity', width: 80, render: (q) => `x${q}` },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
                },
                {
                  title: 'Thành tiền',
                  render: (_, r) =>
                    `${(Number(r.unitPrice) * r.quantity).toLocaleString('vi-VN')} đ`,
                },
              ]}
            />

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <p>Tạm tính: <strong>{Number(detailOrder.subtotal).toLocaleString('vi-VN')} đ</strong></p>
              <p>Phí ship: <strong>{Number(detailOrder.shippingFee).toLocaleString('vi-VN')} đ</strong></p>
              <Title level={4} style={{ color: '#e53935', margin: 0 }}>
                Tổng thanh toán: {Number(detailOrder.total).toLocaleString('vi-VN')} đ
              </Title>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

