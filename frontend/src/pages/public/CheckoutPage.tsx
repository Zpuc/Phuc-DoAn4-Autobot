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
  Select,
} from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  BankOutlined,
  DollarOutlined,
  CarOutlined,
  TagOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
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

interface AddressItem {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description?: string;
}

export const CheckoutPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);

  // Sổ địa chỉ đã lưu
  const [savedAddresses, setSavedAddresses] = useState<AddressItem[]>([]);

  // Mã giảm giá / Coupon
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<
    { code: string; description?: string; minOrder: number }[]
  >([]);

  const subtotal = getTotalPrice();

  useEffect(() => {
    // Tải danh sách mã giảm giá đang hoạt động
    apiClient
      .get('/coupons')
      .then((res: any) => {
        if (Array.isArray(res)) {
          setAvailableCoupons(res);
        }
      })
      .catch(() => {});

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

    // Nếu đã đăng nhập, tải sổ địa chỉ và điền sẵn thông tin
    if (isAuthenticated && user) {
      apiClient
        .get('/addresses')
        .then((res: any) => {
          const list: AddressItem[] = res || [];
          setSavedAddresses(list);

          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            form.setFieldsValue({
              customerName: defaultAddr.receiverName,
              customerPhone: defaultAddr.phone,
              customerEmail: user.email,
              detailAddress: `${defaultAddr.detailAddress}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`,
            });
          } else {
            form.setFieldsValue({
              customerName: user.name,
              customerEmail: user.email,
              customerPhone: user.phone || '',
            });
          }
        })
        .catch(() => {
          form.setFieldsValue({
            customerName: user.name,
            customerEmail: user.email,
            customerPhone: user.phone || '',
          });
        });
    }
  }, [user, isAuthenticated, form]);

  const shippingFee = selectedZone ? Number(selectedZone.fee) : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  // Xử lý áp dụng voucher
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    setCouponLoading(true);
    try {
      const res: any = await apiClient.post('/coupons/apply', {
        code,
        subtotal,
      });
      setAppliedCoupon({
        code: res.code,
        discountAmount: res.discountAmount,
        description: res.description,
      });
      setCouponInput('');
      message.success(`Áp dụng mã ${res.code} thành công! Tiết kiệm ${res.discountAmount.toLocaleString('vi-VN')} đ`);
    } catch (err: any) {
      message.error(err.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    message.info('Đã hủy áp dụng mã giảm giá');
  };

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
        couponCode: appliedCoupon?.code || undefined,
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
                icon={<CarOutlined />}
                style={{ background: '#e53935' }}
                onClick={() => navigate(`/track-order?code=${createdOrderCode}`)}
              >
                Theo Dõi Lộ Trình Đơn Hàng
              </Button>,
              <Button
                key="orders"
                size="large"
                onClick={() => navigate('/my-orders')}
              >
                Xem Đơn Hàng Của Tôi
              </Button>,
              <Button key="home" size="large" onClick={() => navigate('/')}>
                Tiếp Tục Mua Sắm
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '30px auto', padding: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: <Link to="/cart">Giỏ hàng</Link> },
          { title: 'Thanh toán & Đặt hàng' },
        ]}
      />

      <Title level={2} style={{ marginBottom: 24 }}>
        Xác Nhận & Đặt Hàng Gunpla
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
            {/* Lựa chọn địa chỉ đã lưu */}
            {savedAddresses.length > 0 && (
              <Card
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: '#e53935' }} />
                    <span>Chọn Địa Chỉ Từ Sổ Địa Chỉ Đã Lưu</span>
                  </Space>
                }
                style={{ borderRadius: 12, marginBottom: 20, background: '#fafafa' }}
                size="small"
              >
                <Select
                  placeholder="Chọn địa chỉ giao hàng nhanh..."
                  style={{ width: '100%' }}
                  onChange={(val) => {
                    const addr = savedAddresses.find((a) => a.id === val);
                    if (addr) {
                      form.setFieldsValue({
                        customerName: addr.receiverName,
                        customerPhone: addr.phone,
                        detailAddress: `${addr.detailAddress}, ${addr.ward}, ${addr.district}, ${addr.province}`,
                      });
                      message.success('Đã áp dụng địa chỉ giao hàng');
                    }
                  }}
                  options={savedAddresses.map((a) => ({
                    label: `${a.receiverName} - ${a.phone} (${a.detailAddress}, ${a.ward}, ${a.district}) ${a.isDefault ? '[Mặc định]' : ''}`,
                    value: a.id,
                  }))}
                />
              </Card>
            )}

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
                  placeholder="Ví dụ: Số 12 Duy Tân, Cầu Giấy, Hà Nội hoặc KĐT Ecopark, Văn Giang, Hưng Yên"
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
                    >
                      <Radio value={zone.id} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <div>
                            <Text strong>{zone.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {zone.districts}
                            </Text>
                          </div>
                          <Text strong style={{ color: '#e53935', fontSize: 15 }}>
                            {Number(zone.fee).toLocaleString('vi-VN')} đ
                          </Text>
                        </div>
                      </Radio>
                    </Card>
                  ))}
                </Space>
              </Radio.Group>
            </Card>

            <Card title="3. Phương Thức Thanh Toán" style={{ borderRadius: 12 }}>
              <Form.Item name="paymentMethod" noStyle>
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

          {/* Cột tóm tắt sản phẩm trong đơn & Mã giảm giá */}
          <Col xs={24} lg={10}>
            <Card title="Đơn Hàng Của Bạn" style={{ borderRadius: 12, position: 'sticky', top: 90 }}>
              <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
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

              {/* Ô Nhập Mã Giảm Giá / Voucher */}
              <div style={{ padding: '12px', background: '#fafafa', borderRadius: 8, marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  <TagOutlined style={{ color: '#e53935', marginRight: 6 }} />
                  Mã Giảm Giá / Voucher Autobot
                </Text>

                {appliedCoupon ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      padding: '8px 12px',
                      borderRadius: 6,
                    }}
                  >
                    <div>
                      <Tag color="green" style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {appliedCoupon.code}
                      </Tag>
                      <span style={{ fontSize: 13, color: '#52c41a', fontWeight: 'bold' }}>
                        -{appliedCoupon.discountAmount.toLocaleString('vi-VN')} đ
                      </span>
                      {appliedCoupon.description && (
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                          {appliedCoupon.description}
                        </div>
                      )}
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={handleRemoveCoupon}
                      size="small"
                    >
                      Bỏ mã
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
                      <Input
                        placeholder="Nhập mã voucher (Ví dụ: AUTOBOT10)..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onPressEnter={() => handleApplyCoupon()}
                      />
                      <Button
                        type="primary"
                        onClick={() => handleApplyCoupon()}
                        loading={couponLoading}
                        style={{ background: '#e53935' }}
                      >
                        Áp dụng
                      </Button>
                    </Space.Compact>

                    {/* Gợi ý mã có sẵn */}
                    <Space size={6} wrap>
                      <Text type="secondary" style={{ fontSize: 11 }}>Gợi ý:</Text>
                      {(availableCoupons.length > 0
                        ? availableCoupons
                        : [
                            { code: 'AUTOBOT10', description: 'Giảm giá đơn hàng', minOrder: 0 },
                            { code: 'GUNPLA50K', description: 'Giảm 50K', minOrder: 0 },
                            { code: 'FREESHIP', description: 'Hỗ trợ phí ship', minOrder: 0 },
                          ]
                      ).map((c) => (
                        <Tag
                          key={c.code}
                          color="blue"
                          title={
                            c.description
                              ? `${c.description}${c.minOrder > 0 ? ` (Đơn từ ${c.minOrder.toLocaleString('vi-VN')}đ)` : ''}`
                              : c.code
                          }
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setCouponInput(c.code);
                            handleApplyCoupon(c.code);
                          }}
                        >
                          {c.code}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}
              </div>

              {/* Chi tiết tiền */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Tạm tính ({items.length} món):</Text>
                <Text strong>{subtotal.toLocaleString('vi-VN')} đ</Text>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Giảm giá voucher ({appliedCoupon?.code}):</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    -{discountAmount.toLocaleString('vi-VN')} đ
                  </Text>
                </div>
              )}

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
                style={{
                  background: '#e53935',
                  height: 50,
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 8,
                }}
              >
                Xác Nhận Đặt Hàng Ngay
              </Button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Bằng cách đặt hàng, bạn đồng ý với chính sách bán hàng của Autobot Gundam Store.
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
