import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Radio,
  Button,
  Typography,
  Space,
  Divider,
  Result,
  Alert,
  message,
  Breadcrumb,
  Tag,
} from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  BankOutlined,
  DollarOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

interface ShippingZone {
  id: string;
  name: string;
  districts: string;
  fee: number;
  isLocal: boolean;
}

export const CheckoutPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);

  const subtotal = getTotalPrice();

  useEffect(() => {
    // Tải danh sách khu vực giao hàng
    apiClient
      .get('/shipping/zones')
      .then((res: any) => {
        setShippingZones(res || []);
        if (res && res.length > 0) {
          setSelectedZone(res[0]);
          form.setFieldsValue({ shippingZoneId: res[0].id });
        }
      })
      .catch(() => {});

    // Điền thông tin người dùng nếu đã đăng nhập
    if (user) {
      form.setFieldsValue({
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || '',
      });
    }
  }, [user, form]);

  const shippingFee = selectedZone ? Number(selectedZone.fee) : 0;
  const total = subtotal + shippingFee;

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      message.error('Giỏ hàng trống! Vui lòng chọn sản phẩm trước khi đặt hàng.');
      navigate('/products');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        shippingAddress: `${values.detailAddress}, Khu vực: ${selectedZone?.name || ''}`,
        shippingFee,
        paymentMethod: values.paymentMethod,
        note: values.note,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
      };

      const res: any = await apiClient.post('/orders', payload);
      setCreatedOrderCode(res.code);
      clearCart();
      message.success('Đặt hàng thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi gửi yêu cầu đặt hàng');
    } finally {
      setSubmitting(false);
    }
  };

  // Màn hình hoàn thành đặt hàng
  if (createdOrderCode) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '24px 16px' }}>
          <Result
            status="success"
            title="Đặt Hàng Thành Công!"
            subTitle={
              <div>
                <p>
                  Mã đơn hàng của bạn là:{' '}
                  <Text copyable strong style={{ fontSize: 20, color: '#e53935' }}>
                    {createdOrderCode}
                  </Text>
                </p>
                <p style={{ color: '#8c8c8c' }}>
                  Nhân viên Autobot sẽ liên hệ qua Số điện thoại / Zalo để xác nhận và thông báo tiến độ giao hàng cho bạn.
                </p>
              </div>
            }
            extra={[
              <Button
                type="primary"
                key="track"
                size="large"
                icon={<FileSearchOutlined />}
                style={{ background: '#e53935' }}
                onClick={() => navigate(`/track-order?code=${createdOrderCode}`)}
              >
                Tra Cứu Đơn Hàng Ngay
              </Button>,
              <Button key="home" size="large" onClick={() => navigate('/')}>
                Về Trang Chủ
              </Button>,
            ]}
          />

          <Alert
            style={{ textAlign: 'left', marginTop: 24 }}
            message="Thông tin thanh toán Chuyển khoản (nếu chọn CK)"
            description={
              <div>
                <p><strong>Ngân hàng:</strong> MB Bank (Quân Đội)</p>
                <p><strong>Số tài khoản:</strong> 0987654321</p>
                <p><strong>Chủ tài khoản:</strong> GUNDAM AUTOBOT STORE</p>
                <p><strong>Nội dung CK:</strong> {createdOrderCode} - SĐT của bạn</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: <Link to="/cart">Giỏ hàng</Link> },
          { title: 'Đặt hàng & Thanh toán' },
        ]}
      />

      <Title level={2} style={{ marginBottom: 24 }}>
        Thông Tin Đặt Hàng & Giao Hàng
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ paymentMethod: 'COD' }}
      >
        <Row gutter={[24, 24]}>
          {/* Cột nhập thông tin giao hàng */}
          <Col xs={24} lg={14}>
            <Card title="1. Thông Tin Người Nhận" style={{ borderRadius: 12, marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="customerName"
                    label="Họ và tên người nhận"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="customerPhone"
                    label="Số điện thoại liên hệ"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
                    ]}
                  >
                    <Input placeholder="0912345678" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="customerEmail"
                label="Địa chỉ Email (Nhận thông báo cập nhật đơn)"
              >
                <Input placeholder="ban@gmail.com" size="large" />
              </Form.Item>

              <Form.Item
                name="detailAddress"
                label="Địa chỉ chi tiết nhận hàng"
                rules={[{ required: true, message: 'Vui lòng nhập số nhà, tên đường, phường/xã' }]}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Ví dụ: Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú thêm cho shop">
                <Input placeholder="Ví dụ: Bọc chống sốc cẩn thận, giao buổi chiều..." />
              </Form.Item>
            </Card>

            <Card title="2. Khu Vực Vận Chuyển & Phí Ship" style={{ borderRadius: 12, marginBottom: 24 }}>
              <Radio.Group
                style={{ width: '100%' }}
                onChange={(e) => {
                  const zone = shippingZones.find((z) => z.id === e.target.value);
                  if (zone) setSelectedZone(zone);
                }}
                value={selectedZone?.id}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {shippingZones.map((zone) => (
                    <Card
                      key={zone.id}
                      size="small"
                      style={{
                        borderRadius: 8,
                        borderColor: selectedZone?.id === zone.id ? '#e53935' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedZone(zone)}
                    >
                      <Radio value={zone.id}>
                        <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <Text strong>{zone.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {zone.districts}
                          </Text>
                        </div>
                      </Radio>
                      <span
                        style={{
                          float: 'right',
                          fontWeight: 700,
                          color: '#e53935',
                          marginTop: 4,
                        }}
                      >
                        {Number(zone.fee).toLocaleString('vi-VN')} đ
                      </span>
                    </Card>
                  ))}
                </Space>
              </Radio.Group>
            </Card>

            <Card title="3. Hình Thức Thanh Toán" style={{ borderRadius: 12 }}>
              <Form.Item name="paymentMethod" style={{ margin: 0 }}>
                <Radio.Group style={{ width: '100%' }}>
                  <Card size="small" style={{ borderRadius: 8, marginBottom: 12 }}>
                    <Radio value="COD">
                      <Space>
                        <DollarOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                        <div>
                          <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Kiểm tra hộp nguyên vẹn trước khi thanh toán tiền mặt cho shipper.
                          </Text>
                        </div>
                      </Space>
                    </Radio>
                  </Card>

                  <Card size="small" style={{ borderRadius: 8 }}>
                    <Radio value="BANK_TRANSFER">
                      <Space>
                        <BankOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                        <div>
                          <Text strong>Chuyển khoản ngân hàng</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Chuyển khoản qua mã QR hoặc STK, shop sẽ xác nhận ngay sau khi nhận tiền.
                          </Text>
                        </div>
                      </Space>
                    </Radio>
                  </Card>
                </Radio.Group>
              </Form.Item>
            </Card>
          </Col>

          {/* Cột tóm tắt sản phẩm trong đơn */}
          <Col xs={24} lg={10}>
            <Card title="Đơn Hàng Của Bạn" style={{ borderRadius: 12, position: 'sticky', top: 90 }}>
              <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 16 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 14 }}>
                        {item.name}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Số lượng: x{item.quantity} | {item.grade}
                      </Text>
                    </div>
                    <Text strong style={{ color: '#e53935' }}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </Text>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Tạm tính ({items.length} món):</Text>
                <Text strong>{subtotal.toLocaleString('vi-VN')} đ</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Phí giao hàng ({selectedZone?.name || 'Mặc định'}):</Text>
                <Text strong>{shippingFee.toLocaleString('vi-VN')} đ</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text strong style={{ fontSize: 16 }}>
                  Tổng cộng thanh toán:
                </Text>
                <Text strong style={{ fontSize: 24, color: '#e53935' }}>
                  {total.toLocaleString('vi-VN')} đ
                </Text>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={submitting}
                icon={<CheckCircleOutlined />}
                style={{ background: '#e53935', height: 48, fontWeight: 700 }}
              >
                Xác Nhận Đặt Hàng
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
