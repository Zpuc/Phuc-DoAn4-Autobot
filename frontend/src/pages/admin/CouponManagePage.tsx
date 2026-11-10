import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Popconfirm,
  message,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DeleteOutlined,
  TagOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { couponApi, CouponItem, CreateCouponPayload } from '../../api/coupons';

const { Title, Text } = Typography;

export const CouponManagePage: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [couponType, setCouponType] = useState<'PERCENT' | 'FIXED_AMOUNT'>('FIXED_AMOUNT');
  const [form] = Form.useForm();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponApi.getAllAdmin();
      setCoupons(data);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách mã voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await couponApi.toggle(id);
      message.success(currentStatus ? 'Đã tạm dừng mã giảm giá' : 'Đã kích hoạt lại mã');
      fetchCoupons();
    } catch (err: any) {
      message.error(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await couponApi.delete(id);
      message.success('Đã xóa mã voucher thành công');
      fetchCoupons();
    } catch (err: any) {
      message.error(err.message || 'Không thể xóa mã');
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: CreateCouponPayload = {
        code: values.code.trim().toUpperCase(),
        description: values.description,
        type: values.type,
        value: values.value,
        minOrder: values.minOrder || 0,
        maxDiscount: values.type === 'PERCENT' ? values.maxDiscount : undefined,
        usageLimit: values.usageLimit || 100,
        validUntil: values.validUntil ? values.validUntil.toISOString() : null,
      };

      await couponApi.create(payload);
      message.success(`Đã tạo mã giảm giá "${payload.code}" thành công!`);
      setModalOpen(false);
      form.resetFields();
      fetchCoupons();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tạo mã giảm giá');
    } finally {
      setSubmitting(false);
    }
  };

  const totalActive = coupons.filter((c) => c.isActive).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const columns: ColumnsType<CouponItem> = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Tag color="red" style={{ fontSize: 13, fontWeight: 700, padding: '4px 8px' }}>
          <TagOutlined style={{ marginRight: 4 }} />
          {code}
        </Tag>
      ),
    },
    {
      title: 'Mô Tả & Điều Kiện',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string, record) => (
        <div>
          <Text strong>{desc || 'Không có mô tả'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Đơn tối thiểu: <strong>{record.minOrder.toLocaleString('vi-VN')} đ</strong>
          </Text>
        </div>
      ),
    },
    {
      title: 'Mức Giảm',
      dataIndex: 'value',
      key: 'value',
      render: (val: number, record) => (
        <div>
          {record.type === 'PERCENT' ? (
            <div>
              <Tag color="volcano">Giảm {val}%</Tag>
              {record.maxDiscount && (
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  Tối đa: {record.maxDiscount.toLocaleString('vi-VN')} đ
                </div>
              )}
            </div>
          ) : (
            <Tag color="green">Giảm {val.toLocaleString('vi-VN')} đ</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Lượt Sử Dụng',
      key: 'usage',
      render: (_, record) => (
        <Text>
          <strong>{record.usedCount}</strong> / {record.usageLimit} lượt
        </Text>
      ),
    },
    {
      title: 'Thời Hạn',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (date: string) => {
        if (!date) return <Tag color="blue">Vô thời hạn</Tag>;
        const isExpired = new Date() > new Date(date);
        return (
          <Tag color={isExpired ? 'error' : 'cyan'}>
            {isExpired ? 'Hết hạn: ' : 'Đến: '}
            {new Date(date).toLocaleDateString('vi-VN')}
          </Tag>
        );
      },
    },
    {
      title: 'Kích Hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<StopOutlined />}
          onChange={() => handleToggle(record.id, isActive)}
        />
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa mã giảm giá?"
          description={`Bạn có chắc muốn xóa vĩnh viễn mã "${record.code}"?`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger type="text" icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản Lý Mã Giảm Giá (Coupons)
          </Title>
          <Text type="secondary">
            Tạo và cấu hình các chương trình voucher khuyến mãi, giảm % hoặc giảm tiền trực tiếp
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCoupons} loading={loading}>
            Làm Mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setCouponType('FIXED_AMOUNT');
              setModalOpen(true);
            }}
            style={{ background: '#e53935' }}
          >
            Tạo Mã Voucher
          </Button>
        </Space>
      </div>

      {/* Thống kê nhanh */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng Số Mã Khuyến Mãi"
              value={coupons.length}
              prefix={<GiftOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Mã Đang Kích Hoạt"
              value={totalActive}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng Lượt Đã Áp Dụng"
              value={totalUsed}
              valueStyle={{ color: '#e53935' }}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal Tạo Mã Voucher */}
      <Modal
        title={
          <Space>
            <GiftOutlined style={{ color: '#e53935', fontSize: 20 }} />
            <span>Thêm Mới Mã Giảm Giá Gunpla</span>
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            type: 'FIXED_AMOUNT',
            usageLimit: 100,
            minOrder: 0,
          }}
        >
          <Form.Item
            name="code"
            label="Mã Voucher"
            rules={[
              { required: true, message: 'Vui lòng nhập mã voucher' },
              { pattern: /^[A-Z0-9_-]+$/, message: 'Mã chỉ gồm chữ in hoa, số và dấu gạch nối' },
            ]}
          >
            <Input
              placeholder="VD: AUTOBOT2026, GUNPLA100K"
              style={{ textTransform: 'uppercase', fontWeight: 700 }}
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả Hiển Thị"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả cho voucher' }]}
          >
            <Input placeholder="VD: Giảm 50k cho đơn hàng Gunpla từ 500.000đ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Loại Giảm Giá" required>
                <Select
                  onChange={(val) => setCouponType(val)}
                  options={[
                    { label: 'Số tiền cố định (VNĐ)', value: 'FIXED_AMOUNT' },
                    { label: 'Phần trăm (%)', value: 'PERCENT' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="value"
                label={couponType === 'PERCENT' ? 'Tỉ lệ giảm (%)' : 'Số tiền giảm (VNĐ)'}
                rules={[{ required: true, message: 'Vui lòng nhập mức giảm' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={couponType === 'PERCENT' ? 100 : 50000000}
                  placeholder={couponType === 'PERCENT' ? '10' : '50000'}
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          {couponType === 'PERCENT' && (
            <Form.Item name="maxDiscount" label="Mức Giảm Tối Đa (VNĐ)">
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="VD: 100000 (để trống nếu không giới hạn)"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minOrder" label="Đơn Hàng Tối Thiểu (VNĐ)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Số Lượt Dùng Tối Đa">
                <InputNumber style={{ width: '100%' }} min={1} placeholder="100" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="validUntil" label="Thời Hạn Hiệu Lực (để trống nếu vô hạn)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} style={{ background: '#e53935' }}>
                Tạo Voucher
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

