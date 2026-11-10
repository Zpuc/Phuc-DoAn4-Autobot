import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
  Row,
  Col,
  Empty,
  Spin,
  Alert,
  Image,
  Breadcrumb,
  Popconfirm,
  message,
  Modal,
  Form,
  Rate,
  Input,
  Upload,
} from 'antd';
import {
  ShoppingOutlined,
  HomeOutlined,
  CarOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CloseCircleOutlined,
  StarFilled,
  CameraOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';
import { reviewApi } from '../../api/reviews';

const { Title, Text, Paragraph } = Typography;

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage: string | null;
  productSlug?: string | null;
  productGrade?: string | null;
}

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  trackingCode: string | null;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'orange' },
  CONFIRMED: { label: 'Đơn hàng đang được giao', color: 'purple' },
  PACKING: { label: 'Đơn hàng đang được giao', color: 'purple' },
  SHIPPING: { label: 'Đơn hàng đang được giao', color: 'purple' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
  RETURNED: { label: 'Hoàn trả hàng', color: 'default' },
};

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ item: OrderItem; orderCode: string } | null>(null);
  const [reviewImage, setReviewImage] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedItemIds, setReviewedItemIds] = useState<Record<string, boolean>>({});
  const [reviewForm] = Form.useForm();

  const handleOpenReviewModal = (item: OrderItem, orderCode: string) => {
    setReviewTarget({ item, orderCode });
    setReviewImage('');
    reviewForm.setFieldsValue({
      rating: 5,
      title: '',
      comment: '',
      imageUrl: '',
    });
    setReviewModalOpen(true);
  };

  const handleImageFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setReviewImage(dataUrl);
        reviewForm.setFieldsValue({ imageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSubmitReview = async (values: any) => {
    if (!reviewTarget || !user) return;
    try {
      setSubmittingReview(true);
      await reviewApi.create({
        productId: reviewTarget.item.productId,
        rating: values.rating,
        userName: user.name,
        userEmail: user.email,
        title: values.title,
        comment: values.comment,
        imageUrl: reviewImage || values.imageUrl || undefined,
        gradeTag: reviewTarget.item.productGrade || 'Gunpla',
      });
      message.success(`Đã gửi đánh giá cho "${reviewTarget.item.productName}" thành công!`);
      setReviewedItemIds((prev) => ({ ...prev, [reviewTarget.item.id]: true }));
      setReviewModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.get('/orders/my-orders');
      setOrders(data || []);
    } catch {
      // bỏ qua lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      await apiClient.patch(`/orders/${orderId}/cancel`, {
        reason: 'Khách hàng chủ động hủy đơn trên hệ thống',
      });
      message.success('Đã hủy đơn hàng và hoàn lại số lượng kho thành công');
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng này');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <Card style={{ borderRadius: 12, padding: '32px 20px' }}>
          <ShoppingOutlined style={{ fontSize: 48, color: '#e53935', marginBottom: 16 }} />
          <Title level={4}>Bạn cần đăng nhập để xem lịch sử đơn hàng</Title>
          <Paragraph type="secondary">
            Đăng nhập tài khoản Autobot Gundam để tra cứu toàn bộ đơn hàng và trạng thái vận chuyển của bạn.
          </Paragraph>
          <Space size={16} style={{ marginTop: 16 }}>
            <Button type="primary" size="large" onClick={() => navigate('/login')}>
              Đăng nhập ngay
            </Button>
            <Button size="large" onClick={() => navigate('/products')}>
              Xem danh mục sản phẩm
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '30px auto', padding: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Đơn hàng của tôi' },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Lịch Sử Mua Hàng
          </Title>
          <Text type="secondary">
            Tài khoản: <strong>{user?.name}</strong> ({user?.email})
          </Text>
        </div>

        <Button type="primary" onClick={() => navigate('/products')}>
          Tiếp tục mua sắm
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Đang tải lịch sử đơn hàng..." />
        </div>
      ) : orders.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 20px' }}>
          <Empty
            description={
              <div>
                <Title level={4}>Bạn chưa có đơn hàng nào</Title>
                <Text type="secondary">
                  Hãy khám phá hàng trăm mô hình Gundam chính hãng Bandai có sẵn tại kho!
                </Text>
              </div>
            }
          >
            <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ marginTop: 16 }}>
              Khám phá Gunpla ngay
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {orders.map((order) => {
            const statusConfig = statusMap[order.status] || { label: order.status, color: 'default' };

            return (
              <Card
                key={order.id}
                bordered={false}
                style={{
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Header đơn */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingBottom: 16,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Space size={12} wrap>
                    <Text strong style={{ fontSize: 16 }}>
                      Mã đơn: <Text copyable style={{ color: '#e53935' }}>{order.code}</Text>
                    </Text>
                    <Tag color={statusConfig.color} style={{ fontSize: 13, padding: '2px 8px' }}>
                      {statusConfig.label}
                    </Tag>
                    {order.trackingCode && (
                      <Tag color="cyan">
                        <CarOutlined /> Vận đơn: {order.trackingCode}
                      </Tag>
                    )}
                  </Space>

                  <Space size={6}>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </Space>
                </div>

                {/* Danh sách items */}
                <div style={{ padding: '16px 0' }}>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '1px dashed #f5f5f5',
                      }}
                    >
                      <Space size={14} align="center">
                        <Image
                          src={item.productImage || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120'}
                          alt={item.productName}
                          width={52}
                          height={52}
                          style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                          fallback="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120"
                        />
                        <div>
                          <Text strong style={{ display: 'block', fontSize: 14 }}>
                            {item.productName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Số lượng: x{item.quantity}
                          </Text>
                        </div>
                      </Space>

                      <Space size={12} align="center">
                        <Text strong style={{ fontSize: 14 }}>
                          {item.totalPrice.toLocaleString('vi-VN')} đ
                        </Text>
                        {order.status === 'COMPLETED' && (
                          reviewedItemIds[item.id] ? (
                            <Button
                              size="small"
                              type="dashed"
                              onClick={() =>
                                item.productSlug
                                  ? navigate(`/products/${item.productSlug}`)
                                  : navigate('/products')
                              }
                            >
                              Xem đánh giá
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              type="primary"
                              icon={<StarFilled />}
                              style={{ background: '#faad14', borderColor: '#faad14', fontWeight: 600 }}
                              onClick={() => handleOpenReviewModal(item, order.code)}
                            >
                              Đánh giá món hàng
                            </Button>
                          )
                        )}
                      </Space>
                    </div>
                  ))}
                </div>

                {/* Footer đơn */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #f0f0f0',
                  }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>
                      Địa chỉ nhận: {order.shippingAddress}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Phí vận chuyển: {order.shippingFee.toLocaleString('vi-VN')} đ
                    </Text>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary" style={{ marginRight: 8 }}>Tổng thanh toán:</Text>
                      <Text strong style={{ fontSize: 18, color: '#e53935' }}>
                        {order.total.toLocaleString('vi-VN')} đ
                      </Text>
                    </div>
                    {order.trackingCode && (
                      <div style={{ fontSize: 12, color: '#595959', marginBottom: 8 }}>
                        Đơn vị vận chuyển / Mã vận đơn: <Text strong style={{ color: '#13c2c2' }}>{order.trackingCode}</Text>
                      </div>
                    )}
                    <Space size={8} wrap>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<EnvironmentOutlined />}
                        onClick={() => navigate(`/track-order?code=${order.code}`)}
                      >
                        Xem lộ trình đơn hàng
                      </Button>
                      {order.status === 'PENDING' && (
                        <Popconfirm
                          title="Xác nhận hủy đơn hàng?"
                          description="Đơn hàng sẽ được hủy và hoàn lại số lượng vào kho."
                          onConfirm={() => handleCancelOrder(order.id)}
                          okText="Đồng ý hủy"
                          cancelText="Không"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            loading={cancellingId === order.id}
                          >
                            Hủy đơn hàng
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                </div>
              </Card>
            );
          })}
        </Space>
      )}

      <Modal
        title={
          <Space>
            <StarFilled style={{ color: '#faad14' }} />
            <span>Đánh Giá Sản Phẩm Đã Nhận ({reviewTarget?.orderCode})</span>
          </Space>
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        {reviewTarget && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                background: '#fafafa',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <Image
                src={
                  reviewTarget.item.productImage ||
                  'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120'
                }
                width={54}
                height={54}
                style={{ objectFit: 'cover', borderRadius: 6 }}
                preview={false}
              />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  {reviewTarget.item.productName}
                </Text>
                <br />
                <Tag color="green" style={{ marginTop: 4 }}>
                  Đã giao hàng thành công
                </Tag>
              </div>
            </div>

            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleSubmitReview}
              initialValues={{ rating: 5 }}
            >
              <Form.Item
                name="rating"
                label="Mức độ hài lòng (Số sao)"
                rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
              >
                <Rate
                  style={{ fontSize: 28, color: '#faad14' }}
                  tooltips={['Rất tệ', 'Chưa ưng', 'Bình thường', 'Rất hài lòng', 'Tuyệt vời 10/10']}
                />
              </Form.Item>

              <Form.Item name="title" label="Tiêu đề ngắn gọn">
                <Input placeholder="Ví dụ: Hộp nguyên seal nét căng, khớp chắc chắn..." maxLength={100} />
              </Form.Item>

              <Form.Item
                name="comment"
                label="Nhận xét chi tiết về món hàng"
                rules={[{ required: true, message: 'Vui lòng nhập nhận xét của bạn' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Chia sẻ cảm nhận về chất lượng mô hình, tình trạng hộp và tốc độ giao hàng..."
                  maxLength={1000}
                  showCount
                />
              </Form.Item>

              <Form.Item label="Hình ảnh thực tế món hàng (Tải ảnh từ máy hoặc dán link ảnh)">
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  <Space wrap>
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={handleImageFileSelect}
                    >
                      <Button icon={<CameraOutlined />}>Chọn ảnh từ thiết bị</Button>
                    </Upload>
                    {reviewImage && (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setReviewImage('');
                          reviewForm.setFieldsValue({ imageUrl: '' });
                        }}
                      >
                        Xóa ảnh
                      </Button>
                    )}
                  </Space>

                  <Form.Item name="imageUrl" noStyle>
                    <Input
                      placeholder="Hoặc dán đường dẫn URL hình ảnh vào đây..."
                      onChange={(e) => setReviewImage(e.target.value)}
                    />
                  </Form.Item>

                  {reviewImage && (
                    <div style={{ marginTop: 4 }}>
                      <Image
                        src={reviewImage}
                        alt="Ảnh đánh giá"
                        width={120}
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                      />
                    </div>
                  )}
                </Space>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setReviewModalOpen(false)}>Đóng</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submittingReview}
                    style={{ background: '#e53935', fontWeight: 600 }}
                  >
                    Hoàn Tất Đánh Giá
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};
