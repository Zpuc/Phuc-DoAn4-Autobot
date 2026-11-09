import React, { useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Empty,
  Space,
  Tag,
  Breadcrumb,
  message,
} from 'antd';
import {
  HeartFilled,
  ShoppingCartOutlined,
  HomeOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';

const { Title, Text } = Typography;

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist, clearWishlist, loadFromStorage } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      grade: item.grade,
      scale: item.scale,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
      isPreorder: item.isPreorder || false,
    });
    message.success(`Đã thêm "${item.name}" vào giỏ hàng`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '30px auto', padding: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Danh sách yêu thích' },
        ]}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Mô Hình Yêu Thích Của Bạn
          </Title>
          <Text type="secondary">
            Lưu lại các bộ kit Gunpla bạn quan tâm để dễ dàng theo dõi và đặt mua sau này.
          </Text>
        </div>

        {items.length > 0 && (
          <Button danger icon={<DeleteOutlined />} onClick={clearWishlist}>
            Xóa tất cả
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '60px 20px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4}>Chưa có mô hình nào trong danh sách yêu thích</Title>
                <Text type="secondary">
                  Bấm vào biểu tượng trái tim trên các kit Gundam để lưu lại tại đây!
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/products')}
              style={{ marginTop: 16 }}
            >
              Khám phá danh mục Gunpla
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {items.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                cover={
                  <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400'
                      }
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Button
                      type="text"
                      shape="circle"
                      icon={<HeartFilled style={{ color: '#e53935', fontSize: 20 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item.id);
                        message.info(`Đã bỏ "${item.name}" khỏi danh sách yêu thích`);
                      }}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    />
                    {item.isPreorder && (
                      <Tag
                        color="purple"
                        style={{ position: 'absolute', top: 10, left: 10, fontWeight: 'bold' }}
                      >
                        PRE-ORDER
                      </Tag>
                    )}
                  </div>
                }
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Space orientation="horizontal" size={6} wrap style={{ marginBottom: 8 }}>
                    {item.grade && <Tag color="red">{item.grade}</Tag>}
                    {item.scale && <Tag>{item.scale}</Tag>}
                    {item.brand && <Tag color="blue">{item.brand}</Tag>}
                  </Space>

                  <Link
                    to={`/products/${item.slug}`}
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#262626',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: 44,
                      marginBottom: 8,
                    }}
                  >
                    {item.name}
                  </Link>

                  <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                    <div style={{ fontSize: 17, fontWeight: 'bold', color: '#e53935', marginBottom: 12 }}>
                      {item.price.toLocaleString('vi-VN')} đ
                    </div>

                    <Space style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleAddToCart(item)}
                        style={{ flex: 1 }}
                      >
                        Thêm vào giỏ
                      </Button>
                      <Button onClick={() => navigate(`/products/${item.slug}`)}>
                        Chi tiết
                      </Button>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
