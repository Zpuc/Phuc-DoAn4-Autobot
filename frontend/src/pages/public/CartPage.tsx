import React from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  InputNumber,
  Typography,
  Space,
  Tag,
  Popconfirm,
  Empty,
  Breadcrumb,
  Image,
  Divider,
} from 'antd';
import {
  HomeOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  ShoppingOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, CartItem } from '../../store/useCartStore';

const { Title, Text } = Typography;

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartStore();

  const totalPrice = getTotalPrice();

  const columns = [
    {
      title: 'Mô hình Gunpla',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <Space size="middle" align="center">
          <Image
            width={60}
            height={60}
            src={record.imageUrl || 'https://via.placeholder.com/60?text=Gunpla'}
            style={{ objectFit: 'cover', borderRadius: 6 }}
            fallback="https://via.placeholder.com/60?text=Gunpla"
          />
          <div>
            <Link to={`/products/${record.slug}`}>
              <Text strong style={{ fontSize: 14 }}>
                {record.name}
              </Text>
            </Link>
            <br />
            <Space size={4} style={{ marginTop: 4 }}>
              <Tag color="blue">{record.grade || 'Gunpla'}</Tag>
              <Tag>{record.scale || '1/144'}</Tag>
              {record.isPreorder && <Tag color="purple">Hàng Order</Tag>}
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>
              SKU: {record.sku}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (val: number) => (
        <Text strong style={{ color: '#e53935' }}>
          {val > 0 ? `${val.toLocaleString('vi-VN')} đ` : 'Liên hệ báo giá'}
        </Text>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      width: 130,
      render: (_: any, record: CartItem) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(val) => updateQuantity(record.id, val || 1)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      width: 150,
      render: (_: any, record: CartItem) => (
        <Text strong style={{ color: '#e53935', fontSize: 15 }}>
          {(record.price * record.quantity).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: any, record: CartItem) => (
        <Popconfirm
          title="Xóa mô hình này khỏi giỏ hàng?"
          onConfirm={() => removeFromCart(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Giỏ hàng của bạn' },
        ]}
      />

      <Title level={2} style={{ marginBottom: 24 }}>
        Giỏ Hàng ({items.length} sản phẩm)
      </Title>

      {items.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '60px 0' }}>
          <Empty
            description="Giỏ hàng của bạn đang trống"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/products">
              <Button type="primary" size="large" icon={<ShoppingOutlined />} style={{ background: '#e53935' }}>
                Khám Phá Các Mẫu Gundam
              </Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              style={{ borderRadius: 12 }}
              extra={
                <Popconfirm
                  title="Bạn có chắc muốn làm trống giỏ hàng?"
                  onConfirm={clearCart}
                  okText="Làm trống"
                  cancelText="Hủy"
                >
                  <Button type="text" danger icon={<ClearOutlined />}>
                    Xóa tất cả
                  </Button>
                </Popconfirm>
              }
            >
              <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card style={{ borderRadius: 12 }} title="Tóm Tắt Đơn Hàng">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text type="secondary">Tạm tính ({items.length} món):</Text>
                <Text strong>{totalPrice.toLocaleString('vi-VN')} đ</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text type="secondary">Phí vận chuyển:</Text>
                <Text type="secondary">Tính ở bước đặt hàng</Text>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text strong style={{ fontSize: 16 }}>
                  Tổng thanh toán:
                </Text>
                <Text strong style={{ fontSize: 22, color: '#e53935' }}>
                  {totalPrice.toLocaleString('vi-VN')} đ
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<ArrowRightOutlined />}
                style={{ background: '#e53935', height: 48, fontWeight: 700 }}
                onClick={() => navigate('/checkout')}
              >
                Tiến Hành Đặt Hàng
              </Button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/products" style={{ color: '#1890ff' }}>
                  ← Tiếp tục chọn mua thêm mô hình
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

