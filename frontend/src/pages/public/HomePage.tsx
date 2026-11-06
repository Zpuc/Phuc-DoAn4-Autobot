import React from 'react';
import { Typography, Row, Col, Card, Button, Tag, Space, Badge } from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const grades = [
    { name: 'High Grade (HG)', scale: '1/144', color: 'blue', desc: 'Đa dạng, dễ ráp, biên độ cử động linh hoạt' },
    { name: 'Real Grade (RG)', scale: '1/144', color: 'purple', desc: 'Khung xương Advanced MS Joint siêu chi tiết' },
    { name: 'Master Grade (MG)', scale: '1/100', color: 'volcano', desc: 'Tỉ lệ chuẩn 1/100, khung xương hoàn chỉnh' },
    { name: 'Perfect Grade (PG)', scale: '1/60', color: 'gold', desc: 'Tuyệt tác Gunpla, khung kim loại & LED' },
    { name: 'Super Deformed (SD)', scale: 'Non-scale', color: 'cyan', desc: 'Nhỏ gọn dễ thương, phong cách Chibi' },
    { name: 'Metal Build / Alloy', scale: '1/100, 1/72', color: 'magenta', desc: 'Mô hình hoàn thiện khung kim loại đúc sẵn' },
  ];

  const demoProducts = [
    {
      id: '1',
      name: 'MG 1/100 Freedom Gundam Ver. 2.0',
      grade: 'MG',
      brand: 'Bandai Namco',
      price: 1150000,
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&auto=format&fit=crop&q=60',
      condition: 'Mới 100% (MISB)',
    },
    {
      id: '2',
      name: 'RG 1/144 Hi-Nu Gundam',
      grade: 'RG',
      brand: 'Bandai Namco',
      price: 1250000,
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=500&auto=format&fit=crop&q=60',
      condition: 'Mới 100% (MISB)',
    },
    {
      id: '3',
      name: 'Motor Nuclear MN-Q05 Lữ Bố (LuBu)',
      grade: 'Metal Build',
      brand: 'Motor Nuclear',
      price: 2450000,
      status: 'PRE_ORDER',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60',
      condition: 'Hàng Order (Liên hệ báo giá)',
    },
    {
      id: '4',
      name: 'PG 1/60 Gundam Exia Lighting Model',
      grade: 'PG',
      brand: 'Bandai Namco',
      price: 7800000,
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60',
      condition: 'Mới 100% (Hộp đẹp)',
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero Banner */}
      <Card
        style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg, #11141a 0%, #1c2333 100%)',
          color: '#fff',
          border: 'none',
          marginBottom: 32,
          padding: '24px 16px',
        }}
      >
        <Row align="middle" gutter={[32, 24]}>
          <Col xs={24} md={16}>
            <Tag color="#e53935" style={{ fontSize: 13, padding: '4px 12px', marginBottom: 12 }}>
              <FireOutlined /> AUTOBOT GUNDAM CHÍNH HÃNG
            </Tag>
            <Title level={1} style={{ color: '#fff', margin: '8px 0 16px 0', fontSize: 36 }}>
              Khám Phá Thế Giới Gunpla & Mô Hình Cơ Khí
            </Title>
            <Paragraph style={{ color: '#d9d9d9', fontSize: 16, lineHeight: 1.6, maxWidth: 650 }}>
              Cập nhật giá theo biến động thị trường và đợt nhập khẩu thực tế. Hỗ trợ gửi yêu cầu báo giá
              các mẫu hiếm, đặt hàng trực tiếp không qua trung gian, giao hàng COD toàn quốc hoặc hỏa tốc
              nội thành.
            </Paragraph>
            <Space size="middle" style={{ marginTop: 8 }}>
              <Link to="/products">
                <Button type="primary" size="large" icon={<RocketOutlined />} style={{ background: '#e53935' }}>
                  Xem Toàn Bộ Sản Phẩm
                </Button>
              </Link>
              <Link to="/quotations">
                <Button ghost size="large" icon={<FileProtectOutlined />} style={{ color: '#fff', borderColor: '#fff' }}>
                  Gửi Yêu Cầu Báo Giá
                </Button>
              </Link>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: 24,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ThunderboltOutlined style={{ fontSize: 48, color: '#e53935', marginBottom: 12 }} />
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                Hàng Mới Về Tuần Này
              </Title>
              <Text style={{ color: '#aaa', display: 'block', marginTop: 8 }}>
                Hơn 50+ mã Gunpla Bandai, Daban, SNAA đã cập bến kho Autobot.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Phân khúc Gundam (Grades) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Phân Khúc Gundam (Gunpla Grades)
          </Title>
          <Link to="/products" style={{ color: '#e53935' }}>
            Xem tất cả →
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {grades.map((g) => (
            <Col xs={24} sm={12} md={8} key={g.name}>
              <Card
                hoverable
                style={{
                  borderRadius: 8,
                  height: '100%',
                  borderLeft: `4px solid ${g.color === 'volcano' ? '#fa541c' : g.color === 'gold' ? '#faad14' : '#1890ff'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {g.name}
                  </Text>
                  <Tag color={g.color}>{g.scale}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {g.desc}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Sản phẩm tiêu biểu */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Mô Hình Nổi Bật & Báo Giá Mới Nhất
          </Title>
          <Link to="/products" style={{ color: '#e53935' }}>
            Xem bảng giá đầy đủ →
          </Link>
        </div>

        <Row gutter={[20, 20]}>
          {demoProducts.map((p) => (
            <Col xs={24} sm={12} md={6} key={p.id}>
              <Badge.Ribbon
                text={p.status === 'PRE_ORDER' ? 'Order' : 'Có sẵn'}
                color={p.status === 'PRE_ORDER' ? 'purple' : 'red'}
              >
                <Card
                  hoverable
                  style={{ borderRadius: 8, overflow: 'hidden' }}
                  cover={
                    <div style={{ height: 200, background: '#262626', overflow: 'hidden' }}>
                      <img
                        alt={p.name}
                        src={p.image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  }
                  actions={[
                    <Button type="link" icon={<ShoppingOutlined />} style={{ color: '#e53935', fontWeight: 600 }}>
                      Đặt Mua
                    </Button>,
                    <Button type="link" icon={<FileProtectOutlined />}>
                      Báo Giá
                    </Button>,
                  ]}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                      <Tag color="blue">{p.grade}</Tag>
                      <Tag>{p.brand}</Tag>
                    </div>
                    <Text strong ellipsis style={{ fontSize: 15 }}>
                      {p.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {p.condition}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 18, fontWeight: 700, color: '#e53935' }}>
                        {p.price.toLocaleString('vi-VN')} đ
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </div>

      {/* Cam kết cửa hàng */}
      <Card style={{ borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0' }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <Space align="start">
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  100% Hàng Chính Hãng
                </Text>
                <p style={{ margin: 0, color: '#8c8c8c', fontSize: 13 }}>
                  Cam kết mô hình Bandai, Daban, Motor Nuclear nhập khẩu nguyên seal.
                </p>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space align="start">
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  Giao Hàng An Toàn
                </Text>
                <p style={{ margin: 0, color: '#8c8c8c', fontSize: 13 }}>
                  Đóng gói bóng khí 3 lớp chuyên dụng, bảo vệ hộp mô hình nguyên vẹn.
                </p>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space align="start">
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  Báo Giá Minh Bạch
                </Text>
                <p style={{ margin: 0, color: '#8c8c8c', fontSize: 13 }}>
                  Cập nhật theo tỉ giá ngoại tệ thực tế, có phiếu xuất báo giá PDF rõ ràng.
                </p>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

