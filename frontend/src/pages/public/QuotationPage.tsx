import React from 'react';
import { Card, Button, Typography, Space, Breadcrumb, Row, Col, Divider, Tag } from 'antd';
import {
  HomeOutlined,
  PhoneFilled,
  FacebookFilled,
  MessageFilled,
  CustomerServiceOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export const QuotationPage: React.FC = () => {
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
    </div>
  );
};
