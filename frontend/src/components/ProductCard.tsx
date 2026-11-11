import React from 'react';
import { Card, Typography, Tag, Badge, Button, Image, message } from 'antd';
import {
  EyeOutlined,
  ShoppingOutlined,
  HeartOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

const { Text } = Typography;

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  grade?: string;
  scale?: string;
  condition?: string;
  currentPrice: number;
  isPreorder: boolean;
  quantity: number;
  brand?: { id?: string; name: string };
  images?: { id?: string; url: string }[];
}

interface ProductCardProps {
  product: ProductCardData;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500';

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isOutOfStock = !product.isPreorder && product.quantity <= 0;
  const saved = isInWishlist(product.id);
  const coverUrl = product.images?.[0]?.url || FALLBACK_IMAGE;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      grade: product.grade,
      scale: product.scale,
      brand: product.brand?.name,
      price: product.currentPrice,
      imageUrl: product.images?.[0]?.url,
      isPreorder: product.isPreorder,
    });
    if (saved) {
      message.info(`Đã bỏ "${product.name}" khỏi danh sách yêu thích`);
    } else {
      message.success(`Đã thêm "${product.name}" vào danh sách yêu thích!`);
    }
  };

  const handleQuickAction = () => {
    if (product.isPreorder) {
      navigate(`/quotations?product=${product.id}`);
      return;
    }
    if (isOutOfStock) {
      message.warning(`Mô hình "${product.name}" hiện đang tạm hết hàng!`);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      grade: product.grade,
      scale: product.scale,
      price: product.currentPrice,
      quantity: 1,
      maxStock: product.quantity,
      imageUrl: product.images?.[0]?.url,
      isPreorder: false,
    });
    message.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    navigate('/checkout');
  };

  return (
    <Badge.Ribbon
      text={product.isPreorder ? 'Hàng Order' : isOutOfStock ? 'Hết Hàng' : 'Có sẵn'}
      color={product.isPreorder ? 'purple' : isOutOfStock ? 'default' : '#e53935'}
    >
      <Card
        hoverable
        style={{
          borderRadius: 10,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #f0f0f0',
        }}
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '14px 16px 16px',
          },
        }}
        cover={
          <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden', background: '#141414' }}>
            <Link to={`/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
              <Image
                preview={false}
                alt={product.name}
                src={coverUrl}
                width="100%"
                height={210}
                style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
                fallback={FALLBACK_IMAGE}
              />
            </Link>
            <Button
              shape="circle"
              size="small"
              aria-label="Yêu thích"
              onClick={handleToggleWishlist}
              icon={saved ? <HeartFilled style={{ color: '#e53935' }} /> : <HeartOutlined style={{ color: '#595959' }} />}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 2,
                background: 'rgba(255, 255, 255, 0.92)',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}
            />
          </div>
        }
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <Tag color="blue" style={{ margin: 0 }}>
            {product.grade || 'Gunpla'}
          </Tag>
          {product.brand?.name && (
            <Tag color="geekblue" style={{ margin: 0 }}>
              {product.brand.name}
            </Tag>
          )}
        </div>

        <Link to={`/products/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <Text
            strong
            title={product.name}
            style={{
              fontSize: 15,
              lineHeight: '21px',
              minHeight: 42,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 6,
            }}
          >
            {product.name}
          </Text>
        </Link>

        <Text type="secondary" ellipsis style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
          SKU: {product.sku} {product.scale ? `| Tỉ lệ: ${product.scale}` : ''}
        </Text>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 700, color: '#e53935' }}>
            {product.currentPrice > 0 ? `${product.currentPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {product.isPreorder ? 'Đặt trước' : isOutOfStock ? 'Tạm hết' : `Còn ${product.quantity} hộp`}
          </Text>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <Button
            icon={<EyeOutlined />}
            style={{ flex: 1, borderRadius: 6 }}
            onClick={() => navigate(`/products/${product.slug}`)}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<ShoppingOutlined />}
            disabled={isOutOfStock}
            style={{
              flex: 1.25,
              borderRadius: 6,
              background: isOutOfStock ? undefined : '#e53935',
              fontWeight: 600,
            }}
            onClick={handleQuickAction}
          >
            {product.isPreorder ? 'Báo Giá' : isOutOfStock ? 'Hết Hàng' : 'Mua Ngay'}
          </Button>
        </div>
      </Card>
    </Badge.Ribbon>
  );
};
