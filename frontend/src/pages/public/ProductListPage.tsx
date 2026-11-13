import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Checkbox,
  Button,
  Space,
  Pagination,
  Spin,
  Empty,
  Breadcrumb,
  Drawer,
  Badge,
  Grid,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  HomeOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { ProductCard } from '../../components/ProductCard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

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
  quantity: number;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  images: { id: string; url: string }[];
}

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const screens = useBreakpoint();
  const isDesktop = !!screens.md;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [grade, setGrade] = useState<string | undefined>(searchParams.get('grade') || undefined);
  const [brandId, setBrandId] = useState<string | undefined>(searchParams.get('brandId') || undefined);
  const [series, setSeries] = useState<string | undefined>(searchParams.get('series') || undefined);
  const [isPreorder, setIsPreorder] = useState<boolean | undefined>(
    searchParams.get('isPreorder') ? searchParams.get('isPreorder') === 'true' : undefined,
  );
  const [priceRange, setPriceRange] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

  const activeFilterCount = [search, grade, brandId, series, priceRange, isPreorder !== undefined ? 'status' : '']
    .filter(Boolean).length;

  useEffect(() => {
    apiClient
      .get('/brands')
      .then((res: any) => setBrands(res || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlGrade = searchParams.get('grade') || undefined;
    setSearch(urlSearch);
    setGrade(urlGrade);
    setPage(1);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12, sortBy };
      if (search) params.search = search;
      if (grade) params.grade = grade;
      if (brandId) params.brandId = brandId;
      if (series) params.series = series;
      if (isPreorder !== undefined) params.isPreorder = isPreorder;
      if (priceRange === 'under_500') {
        params.maxPrice = 500000;
      } else if (priceRange === '500_1500') {
        params.minPrice = 500000;
        params.maxPrice = 1500000;
      } else if (priceRange === '1500_3000') {
        params.minPrice = 1500000;
        params.maxPrice = 3000000;
      } else if (priceRange === 'over_3000') {
        params.minPrice = 3000000;
      }

      const res: any = await apiClient.get('/products', { params });
      setProducts(res.items || []);
      setTotal(res.total || 0);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, grade, brandId, series, isPreorder, priceRange, sortBy, search]);

  const handleResetFilters = () => {
    setSearch('');
    setGrade(undefined);
    setBrandId(undefined);
    setSeries(undefined);
    setIsPreorder(undefined);
    setPriceRange(undefined);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchProducts();
    setFilterDrawerOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const filterFormContent = (
    <>
      {/* Tìm kiếm */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Tìm kiếm từ khóa
        </Text>
        <Input
          placeholder="Tên Gunpla, SKU..."
          prefix={<SearchOutlined />}
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={handleSearchSubmit}
        />
      </div>

      {/* Phân khúc (Grade) */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Phân khúc (Grade)
        </Text>
        <Select
          placeholder="Tất cả phân khúc"
          allowClear
          style={{ width: '100%' }}
          value={grade}
          onChange={(val) => {
            setGrade(val);
            setPage(1);
          }}
        >
          <Option value="HG">High Grade (HG 1/144)</Option>
          <Option value="RG">Real Grade (RG 1/144)</Option>
          <Option value="MG">Master Grade (MG 1/100)</Option>
          <Option value="PG">Perfect Grade (PG 1/60)</Option>
          <Option value="SD">Super Deformed (SD)</Option>
          <Option value="Metal Build">Metal Build / Hợp kim</Option>
          <Option value="Mega Size">Mega Size (1/48)</Option>
        </Select>
      </div>

      {/* Hãng sản xuất */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Hãng sản xuất (Brand)
        </Text>
        <Select
          placeholder="Tất cả các hãng"
          allowClear
          style={{ width: '100%' }}
          value={brandId}
          onChange={(val) => {
            setBrandId(val);
            setPage(1);
          }}
        >
          {brands.map((b) => (
            <Option key={b.id} value={b.id}>
              {b.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Dòng phim / Vũ trụ (Series) */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Vũ trụ / Series
        </Text>
        <Select
          placeholder="Chọn Series phim"
          allowClear
          style={{ width: '100%' }}
          value={series}
          onChange={(val) => {
            setSeries(val);
            setPage(1);
          }}
        >
          <Option value="Mobile Suit Gundam SEED">Gundam SEED / Destiny</Option>
          <Option value="Mobile Suit Gundam 00">Gundam 00</Option>
          <Option value="Universal Century">Universal Century (UC)</Option>
          <Option value="Mobile Suit Gundam: The Witch from Mercury">Witch from Mercury</Option>
          <Option value="Iron-Blooded Orphans">Iron-Blooded Orphans (IBO)</Option>
        </Select>
      </div>

      {/* Khoảng giá */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Khoảng giá (VND)
        </Text>
        <Select
          placeholder="Tất cả mức giá"
          allowClear
          style={{ width: '100%' }}
          value={priceRange}
          onChange={(val) => {
            setPriceRange(val);
            setPage(1);
          }}
        >
          <Option value="under_500">Dưới 500.000 đ</Option>
          <Option value="500_1500">500.000 đ - 1.500.000 đ</Option>
          <Option value="1500_3000">1.500.000 đ - 3.000.000 đ</Option>
          <Option value="over_3000">Trên 3.000.000 đ</Option>
        </Select>
      </div>

      {/* Trạng thái hàng */}
      <div style={{ marginBottom: 18 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Tình trạng hàng hóa
        </Text>
        <Space direction="vertical">
          <Checkbox
            checked={isPreorder === false}
            onChange={(e) => {
              setIsPreorder(e.target.checked ? false : undefined);
              setPage(1);
            }}
          >
            Có sẵn trong kho
          </Checkbox>
          <Checkbox
            checked={isPreorder === true}
            onChange={(e) => {
              setIsPreorder(e.target.checked ? true : undefined);
              setPage(1);
            }}
          >
            Hàng Order (Pre-order)
          </Checkbox>
        </Space>
      </div>

      <Button type="primary" block style={{ background: '#e53935' }} onClick={handleSearchSubmit}>
        Áp Dụng Lọc
      </Button>
    </>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Danh mục mô hình Gunpla' },
        ]}
      />

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1f1f1f 0%, #2e2e2e 100%)',
          borderRadius: 8,
          padding: isDesktop ? '24px 32px' : '16px 18px',
          color: '#fff',
          marginBottom: 20,
        }}
      >
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          Danh Mục Mô Hình Gundam (Gunpla)
        </Title>
        <Paragraph style={{ color: '#aaa', margin: '8px 0 0 0', maxWidth: 650, fontSize: isDesktop ? 14 : 13 }}>
          Tra cứu đầy đủ các dòng HG, RG, MG, PG, Metal Build chính hãng. Giá niêm yết theo tỉ giá thực tế
          kèm dịch vụ báo giá theo yêu cầu với hàng đặt trước.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Bộ lọc bên trái (Sidebar Filter trên Desktop) */}
        {isDesktop && (
          <Col md={6}>
            <Card
              title={
                <Space>
                  <FilterOutlined style={{ color: '#e53935' }} />
                  <span>Bộ Lọc Sản Phẩm</span>
                </Space>
              }
              extra={
                <Button type="link" size="small" icon={<ClearOutlined />} onClick={handleResetFilters}>
                  Đặt lại
                </Button>
              }
              style={{ borderRadius: 8 }}
            >
              {filterFormContent}
            </Card>
          </Col>
        )}

        {/* Danh sách sản phẩm bên phải */}
        <Col xs={24} md={18}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Text type="secondary" style={{ fontSize: isDesktop ? 14 : 13 }}>
              Tìm thấy <strong>{total}</strong> mô hình phù hợp
            </Text>

            <Space size={8} wrap>
              {!isDesktop && (
                <Badge count={activeFilterCount} size="small" color="#e53935">
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterDrawerOpen(true)}
                  >
                    Bộ lọc
                  </Button>
                </Badge>
              )}
              <Select
                value={sortBy}
                style={{ width: isDesktop ? 170 : 148 }}
                onChange={(val) => {
                  setSortBy(val);
                  setPage(1);
                }}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="price_asc">Giá: Thấp → Cao</Option>
                <Option value="price_desc">Giá: Cao → Thấp</Option>
              </Select>
            </Space>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#8c8c8c' }}>Đang tải danh sách mô hình...</p>
            </div>
          ) : products.length === 0 ? (
            <Card style={{ borderRadius: 8, textAlign: 'center', padding: '40px 0' }}>
              <Empty
                description="Không tìm thấy mô hình nào phù hợp với bộ lọc hiện tại"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={handleResetFilters} style={{ background: '#e53935' }}>
                  Xóa tất cả bộ lọc
                </Button>
              </Empty>
            </Card>
          ) : (
            <>
              <Row gutter={screens.sm ? [16, 16] : [10, 12]}>
                {products.map((p) => (
                  <Col xs={12} sm={12} lg={8} key={p.id}>
                    <ProductCard product={p} />
                  </Col>
                ))}
              </Row>

              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <Pagination
                  current={page}
                  total={total}
                  pageSize={12}
                  size={isDesktop ? undefined : 'small'}
                  onChange={handlePageChange}
                  showTotal={isDesktop ? (t) => `Tổng ${t} mô hình Gunpla` : undefined}
                />
              </div>
            </>
          )}
        </Col>
      </Row>

      {/* Drawer Bộ lọc trên Mobile */}
      <Drawer
        title={
          <Space>
            <FilterOutlined style={{ color: '#e53935' }} />
            <span>Bộ Lọc Sản Phẩm</span>
          </Space>
        }
        placement="right"
        width={300}
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        extra={
          <Button type="link" size="small" icon={<ClearOutlined />} onClick={handleResetFilters}>
            Đặt lại
          </Button>
        }
      >
        {filterFormContent}
      </Drawer>
    </div>
  );
};
