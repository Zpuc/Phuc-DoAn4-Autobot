import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Tag, Space, Spin, Image, Grid } from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ProductCard, ProductCardData } from '../../components/ProductCard';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const grades = [
    { name: 'High Grade (HG)', scale: '1/144', color: 'blue', desc: 'Đa dạng, dễ ráp, biên độ cử động linh hoạt' },
    { name: 'Real Grade (RG)', scale: '1/144', color: 'purple', desc: 'Khung xương Advanced MS Joint siêu chi tiết' },
    { name: 'Master Grade (MG)', scale: '1/100', color: 'volcano', desc: 'Tỉ lệ chuẩn 1/100, khung xương hoàn chỉnh' },
    { name: 'Perfect Grade (PG)', scale: '1/60', color: 'gold', desc: 'Tuyệt tác Gunpla, khung kim loại & LED' },
    { name: 'Super Deformed (SD)', scale: 'Non-scale', color: 'cyan', desc: 'Nhỏ gọn dễ thương, phong cách Chibi' },
    { name: 'Metal Build / Alloy', scale: '1/100, 1/72', color: 'magenta', desc: 'Mô hình hoàn thiện khung kim loại đúc sẵn' },
  ];

  useEffect(() => {
    setLoading(true);
    apiClient
      .get('/products', { params: { limit: 8 } })
      .then((res: any) => {
        setProducts(res.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            <Space size="middle" wrap style={{ marginTop: 8 }}>
              <Link to="/products">
                <Button type="primary" size="large" icon={<RocketOutlined />} style={{ background: '#e53935' }}>
                  Xem Danh Mục Mô Hình
                </Button>
              </Link>
              <Link to="/quotations">
                <Button size="large" ghost style={{ color: '#fff', borderColor: '#fff' }}>
                  Yêu Cầu Báo Giá
                </Button>
              </Link>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Image
              preview={false}
              src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&auto=format&fit=crop&q=60"
              alt="Gundam Hero"
              style={{
                width: '100%',
                maxHeight: 260,
                objectFit: 'cover',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Phân loại Grade phổ biến */}
      <div style={{ marginBottom: 36 }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          Phân Khúc Mô Hình (Grade & Scale)
        </Title>
        <Row gutter={[16, 16]}>
          {grades.map((g) => (
            <Col xs={24} sm={12} md={8} key={g.name}>
              <Card
                hoverable
                onClick={() => navigate(`/products`)}
                style={{
                  borderRadius: 8,
                  height: '100%',
                  cursor: 'pointer',
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

      {/* Sản phẩm tiêu biểu thời gian thực từ Database */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Mô Hình Nổi Bật & Có Sẵn Tại Kho
          </Title>
          <Link to="/products" style={{ color: '#e53935', fontWeight: 600 }}>
            Xem toàn bộ mô hình →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Đang tải danh sách mô hình Gundam..." />
          </div>
        ) : (
          <Row gutter={isMobile ? [10, 12] : [20, 20]}>
            {products.map((p) => (
              <Col xs={12} sm={12} md={6} key={p.id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        )}
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
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                  Cam kết mô hình Bandai, Daban, Motor Nuclear nhập khẩu nguyên seal.
                </Paragraph>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space align="start">
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  Giao Hàng An Toàn & Đóng Hộp Kỹ
                </Text>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                  Đóng gói bóng khí 3 lớp chuyên dụng, bảo vệ hộp mô hình nguyên vẹn không móp méo.
                </Paragraph>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space align="start">
              <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginTop: 4 }} />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  Báo Giá Minh Bạch & Chiết Khấu Voucher
                </Text>
                <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                  Hỗ trợ tạo báo giá PDF điện tử và áp dụng mã voucher trừ tiền trực tiếp khi thanh toán.
                </Paragraph>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
