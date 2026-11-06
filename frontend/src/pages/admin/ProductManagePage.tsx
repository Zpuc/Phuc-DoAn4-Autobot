import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Typography,
  Card,
  Row,
  Col,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  grade?: string;
  scale?: string;
  series?: string;
  condition?: string;
  status: string;
  isPreorder: boolean;
  currentPrice: number;
  costPrice: number;
  quantity: number;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  images: { id: string; url: string }[];
}

interface PriceHistory {
  id: string;
  price: number;
  costPrice: number;
  effectiveFrom: string;
  note?: string;
}

export const ProductManagePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | undefined>(undefined);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Modal lịch sử giá
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState<PriceHistory[]>([]);
  const [selectedProductName, setSelectedProductName] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (gradeFilter) params.grade = gradeFilter;

      const res: any = await apiClient.get('/products', { params });
      setProducts(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [catsRes, brandsRes]: any = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands'),
      ]);
      setCategories(catsRes || []);
      setBrands(brandsRes || []);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, gradeFilter]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'ACTIVE',
      condition: 'NEW_SEAL',
      isPreorder: false,
      quantity: 5,
      scale: '1/144',
      grade: 'HG',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: Product) => {
    setEditingProduct(record);
    form.resetFields();
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      sku: record.sku,
      categoryId: record.category.id,
      brandId: record.brand.id,
      grade: record.grade,
      scale: record.scale,
      series: record.series,
      condition: record.condition,
      status: record.status,
      isPreorder: record.isPreorder,
      price: record.currentPrice,
      costPrice: record.costPrice,
      quantity: record.quantity,
      imageUrl: record.images[0]?.url || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        ...values,
        images: values.imageUrl ? [values.imageUrl] : [],
      };
      delete payload.imageUrl;

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, payload);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await apiClient.post('/products', payload);
        message.success('Tạo sản phẩm Gundam mới thành công');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiClient.delete(`/products/${id}`);
      message.success('Đã xóa sản phẩm (soft delete)');
      fetchProducts();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleViewPriceHistory = async (record: Product) => {
    try {
      const detail: any = await apiClient.get(`/products/slug/${record.slug}`);
      setSelectedProductName(record.name);
      setSelectedProductHistory(detail.priceHistory || []);
      setIsHistoryModalOpen(true);
    } catch (err: any) {
      message.error(err.message || 'Không thể xem lịch sử giá');
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      key: 'image',
      width: 70,
      render: (_: any, record: Product) => (
        <Image
          width={50}
          height={50}
          src={record.images[0]?.url || 'https://via.placeholder.com/50'}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://via.placeholder.com/50?text=No+Image"
        />
      ),
    },
    {
      title: 'Tên Mô Hình & SKU',
      key: 'name_sku',
      render: (_: any, record: Product) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {record.name}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            SKU: <Tag color="default">{record.sku}</Tag>
            {record.series && <span>| Series: {record.series}</span>}
          </Text>
        </div>
      ),
    },
    {
      title: 'Phân Khúc',
      key: 'grade',
      width: 120,
      render: (_: any, record: Product) => (
        <Space direction="vertical" size={2}>
          <Tag color="blue">{record.grade || 'N/A'}</Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.scale || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Hãng',
      dataIndex: ['brand', 'name'],
      key: 'brand',
      width: 130,
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'Giá Bán (VND)',
      dataIndex: 'currentPrice',
      key: 'price',
      width: 140,
      render: (val: number, record: Product) => (
        <div>
          <Text strong style={{ color: '#e53935', fontSize: 14 }}>
            {val.toLocaleString('vi-VN')} đ
          </Text>
          <br />
          <Text orientation="right" type="secondary" style={{ fontSize: 11 }}>
            Vốn: {record.costPrice.toLocaleString('vi-VN')} đ
          </Text>
        </div>
      ),
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      render: (val: number) => (
        <Tag color={val <= 2 ? 'red' : val <= 5 ? 'orange' : 'green'}>{val} hộp</Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 110,
      render: (_: any, record: Product) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.status === 'ACTIVE' ? 'success' : 'default'}>
            {record.status === 'ACTIVE' ? 'Đang bán' : 'Ẩn'}
          </Tag>
          {record.isPreorder && <Tag color="purple">Hàng Order</Tag>}
        </Space>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 150,
      render: (_: any, record: Product) => (
        <Space orientation="horizontal" size="small">
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => handleViewPriceHistory(record)}
            title="Xem lịch sử giá"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xác nhận xóa mô hình này?"
            description="Sản phẩm sẽ được chuyển sang trạng thái xóa mềm (Soft delete)."
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý Danh Mục Mô Hình Gundam
            </Title>
            <Text type="secondary">
              Quản lý danh sách kit, tồn kho và theo dõi lịch sử biến động giá theo tỉ giá
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchProducts}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: '#e53935' }}
                onClick={handleOpenCreateModal}
              >
                Thêm Gundam Mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo tên mô hình, mã SKU hoặc Series..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchProducts();
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo phân khúc (Grade)"
              allowClear
              style={{ width: '100%' }}
              value={gradeFilter}
              onChange={(val) => {
                setGradeFilter(val);
                setPage(1);
              }}
            >
              <Option value="HG">High Grade (HG 1/144)</Option>
              <Option value="RG">Real Grade (RG 1/144)</Option>
              <Option value="MG">Master Grade (MG 1/100)</Option>
              <Option value="PG">Perfect Grade (PG 1/60)</Option>
              <Option value="SD">Super Deformed (SD)</Option>
              <Option value="Metal Build">Metal Build / Hợp kim</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: (p) => setPage(p),
            showTotal: (totalCount) => `Tổng cộng ${totalCount} mô hình`,
          }}
        />
      </Card>

      {/* Modal Thêm / Sửa Sản Phẩm */}
      <Modal
        title={editingProduct ? 'Chỉnh Sửa Mô Hình Gundam' : 'Thêm Mô Hình Gundam Mới'}
        open={isModalOpen}
        onOk={handleSaveProduct}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText={editingProduct ? 'Cập Nhật' : 'Tạo Mới'}
        cancelText="Đóng"
        width={720}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên mô hình Gunpla"
                rules={[{ required: true, message: 'Vui lòng nhập tên mô hình' }]}
              >
                <Input placeholder="Ví dụ: MG 1/100 Barbatos Gundam" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sku"
                label="Mã SKU định danh"
                rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
              >
                <Input placeholder="Ví dụ: BAN-MG-BARBATOS" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="slug"
                label="Slug đường dẫn (SEO)"
                rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
              >
                <Input placeholder="mg-1-100-barbatos-gundam" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="brandId"
                label="Hãng sản xuất"
                rules={[{ required: true, message: 'Chọn hãng' }]}
              >
                <Select placeholder="Chọn hãng">
                  {brands.map((b) => (
                    <Option key={b.id} value={b.id}>
                      {b.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="grade" label="Phân khúc (Grade)">
                <Select placeholder="Chọn Grade">
                  <Option value="HG">HG</Option>
                  <Option value="RG">RG</Option>
                  <Option value="MG">MG</Option>
                  <Option value="PG">PG</Option>
                  <Option value="SD">SD</Option>
                  <Option value="Metal Build">Metal Build</Option>
                  <Option value="Mega Size">Mega Size</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="scale" label="Tỉ lệ (Scale)">
                <Select placeholder="Chọn Scale">
                  <Option value="1/144">1/144</Option>
                  <Option value="1/100">1/100</Option>
                  <Option value="1/60">1/60</Option>
                  <Option value="1/72">1/72</Option>
                  <Option value="Non-scale">Non-scale</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="series" label="Vũ trụ / Series">
                <Input placeholder="SEED, UC, 00, IBO..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="condition" label="Tình trạng">
                <Select>
                  <Option value="NEW_SEAL">Mới 100% (MISB)</Option>
                  <Option value="DENTED_BOX">Hộp móp thanh lý</Option>
                  <Option value="ASSEMBLED">Đã ráp (2nd)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá bán niêm yết (VND)"
                rules={[{ required: true, message: 'Nhập giá bán' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  placeholder="1,200,000"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="costPrice" label="Giá vốn nhập vào (VND)">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  placeholder="900,000"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="Số lượng tồn kho">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="imageUrl" label="URL hình ảnh sản phẩm">
                <Input placeholder="https://images.unsplash.com/..." />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="isPreorder" label="Hàng Order" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="ACTIVE">Đang bán</Option>
                  <Option value="INACTIVE">Tạm ẩn</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả chi tiết / Phụ kiện kèm theo">
            <Input.TextArea rows={3} placeholder="Mô tả vũ khí, decal nước, đế trưng bày..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Lịch Sử Giá Biến Động */}
      <Modal
        title={`Lịch Sử Giá: ${selectedProductName}`}
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsHistoryModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Table
          dataSource={selectedProductHistory}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Mốc Giá Bán',
              dataIndex: 'price',
              key: 'price',
              render: (val: number) => (
                <Text strong style={{ color: '#e53935' }}>
                  {val.toLocaleString('vi-VN')} đ
                </Text>
              ),
            },
            {
              title: 'Giá Vốn',
              dataIndex: 'costPrice',
              key: 'costPrice',
              render: (val: number) => <span>{val.toLocaleString('vi-VN')} đ</span>,
            },
            {
              title: 'Ngày Áp Dụng',
              dataIndex: 'effectiveFrom',
              key: 'date',
              render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
            },
            {
              title: 'Ghi Chú',
              dataIndex: 'note',
              key: 'note',
              render: (t: string) => t || 'Cập nhật giá',
            },
          ]}
        />
      </Modal>
    </div>
  );
};

