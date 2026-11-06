import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Breadcrumb,
  Spin,
  Tabs,
  InputNumber,
  Descriptions,
  Table,
  Badge,
  message,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useCartStore } from '../../store/useCartStore';

const { Title, Text, Paragraph } = Typography;

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string;
  grade?: string;
  scale?: string;
  series?: string;
  condition?: string;
  description?: string;
  status: string;
  isPreorder: boolean;
  currentPrice: number;
  quantity: number;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  images: { id: string; url: string }[];
  priceHistory: {
    id: string;
    price: number;
    effectiveFrom: string;
    note?: string;
  }[];
}

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiClient
      .get(`/products/slug/${slug}`)
      .then((res: any) => {
        setProduct(res);
        if (res.images && res.images.length > 0) {
          setSelectedImage(res.images[0].url);
        }
      })
      .catch((err: any) => {
        message.error(err.message || 'Không tìm thấy sản phẩm');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      grade: product.grade,
      scale: product.scale,
      price: product.currentPrice,
      quantity: buyQuantity,
      imageUrl: product.images[0]?.url,
      isPreorder: product.isPreorder,
    });
    message.success(`Đã thêm ${buyQuantity} hộp "${product.name}" vào giỏ hàng!`);
    navigate('/cart');
  };

  const handleRequestQuotation = () => {
    if (!product) return;
    navigate(`/quotations?product=${product.id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin chi tiết Gunpla...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title level={3}>Không tìm thấy mô hình yêu cầu</Title>
        <Link to="/products">
          <Button type="primary" style={{ background: '#e53935' }}>
            Quay lại danh mục
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: <Link to="/products">Danh mục mô hình</Link> },
          { title: product.grade || 'Gunpla' },
          { title: product.name },
        ]}
      />

      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <Row gutter={[40, 32]}>
          {/* Cột ảnh sản phẩm */}
          <Col xs={24} md={11}>
            <div
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                background: '#141414',
                height: 420,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <img
                src={selectedImage || 'https://via.placeholder.com/450x420?text=Gunpla'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <Space size="middle" style={{ overflowX: 'auto', width: '100%' }}>
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 6,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border:
                        selectedImage === img.url ? '2px solid #e53935' : '1px solid #d9d9d9',
                    }}
                  >
                    <img
                      src={img.url}
                      alt="thumb"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </Space>
            )}
          </Col>

          {/* Cột thông tin & Đặt hàng */}
          <Col xs={24} md={13}>
            <Space size={6} style={{ marginBottom: 8 }}>
              <Tag color="blue">{product.grade || 'Gunpla'}</Tag>
              <Tag color="geekblue">{product.brand?.name}</Tag>
              {product.isPreorder ? (
                <Tag color="purple">Hàng Order (Pre-order)</Tag>
              ) : (
                <Tag color="success">Có sẵn tại kho ({product.quantity} hộp)</Tag>
              )}
            </Space>

            <Title level={2} style={{ margin: '8px 0 12px 0' }}>
              {product.name}
            </Title>

            <div
              style={{
                background: '#fafafa',
                padding: '16px 20px',
                borderRadius: 8,
                border: '1px solid #f0f0f0',
                marginBottom: 20,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                Giá bán niêm yết (Đã tính theo tỉ giá mới nhất):
              </Text>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#e53935' }}>
                  {product.currentPrice > 0
                    ? `${product.currentPrice.toLocaleString('vi-VN')} đ`
                    : 'Liên hệ báo giá'}
                </span>
                {product.isPreorder && (
                  <Badge count="Giá tham khảo" style={{ backgroundColor: '#722ed1' }} />
                )}
              </div>
            </div>

            {/* Thông số cơ bản */}
            <Descriptions column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã SKU">
                <Text copyable strong>{product.sku}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tỉ lệ (Scale)">
                <strong>{product.scale || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Vũ trụ / Series">
                {product.series || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng hộp">
                <Tag color="green">{product.condition === 'NEW_SEAL' ? 'Mới 100% (MISB)' : product.condition}</Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Chọn số lượng & Nút bấm mua hàng */}
            <div style={{ marginBottom: 24 }}>
              <Space size="large" align="center">
                <Text strong>Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={product.isPreorder ? 99 : Math.max(1, product.quantity)}
                  value={buyQuantity}
                  onChange={(val) => setBuyQuantity(val || 1)}
                  size="large"
                  style={{ width: 100 }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {product.isPreorder
                    ? 'Nhận order số lượng theo đợt'
                    : `Còn ${product.quantity} sản phẩm trong kho`}
                </Text>
              </Space>
            </div>

            <Space size="middle" style={{ width: '100%', marginBottom: 20 }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                style={{ background: '#e53935', minWidth: 200, height: 48, fontWeight: 700 }}
                onClick={handleAddToCart}
                disabled={!product.isPreorder && product.quantity === 0}
              >
                {!product.isPreorder && product.quantity === 0
                  ? 'Tạm Hết Hàng'
                  : 'Đặt Hàng Ngay (COD / CK)'}
              </Button>

              <Button
                size="large"
                icon={<FilePdfOutlined />}
                style={{ height: 48 }}
                onClick={handleRequestQuotation}
              >
                Yêu Cầu Báo Giá PDF
              </Button>
            </Space>

            {/* Cam kết giao dịch */}
            <Alert
              type="info"
              showIcon
              icon={<SafetyCertificateOutlined />}
              message="Chính sách hỗ trợ mua hàng tại Autobot"
              description="Hỗ trợ kiểm tra hộp trước khi nhận hàng. Giao hỏa tốc nội thành trong ngày, giao toàn quốc qua GHN/GHTK bọc màng khí chống móp 100%."
            />
          </Col>
        </Row>
      </Card>

      {/* Tabs thông tin chi tiết & Lịch sử giá */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Mô Tả & Thông Tin Chi Tiết',
              children: (
                <div style={{ padding: '12px 0' }}>
                  <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                    {product.description ||
                      'Mô hình Gunpla chính hãng với các vỉ đúc runner sắc nét, decal chi tiết, đi kèm sách hướng dẫn lắp ráp từng bước tiêu chuẩn Nhật Bản.'}
                  </Paragraph>
                </div>
              ),
            },
            {
              key: '2',
              label: (
                <span>
                  <HistoryOutlined /> Lịch Sử Biến Động Giá
                </span>
              ),
              children: (
                <div style={{ padding: '12px 0' }}>
                  <Paragraph type="secondary">
                    Gundam AUTOBOT cam kết minh bạch giá thành theo đợt nhập khẩu và tỉ giá ngoại tệ thực tế.
                  </Paragraph>
                  <Table
                    dataSource={product.priceHistory || []}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    columns={[
                      {
                        title: 'Mức giá áp dụng',
                        dataIndex: 'price',
                        key: 'price',
                        render: (val: number) => (
                          <Text strong style={{ color: '#e53935' }}>
                            {val.toLocaleString('vi-VN')} đ
                          </Text>
                        ),
                      },
                      {
                        title: 'Ngày hiệu lực',
                        dataIndex: 'effectiveFrom',
                        key: 'date',
                        render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
                      },
                      {
                        title: 'Ghi chú đợt giá',
                        dataIndex: 'note',
                        key: 'note',
                        render: (t: string) => t || 'Cập nhật giá theo đợt nhập',
                      },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
