import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Tag,
  Space,
  Input,
  Radio,
  Typography,
  Modal,
  Form,
  message,
  Row,
  Col,
  Timeline,
  Empty,
  Spin,
  Statistic,
  Badge,
} from 'antd';
import {
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  SendOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title, Text } = Typography;

interface OrderHistoryItem {
  id: string;
  status: string;
  note?: string;
  changedAt: string;
}

interface OrderProgressItem {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  total: number;
  status: string;
  paymentMethod: string;
  trackingCode?: string;
  createdAt: string;
  items: { id: string; productName: string; quantity: number }[];
  statusHistory?: OrderHistoryItem[];
}

const QUICK_NOTES: Record<string, string[]> = {
  PENDING: [
    'Đơn hàng đang chờ cửa hàng kiểm tra và xác nhận',
    'Đã liên hệ khách hàng xác nhận địa chỉ nhận hàng',
  ],
  SHIPPING: [
    'Đã đóng gói chống sốc 3 lớp, shipper đang trên đường giao đến bạn',
    'Đơn hàng đang vận chuyển tuyến nội vùng Hà Nội - Hưng Yên',
    'Shipper sắp giao tới địa chỉ, vui lòng chú ý điện thoại',
  ],
  COMPLETED: [
    'Giao hàng thành công, khách hàng đã nhận đủ hộp nguyên seal',
    'Đơn hàng đã hoàn tất thanh toán và bàn giao',
  ],
};

