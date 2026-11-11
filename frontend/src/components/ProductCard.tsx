import React from 'react';
import { Card, Typography, Tag, Badge, Button, Image, Grid, message } from 'antd';
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
const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const addToCart = useCartStore((state) => state.addToCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isOutOfStock = !product.isPreorder && product.quantity <= 0;
  const saved = isInWishlist(product.id);
  const coverUrl = product.images?.[0]?.url || FALLBACK_IMAGE;
  const imgHeight = isMobile ? 145 : 210;

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
      style={{
        fontSize: isMobile ? 11 : 12,
        lineHeight: isMobile ? '20px' : '22px',
        padding: isMobile ? '0 6px' : '0 8px',
      }}
    >
      <Card
        hoverable
        className="autobot-product-card"
        style={{
          borderRadius: isMobile ? 8 : 10,
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
            padding: isMobile ? '10px 10px 12px' : '14px 16px 16px',
          },
        }}
        cover={
          <div style={{ position: 'relative', height: imgHeight, width: '100%', overflow: 'hidden', background: '#141414' }}>
            <Link to={`/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
              <Image
                preview={false}
                alt={product.name}
                src={coverUrl}
                width="100%"
                height={imgHeight}
                style={{ width: '100%', height: imgHeight, objectFit: 'cover', display: 'block' }}
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
                top: isMobile ? 8 : 10,
                left: isMobile ? 8 : 10,
                zIndex: 2,
                background: 'rgba(255, 255, 255, 0.92)',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}
            />
          </div>
        }
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 4 : 6, marginBottom: isMobile ? 6 : 8 }}>
          <Tag
            color="blue"
            style={{
              margin: 0,
              fontSize: isMobile ? 11 : 12,
              padding: isMobile ? '0 5px' : undefined,
              lineHeight: isMobile ? '18px' : undefined,
            }}
          >
            {product.grade || 'Gunpla'}
          </Tag>
          {product.brand?.name && (
            <Tag
              color="geekblue"
              style={{
                margin: 0,
                fontSize: isMobile ? 11 : 12,
                padding: isMobile ? '0 5px' : undefined,
                lineHeight: isMobile ? '18px' : undefined,
                maxWidth: isMobile ? 95 : undefined,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.brand.name}
            </Tag>
          )}
        </div>

        <Link to={`/products/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <Text
            strong
            title={product.name}
            style={{
              fontSize: isMobile ? 13 : 15,
              lineHeight: isMobile ? '18px' : '21px',
              minHeight: isMobile ? 36 : 42,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: isMobile ? 4 : 6,
            }}
          >
            {product.name}
          </Text>
        </Link>

        <Text type="secondary" ellipsis style={{ fontSize: isMobile ? 11 : 12, display: 'block', marginBottom: isMobile ? 6 : 10 }}>
          {isMobile ? product.sku : `SKU: ${product.sku}${product.scale ? ` | Tỉ lệ: ${product.scale}` : ''}`}
        </Text>

        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'baseline',
            justifyContent: 'space-between',
            gap: isMobile ? 2 : 8,
            marginBottom: isMobile ? 10 : 14,
          }}
        >
          <Text style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: '#e53935', lineHeight: 1.2 }}>
            {product.currentPrice > 0 ? `${product.currentPrice.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
          </Text>
          <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12, whiteSpace: 'nowrap' }}>
            {product.isPreorder ? 'Đặt trước' : isOutOfStock ? 'Tạm hết' : `Còn ${product.quantity} hộp`}
          </Text>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: isMobile ? 6 : 8 }}>
          <Button
            size={isMobile ? 'small' : 'middle'}
            icon={isMobile ? undefined : <EyeOutlined />}
            style={{
              flex: 1,
              borderRadius: 6,
              fontSize: isMobile ? 12 : 14,
              padding: isMobile ? '0 4px' : undefined,
            }}
            onClick={() => navigate(`/products/${product.slug}`)}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            size={isMobile ? 'small' : 'middle'}
            icon={isMobile ? undefined : <ShoppingOutlined />}
            disabled={isOutOfStock}
            style={{
              flex: 1.25,
              borderRadius: 6,
              background: isOutOfStock ? undefined : '#e53935',
              fontWeight: 600,
              fontSize: isMobile ? 12 : 14,
              padding: isMobile ? '0 6px' : undefined,
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
