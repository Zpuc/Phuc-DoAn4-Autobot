import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Breadcrumb,
  Row,
  Col,
  Divider,
  Tag,
  Form,
  Input,
  Select,
  InputNumber,
  Alert,
  message,
} from 'antd';
import {
  HomeOutlined,
  PhoneFilled,
  FacebookFilled,
  MessageFilled,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

const { Title, Text, Paragraph } = Typography;

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  grade?: string;
  currentPrice: number;
}

export const QuotationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('product');
  const { user } = useAuthStore();
  const [form] = Form.useForm();

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdQuoteCode, setCreatedQuoteCode] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get('/products', { params: { limit: 100 } })
      .then((res: any) => {
        const list: ProductOption[] = res?.items || [];
        setProducts(list);
        if (preselectedProductId) {
          const found = list.find((p) => p.id === preselectedProductId);
          if (found) {
            form.setFieldsValue({
              productId: found.id,
              unitPrice: found.currentPrice || 0,
            });
          }
        }
      })
      .catch(() => {});
  }, [preselectedProductId, form]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        customerName: user.name,
        customerPhone: user.phone || '',
      });
    }
  }, [user, form]);

  const handleSubmitQuote = async (values: any) => {
    const selectedProduct = products.find((p) => p.id === values.productId);
    if (!selectedProduct) {
      message.warning('Vui lòng chọn mô hình cần báo giá');
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await apiClient.post('/quotations', {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        note: values.note,
        items: [
          {
            productId: selectedProduct.id,
            quantity: Number(values.quantity) || 1,
            unitPrice: Number(selectedProduct.currentPrice) || 0,
          },
        ],
      });
      setCreatedQuoteCode(res.code);
      message.success(`Đã gửi yêu cầu báo giá thành công! Mã phiếu: ${res.code}`);
      form.resetFields(['note']);
    } catch (err: any) {
      message.error(err.message || 'Không thể gửi phiếu yêu cầu báo giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: (
              <Link to="/">
                <HomeOutlined /> Trang chủ
              </Link>
            ),
          },
          { title: 'Yêu cầu báo giá' },
        ]}
      />

      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
          borderTop: '4px solid #e53935',
          textAlign: 'center',
          padding: '28px 16px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: '#fff1f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <CustomerServiceOutlined style={{ fontSize: 38, color: '#e53935' }} />
        </div>

        <Tag color="red" style={{ fontSize: 13, padding: '4px 12px', marginBottom: 12 }}>
          AUTOBOT GUNDAM STORE // HỖ TRỢ TRỰC TIẾP 24/7
        </Tag>

        <Title level={2} style={{ marginTop: 0, marginBottom: 16 }}>
          Yêu Cầu Báo Giá & Tư Vấn Mô Hình Gundam
        </Title>

        <Paragraph
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            maxWidth: 680,
            margin: '0 auto 28px auto',
            color: '#262626',
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            padding: '20px 24px',
            borderRadius: 12,
          }}
        >
          Vui lòng yêu cầu báo giá qua <strong>tin nhắn Facebook</strong> hoặc liên hệ trực tiếp qua số điện thoại{' '}
          <Text
            copyable
            strong
            style={{ fontSize: 22, color: '#e53935', whiteSpace: 'nowrap' }}
          >
            0967708350
          </Text>{' '}
          để được báo giá và giải đáp thắc mắc về giá cả.
        </Paragraph>

        <Space size={16} wrap style={{ justifyContent: 'center', marginBottom: 28 }}>
          <Button
            type="primary"
            size="large"
            icon={<FacebookFilled />}
            href="https://www.facebook.com/zann.puc"
            target="_blank"
            style={{
              background: '#1877F2',
              borderColor: '#1877F2',
              height: 48,
              padding: '0 28px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Nhắn Tin Qua Facebook
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<PhoneFilled />}
            href="tel:0967708350"
            style={{
              background: '#e53935',
              borderColor: '#e53935',
              height: 48,
              padding: '0 28px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Gọi Trực Tiếp: 0967708350
          </Button>

          <Button
            size="large"
            icon={<MessageFilled style={{ color: '#0068ff' }} />}
            href="https://zalo.me/0967708350"
            target="_blank"
            style={{
              borderColor: '#0068ff',
              color: '#0068ff',
              height: 48,
              padding: '0 24px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Chat Zalo: 0967708350
          </Button>
        </Space>

        <Divider />

        <Row gutter={[16, 16]} style={{ textAlign: 'left', marginTop: 16 }}>
          <Col xs={24} md={8}>
            <Card size="small" style={{ borderRadius: 10, background: '#fafafa', height: '100%' }}>
              <Space align="start">
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginTop: 4 }} />
                <div>
                  <Text strong>Báo giá sỉ & lẻ nhanh chóng</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Cập nhật giá tốt nhất theo từng đợt hàng HG, RG, MG, PG mới về kho.
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ borderRadius: 10, background: '#fafafa', height: '100%' }}>
              <Space align="start">
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginTop: 4 }} />
                <div>
                  <Text strong>Nhận tìm mẫu hiếm & Pre-order</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Tư vấn đặt trước các mẫu P-Bandai, Metal Build và phụ kiện lắp ráp.
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ borderRadius: 10, background: '#fafafa', height: '100%' }}>
              <Space align="start">
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginTop: 4 }} />
                <div>
                  <Text strong>Giao nhanh Hà Nội – Hưng Yên</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Đóng gói bọc chống sốc 3 lớp, cam kết hộp nguyên seal đẹp góc.
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Form Gửi Phiếu Yêu Cầu Báo Giá Trực Tuyến */}
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: '#e53935' }} />
            <span>Gửi Phiếu Yêu Cầu Báo Giá Nhanh Trên Hệ Thống</span>
          </Space>
        }
        style={{
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        }}
      >
        {createdQuoteCode && (
          <Alert
            type="success"
            showIcon
            closable
            style={{ marginBottom: 20, borderRadius: 8 }}
            message={
              <span>
                Đã tạo phiếu yêu cầu báo giá thành công! Mã phiếu của bạn:{' '}
                <Text copyable strong style={{ color: '#e53935' }}>
                  {createdQuoteCode}
                </Text>
              </span>
            }
            description="Shop đã nhận được thông tin trên hệ thống quản trị và sẽ liên hệ lại với bạn qua Số điện thoại / Zalo."
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitQuote}
          initialValues={{ quantity: 1 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="customerName"
                label="Họ và tên của bạn"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="customerPhone"
                label="Số điện thoại / Zalo nhận báo giá"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
                ]}
              >
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={18}>
              <Form.Item
                name="productId"
                label="Chọn mô hình Gundam cần báo giá"
                rules={[{ required: true, message: 'Vui lòng chọn mô hình' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Tìm chọn mẫu Gunpla..."
                  options={products.map((p) => ({
                    value: p.id,
                    label: `[${p.grade || 'Gunpla'}] ${p.name} - ${
                      p.currentPrice > 0 ? `${p.currentPrice.toLocaleString('vi-VN')} đ` : 'Hàng Order'
                    }`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item
                name="quantity"
                label="Số lượng (hộp)"
                rules={[{ required: true, message: 'Nhập số lượng' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú thêm (Yêu cầu tìm mẫu hiếm, báo giá sỉ, phụ kiện kèm theo...)">
            <Input.TextArea rows={2} placeholder="Nhập yêu cầu chi tiết của bạn..." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={submitting}
            style={{ background: '#e53935', fontWeight: 600 }}
          >
            Gửi Yêu Cầu Báo Giá
          </Button>
        </Form>
      </Card>
    </div>
  );
};
