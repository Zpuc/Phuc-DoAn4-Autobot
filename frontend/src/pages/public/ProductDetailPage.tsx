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
  Rate,
  Progress,
  Avatar,
  Divider,
  Modal,
  Form,
  Input,
  List,
  Image,
  Upload,
} from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  LikeOutlined,
  UserOutlined,
  EditOutlined,
  MessageOutlined,
  CameraOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { reviewApi, ProductReviewsResponse } from '../../api/reviews';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';

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
  const [reviewData, setReviewData] = useState<ProductReviewsResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewImage, setReviewImage] = useState<string>('');
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [reviewForm] = Form.useForm();
  const { user } = useAuthStore();

  const fetchReviews = async (productId: string) => {
    setReviewLoading(true);
    try {
      const data = await reviewApi.getByProduct(productId);
      setReviewData(data);
    } catch {
      // ignore
    } finally {
      setReviewLoading(false);
    }
  };

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
        if (res.id) {
          fetchReviews(res.id);
        }
      })
      .catch((err: any) => {
        message.error(err.message || 'Không tìm thấy sản phẩm');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleLikeReview = async (reviewId: string) => {
    try {
      await reviewApi.like(reviewId);
      if (product) fetchReviews(product.id);
      message.success('Cảm ơn bạn đã đánh giá nhận xét hữu ích!');
    } catch {
      // ignore
    }
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
    if (!product) return;
    setSubmittingReview(true);
    try {
      await reviewApi.create({
        productId: product.id,
        rating: values.rating,
        userName: values.userName,
        userEmail: values.userEmail,
        title: values.title,
        comment: values.comment,
        imageUrl: reviewImage || values.imageUrl || undefined,
        gradeTag: product.grade,
      });
      message.success('Đã gửi đánh giá thành công! Cảm ơn bạn đã đóng góp cho cộng đồng Autobot.');
      setReviewModalOpen(false);
      setReviewImage('');
      reviewForm.resetFields();
      fetchReviews(product.id);
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = useCartStore((state) => state.addToCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      grade: product.grade,
      scale: product.scale,
      brand: product.brand?.name,
      price: product.currentPrice,
      imageUrl: product.images[0]?.url,
      isPreorder: product.isPreorder,
    });
    if (inWishlist) {
      message.info(`Đã bỏ "${product.name}" khỏi danh sách yêu thích`);
    } else {
      message.success(`Đã thêm "${product.name}" vào danh sách yêu thích!`);
    }
  };

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
  };

  const handleBuyNow = () => {
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
    message.success(`Đang chuyển đến trang đặt hàng & thanh toán...`);
    navigate('/checkout');
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

            <Title level={2} style={{ margin: '8px 0 8px 0' }}>
              {product.name}
            </Title>

            {/* Đánh giá sao & lượt nhận xét */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <Rate
                disabled
                allowHalf
                value={reviewData?.stats.average || 5}
                style={{ fontSize: 16, color: '#faad14' }}
              />
              <Text strong style={{ color: '#d48806', fontSize: 15 }}>
                {reviewData?.stats.average || 5.0}
              </Text>
              <Divider type="vertical" />
              <Button
                type="link"
                style={{ padding: 0, height: 'auto', color: '#1890ff' }}
                onClick={() => setActiveTabKey('3')}
              >
                {reviewData?.stats.total || 0} bài đánh giá
              </Button>
              <Divider type="vertical" />
              <Tag color="cyan">100% Chính Hãng MISB</Tag>
            </div>

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

            <Space size="middle" wrap style={{ width: '100%', marginBottom: 20 }}>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                style={{ background: '#e53935', minWidth: 200, height: 48, fontWeight: 700 }}
                onClick={handleBuyNow}
                disabled={!product.isPreorder && product.quantity === 0}
              >
                {!product.isPreorder && product.quantity === 0
                  ? 'Tạm Hết Hàng'
                  : 'Mua Ngay (Thanh Toán)'}
              </Button>

              <Button
                size="large"
                icon={<ShoppingOutlined />}
                style={{ height: 48, fontWeight: 600 }}
                onClick={handleAddToCart}
                disabled={!product.isPreorder && product.quantity === 0}
              >
                Thêm Vào Giỏ Hàng
              </Button>

              <Button
                size="large"
                icon={<FilePdfOutlined />}
                style={{ height: 48 }}
                onClick={handleRequestQuotation}
              >
                Yêu Cầu Báo Giá PDF
              </Button>

              <Button
                size="large"
                icon={
                  inWishlist ? (
                    <HeartFilled style={{ color: '#e53935' }} />
                  ) : (
                    <HeartOutlined />
                  )
                }
                style={{ height: 48 }}
                onClick={handleToggleWishlist}
              >
                {inWishlist ? 'Đã yêu thích' : 'Yêu thích'}
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

      {/* Tabs thông tin chi tiết & Lịch sử giá & Đánh giá */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
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
            {
              key: '3',
              label: (
                <span>
                  <StarOutlined /> Đánh Giá & Nhận Xét ({reviewData?.stats.total || 0})
                </span>
              ),
              children: (
                <div style={{ padding: '16px 0' }}>
                  {/* Bảng tổng kết số sao & Viết đánh giá */}
                  <Row gutter={[32, 24]} align="middle" style={{ marginBottom: 32, background: '#fafafa', padding: 24, borderRadius: 8 }}>
                    <Col xs={24} md={8} style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 44, fontWeight: 900, color: '#e53935', lineHeight: 1 }}>
                        {reviewData?.stats.average || 5.0}
                        <span style={{ fontSize: 20, color: '#8c8c8c' }}> / 5</span>
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <Rate disabled allowHalf value={reviewData?.stats.average || 5} style={{ fontSize: 20, color: '#faad14' }} />
                      </div>
                      <Text type="secondary">
                        Dựa trên {reviewData?.stats.total || 0} nhận xét từ khách hàng
                      </Text>
                      <div style={{ marginTop: 16 }}>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          style={{ background: '#e53935', fontWeight: 600 }}
                          onClick={() => {
                            reviewForm.resetFields();
                            if (user) {
                              reviewForm.setFieldsValue({
                                userName: user.name,
                                userEmail: user.email,
                                rating: 5,
                              });
                            }
                            setReviewModalOpen(true);
                          }}
                        >
                          Viết Đánh Giá Của Bạn
                        </Button>
                      </div>
                    </Col>

                    {/* Thanh tỷ lệ 5 sao -> 1 sao */}
                    <Col xs={24} md={16}>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewData?.stats.breakdown?.[star as keyof typeof reviewData.stats.breakdown] || 0;
                        const total = reviewData?.stats.total || 1;
                        const percent = Math.round((count / total) * 100);
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                            <Text style={{ width: 45 }}>{star} sao</Text>
                            <Progress percent={percent} strokeColor="#faad14" style={{ flex: 1 }} size="small" />
                            <Text type="secondary" style={{ width: 40, textAlign: 'right' }}>
                              {count}
                            </Text>
                          </div>
                        );
                      })}
                    </Col>
                  </Row>

                  {/* Danh sách bình luận */}
                  <List
                    loading={reviewLoading}
                    dataSource={reviewData?.reviews || []}
                    locale={{ emptyText: 'Chưa có đánh giá nào cho mô hình này. Hãy là người đầu tiên đánh giá!' }}
                    itemLayout="vertical"
                    renderItem={(item) => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Button
                            type="text"
                            size="small"
                            icon={<LikeOutlined />}
                            onClick={() => handleLikeReview(item.id)}
                            style={{ color: '#595959' }}
                          >
                            Hữu ích ({item.likes || 0})
                          </Button>,
                        ]}
                        style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />}>
                              {item.userName?.[0]?.toUpperCase()}
                            </Avatar>
                          }
                          title={
                            <Space size="middle" wrap>
                              <Text strong style={{ fontSize: 15 }}>{item.userName}</Text>
                              <Tag color="success">Đã mua hàng chính hãng</Tag>
                              {item.gradeTag && <Tag color="blue">{item.gradeTag}</Tag>}
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                              </Text>
                            </Space>
                          }
                          description={
                            <div style={{ marginTop: 4 }}>
                              <Rate disabled value={item.rating} style={{ fontSize: 13, color: '#faad14' }} />
                              {item.title && (
                                <span style={{ fontWeight: 700, marginLeft: 8, color: '#262626' }}>
                                  {item.title}
                                </span>
                              )}
                            </div>
                          }
                        />
                        <Paragraph style={{ marginTop: 8, fontSize: 14, color: '#434343', lineHeight: 1.6, marginBottom: item.imageUrl ? 10 : 0 }}>
                          {item.comment}
                        </Paragraph>
                        {item.imageUrl && (
                          <div style={{ marginTop: 8 }}>
                            <Image
                              src={item.imageUrl}
                              alt="Ảnh thực tế khách hàng đánh giá"
                              width={110}
                              height={110}
                              style={{
                                objectFit: 'cover',
                                borderRadius: 8,
                                border: '1px solid #e8e8e8',
                              }}
                            />
                          </div>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Viết Đánh Giá */}
      <Modal
        title={
          <Space>
            <StarFilled style={{ color: '#faad14' }} />
            <span>Đánh Giá Mô Hình: {product.name}</span>
          </Space>
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
          initialValues={{
            rating: 5,
            userName: user?.name || '',
            userEmail: user?.email || '',
          }}
        >
          <Form.Item
            name="rating"
            label="Chất lượng mô hình"
            rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá' }]}
          >
            <Rate
              style={{ fontSize: 24, color: '#faad14' }}
              tooltips={['Rất tệ', 'Chưa ưng', 'Bình thường', 'Rất hài lòng', 'Tuyệt vời 10/10']}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên của bạn' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="userEmail" label="Email (Không bắt buộc)">
                <Input placeholder="email@gmail.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="title" label="Tiêu đề cảm nhận ngắn gọn">
            <Input placeholder="VD: Khớp đầm, runner sắc nét, đóng gói cẩn thận" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Chi tiết nhận xét (độ sắc nét, runner, khớp, decal...)"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Chia sẻ trải nghiệm lắp ráp Gunpla của bạn để giúp các builder khác có lựa chọn tốt nhất..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item label="Đính kèm hình ảnh thực tế mô hình (Không bắt buộc)">
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              <Space wrap>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleImageFileSelect}
                >
                  <Button icon={<CameraOutlined />}>Chọn ảnh từ máy</Button>
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
                  placeholder="Hoặc dán đường dẫn URL hình ảnh..."
                  onChange={(e) => setReviewImage(e.target.value)}
                />
              </Form.Item>

              {reviewImage && (
                <Image
                  src={reviewImage}
                  alt="Preview"
                  width={110}
                  height={110}
                  style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReviewModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submittingReview} style={{ background: '#e53935' }}>
                Gửi Đánh Giá
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
