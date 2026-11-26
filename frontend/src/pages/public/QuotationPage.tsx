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
  message,
} from 'antd';
import {
  HomeOutlined,
  PhoneFilled,
  FacebookFilled,
  MessageFilled,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

interface ProductInfo {
  id: string;
  name: string;
  sku: string;
  grade?: string;
  scale?: string;
  currentPrice: number;
}

export const QuotationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('product');
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);

  useEffect(() => {
    if (!preselectedProductId) {
      setSelectedProduct(null);
      return;
    }
    apiClient
      .get(`/products/${preselectedProductId}`)
      .then((res: any) => {
        if (res && res.id) {
          setSelectedProduct(res);
        }
      })
      .catch(() => {});
  }, [preselectedProductId]);

  const handleCopyQuoteMessage = () => {
    if (!selectedProduct) return;
    const text = `Chào shop Autobot Gundam, mình muốn xin báo giá mẫu: [${selectedProduct.grade || 'Gunpla'}] ${selectedProduct.name} (SKU: ${selectedProduct.sku}).`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('Đã sao chép nội dung hỏi giá! Bạn có thể dán ngay vào Zalo hoặc Messenger.');
      })
      .catch(() => {
        message.info(text);
      });
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

        {selectedProduct && (
          <div
            style={{
              maxWidth: 680,
              margin: '0 auto 20px auto',
              padding: '14px 20px',
              borderRadius: 12,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                Mẫu mô hình bạn đang quan tâm:
              </Text>
              <Text strong style={{ fontSize: 16, color: '#1f1f1f' }}>
                [{selectedProduct.grade || 'Gunpla'}] {selectedProduct.name}
              </Text>
              <div style={{ fontSize: 13, color: '#595959', marginTop: 2 }}>
                Mã SKU: <Text code>{selectedProduct.sku}</Text>
                {selectedProduct.scale ? ` • Tỉ lệ: ${selectedProduct.scale}` : ''}
              </div>
            </div>
            <Button icon={<CopyOutlined />} onClick={handleCopyQuoteMessage}>
              Copy tên mẫu gửi Zalo
            </Button>
          </div>
        )}

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
          Vui lòng nhắn tin trực tiếp qua <strong>Zalo</strong>, <strong>Facebook</strong> hoặc gọi vào số hotline{' '}
          <Text
            copyable
            strong
            style={{ fontSize: 22, color: '#e53935', whiteSpace: 'nowrap' }}
          >
            0967708350
          </Text>{' '}
          để được báo giá nhanh nhất theo từng đợt hàng về kho.
        </Paragraph>

        <Space size={16} wrap style={{ justifyContent: 'center', marginBottom: 28 }}>
          <Button
            size="large"
            type="primary"
            icon={<MessageFilled />}
            href="https://zalo.me/0967708350"
            target="_blank"
            style={{
              background: '#0068ff',
              borderColor: '#0068ff',
              height: 48,
              padding: '0 28px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Chat Zalo: 0967708350
          </Button>

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
    </div>
  );
};