export const OrderProgressManagePage: React.FC = () => {
  const [orders, setOrders] = useState<OrderProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderProgressItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 50 };
      if (search.trim()) params.search = search.trim();
      const res: any = await apiClient.get('/orders', { params });
      setOrders(res.items || []);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách tiến độ đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const normalizeStepStatus = (status: string): 'PENDING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' => {
    if (status === 'PENDING') return 'PENDING';
    if (status === 'CONFIRMED' || status === 'PACKING' || status === 'SHIPPING') return 'SHIPPING';
    if (status === 'COMPLETED') return 'COMPLETED';
    return 'CANCELLED';
  };

  const getStepIndex = (status: string) => {
    const norm = normalizeStepStatus(status);
    if (norm === 'PENDING') return 0;
    if (norm === 'SHIPPING') return 1;
    if (norm === 'COMPLETED') return 2;
    return 0;
  };

  const handleOpenProgressModal = (order: OrderProgressItem, defaultNextStatus?: string) => {
    setSelectedOrder(order);
    const targetStatus = defaultNextStatus || normalizeStepStatus(order.status);
    form.setFieldsValue({
      status: targetStatus === 'CANCELLED' ? 'PENDING' : targetStatus,
      trackingCode: order.trackingCode || '',
      note:
        targetStatus === 'SHIPPING'
          ? 'Đơn hàng đã xuất kho và đang trên đường giao đến bạn'
          : targetStatus === 'COMPLETED'
            ? 'Giao hàng thành công, cảm ơn bạn đã ủng hộ Autobot Gundam'
            : 'Cập nhật tiến độ đơn hàng',
    });
    setIsModalOpen(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedOrder) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await apiClient.patch(`/orders/${selectedOrder.id}/status`, {
        status: values.status,
        trackingCode: values.trackingCode || undefined,
        note: values.note || undefined,
      });
      message.success(`Đã cập nhật tiến độ đơn ${selectedOrder.code} lên hệ thống cho khách hàng`);
      setIsModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật tiến độ');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = orders.filter((o) => normalizeStepStatus(o.status) === 'PENDING').length;
  const shippingCount = orders.filter((o) => normalizeStepStatus(o.status) === 'SHIPPING').length;
  const completedCount = orders.filter((o) => normalizeStepStatus(o.status) === 'COMPLETED').length;

  const filteredOrders = orders.filter((o) => {
    const norm = normalizeStepStatus(o.status);
    if (stageFilter === 'ALL') return norm !== 'CANCELLED';
    return norm === stageFilter;
  });

  const watchedStatus = Form.useWatch('status', form) || 'SHIPPING';

  return (
    <div>
      <Card style={{ marginBottom: 20, borderRadius: 10 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý & Cập Nhật Tiến Độ Giao Hàng
            </Title>
            <Text type="secondary">
              Điều phối 3 bước tiến độ (Chờ xác nhận → Đơn hàng đang được giao → Hoàn thành) hiển thị trực tiếp cho khách hàng
            </Text>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space>
              <Input
                placeholder="Tìm mã đơn, SĐT, tên khách..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchOrders}
                allowClear
                style={{ width: 230 }}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              hoverable
              onClick={() => setStageFilter('PENDING')}
              style={{
                borderRadius: 8,
                borderColor: stageFilter === 'PENDING' ? '#faad14' : undefined,
                background: '#fffbe6',
              }}
            >
              <Statistic
                title="Bước 1: Chờ xác nhận"
                value={pendingCount}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              hoverable
              onClick={() => setStageFilter('SHIPPING')}
              style={{
                borderRadius: 8,
                borderColor: stageFilter === 'SHIPPING' ? '#722ed1' : undefined,
                background: '#f9f0ff',
              }}
            >
              <Statistic
                title="Bước 2: Đơn hàng đang được giao"
                value={shippingCount}
                prefix={<CarOutlined style={{ color: '#722ed1' }} />}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              size="small"
              hoverable
              onClick={() => setStageFilter('COMPLETED')}
              style={{
                borderRadius: 8,
                borderColor: stageFilter === 'COMPLETED' ? '#52c41a' : undefined,
                background: '#f6ffed',
              }}
            >
              <Statistic
                title="Bước 3: Hoàn thành"
                value={completedCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                suffix="đơn"
              />
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <Radio.Group
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="ALL">Tất cả đơn đang hoạt động ({pendingCount + shippingCount + completedCount})</Radio.Button>
            <Radio.Button value="PENDING">1. Chờ xác nhận ({pendingCount})</Radio.Button>
            <Radio.Button value="SHIPPING">2. Đơn hàng đang được giao ({shippingCount})</Radio.Button>
            <Radio.Button value="COMPLETED">3. Hoàn thành ({completedCount})</Radio.Button>
          </Radio.Group>
        </div>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card style={{ borderRadius: 10, textAlign: 'center', padding: 40 }}>
          <Empty description="Không có đơn hàng nào ở bước tiến độ này" />
        </Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {filteredOrders.map((order) => {
            const norm = normalizeStepStatus(order.status);
            const currentStep = getStepIndex(order.status);
            const latestHistory = order.statusHistory?.[0];

            return (
              <Card
                key={order.id}
                style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <Row gutter={[20, 16]} align="middle">
                  <Col xs={24} lg={7}>
                    <Space size={8} wrap>
                      <Text strong copyable style={{ fontSize: 16, color: '#e53935' }}>
                        {order.code}
                      </Text>
                      {norm === 'PENDING' && <Tag color="gold">Chờ xác nhận</Tag>}
                      {norm === 'SHIPPING' && <Tag color="purple">Đơn hàng đang được giao</Tag>}
                      {norm === 'COMPLETED' && <Tag color="green">Hoàn thành</Tag>}
                    </Space>
                    <div style={{ marginTop: 6 }}>
                      <Text strong>{order.customerName}</Text> —{' '}
                      <Text type="secondary">
                        <PhoneOutlined /> {order.customerPhone}
                      </Text>
                    </div>
                    <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                      <EnvironmentOutlined /> {order.shippingAddress}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Sản phẩm ({order.items.length}):{' '}
                        {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </Text>
                    </div>
                  </Col>

                  <Col xs={24} lg={11}>
                    <Steps
                      size="small"
                      current={currentStep}
                      items={[
                        {
                          title: 'Chờ xác nhận',
                          icon: <ClockCircleOutlined />,
                        },
                        {
                          title: 'Đơn hàng đang được giao',
                          description: order.trackingCode ? `Mã: ${order.trackingCode}` : undefined,
                          icon: <CarOutlined />,
                        },
                        {
                          title: 'Hoàn thành',
                          icon: <CheckCircleOutlined />,
                        },
                      ]}
                    />
                    {latestHistory && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '6px 10px',
                          background: '#fafafa',
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      >
                        <Badge status="processing" />
                        <Text type="secondary">Cập nhật gần nhất: </Text>
                        <Text strong>{latestHistory.note || 'Khởi tạo đơn hàng'}</Text>{' '}
                        <Text type="secondary">
                          ({new Date(latestHistory.changedAt).toLocaleString('vi-VN')})
                        </Text>
                      </div>
                    )}
                  </Col>

                  <Col xs={24} lg={6} style={{ textAlign: 'right' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                      {norm === 'PENDING' && (
                        <Button
                          type="primary"
                          block
                          icon={<CarOutlined />}
                          style={{ background: '#722ed1', borderColor: '#722ed1' }}
                          onClick={() => handleOpenProgressModal(order, 'SHIPPING')}
                        >
                          Chuyển sang: Đang giao hàng
                        </Button>
                      )}
                      {norm === 'SHIPPING' && (
                        <Button
                          type="primary"
                          block
                          icon={<CheckCircleOutlined />}
                          style={{ background: '#52c41a', borderColor: '#52c41a' }}
                          onClick={() => handleOpenProgressModal(order, 'COMPLETED')}
                        >
                          Chuyển sang: Hoàn thành
                        </Button>
                      )}
                      <Button
                        block
                        icon={<SendOutlined />}
                        onClick={() => handleOpenProgressModal(order)}
                      >
                        Cập nhật tiến độ / Ghi chú
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      )}

      <Modal
        title={`Cập Nhật Tiến Độ Đơn Hàng: ${selectedOrder?.code}`}
        open={isModalOpen}
        onOk={handleSaveProgress}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText="Lưu & Đẩy Tiến Độ Cho Khách"
        cancelText="Đóng"
        width={620}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="status"
            label="Bước tiến độ hiển thị cho khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn bước tiến độ' }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="PENDING">
                  <Tag color="gold">Bước 1</Tag> <strong>Chờ xác nhận</strong> — Shop đang kiểm tra và xác nhận đơn
                </Radio>
                <Radio value="SHIPPING">
                  <Tag color="purple">Bước 2</Tag> <strong>Đơn hàng đang được giao</strong> — Đã xuất kho và đang giao tới khách
                </Radio>
                <Radio value="COMPLETED">
                  <Tag color="green">Bước 3</Tag> <strong>Hoàn thành</strong> — Khách hàng đã nhận hàng thành công
                </Radio>
                <Radio value="CANCELLED">
                  <Tag color="red"><CloseCircleOutlined /> Hủy đơn</Tag> <strong>Đã hủy (Tự động hoàn kho)</strong>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="trackingCode"
            label="Mã vận đơn / Thông tin Shipper (Hiển thị trên thanh tiến độ của khách)"
          >
            <Input
              prefix={<CarOutlined />}
              placeholder="Ví dụ: SHIP-HN-HY-01 hoặc GHN-8493021"
            />
          </Form.Item>

          <Form.Item
            name="note"
            label="Nội dung thông báo tiến độ (Sẽ hiển thị trên Lịch sử cập nhật của khách)"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung tiến độ để khách theo dõi' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập trạng thái cụ thể để khách hàng tra cứu thấy ngay..."
            />
          </Form.Item>

          {QUICK_NOTES[watchedStatus] && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                Chọn nhanh mẫu thông báo tiến độ:
              </Text>
              <Space wrap size={[6, 6]}>
                {QUICK_NOTES[watchedStatus].map((sample, idx) => (
                  <Tag
                    key={idx}
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => form.setFieldsValue({ note: sample })}
                  >
                    + {sample}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {selectedOrder?.statusHistory && selectedOrder.statusHistory.length > 0 && (
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 8 }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
                Lịch sử tiến độ đã cập nhật của đơn này:
              </Text>
              <Timeline
                items={selectedOrder.statusHistory.map((h) => ({
                  children: (
                    <div style={{ fontSize: 12 }}>
                      <Text strong>{h.note || h.status}</Text>{' '}
                      <Text type="secondary">({new Date(h.changedAt).toLocaleString('vi-VN')})</Text>
                    </div>
                  ),
                }))}
              />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};
