import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  Table,
  InputNumber,
  Space,
  Result,
  message,
  Breadcrumb,
  Divider,
} from 'antd';
import {
  FileProtectOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface QuotationItemRow {
  key: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export const QuotationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const { user } = useAuthStore();

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<QuotationItemRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdQuotation, setCreatedQuotation] = useState<any | null>(null);

  useEffect(() => {
    // Tải danh sách sản phẩm
    apiClient
      .get('/products', { params: { limit: 50 } })
      .then((res: any) => {
        const items = res.items || [];
        setAvailableProducts(items);

        // Nếu có query param product
        const initialProdId = searchParams.get('product');
        if (initialProdId) {
          const match = items.find((p: any) => p.id === initialProdId);
          if (match) {
            setSelectedItems([
              {
                key: match.id,
                productId: match.id,
                productName: match.name,
                quantity: 1,
                unitPrice: match.currentPrice,
              },
            ]);
          }
        }
      })
      .catch(() => {});

    if (user) {
      form.setFieldsValue({
        customerName: user.name,
        customerPhone: user.phone || '',
      });
    }
  }, [user, form]);

  const handleAddProduct = (prodId: string) => {
    const prod = availableProducts.find((p) => p.id === prodId);
    if (!prod) return;

    if (selectedItems.some((i) => i.productId === prodId)) {
      message.warning('Mô hình này đã có trong danh sách báo giá');
      return;
    }

    const newItem: QuotationItemRow = {
      key: prod.id,
      productId: prod.id,
      productName: prod.name,
      quantity: 1,
      unitPrice: prod.currentPrice,
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setSelectedItems(selectedItems.filter((i) => i.key !== key));
  };

  const handleQuantityChange = (key: string, qty: number) => {
    setSelectedItems(
      selectedItems.map((i) => (i.key === key ? { ...i, quantity: qty } : i)),
    );
  };

  const totalAmount = selectedItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  const onFinish = async (values: any) => {
    if (selectedItems.length === 0) {
      message.error('Vui lòng chọn ít nhất một mô hình để nhận báo giá');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        note: values.note,
        items: selectedItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };

      const res = await apiClient.post('/quotations', payload);
      setCreatedQuotation(res);
      message.success('Đã tạo bản báo giá thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tạo báo giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdQuotation) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <Card style={{ borderRadius: 12, padding: '24px 16px' }}>
          <Result
            status="success"
            title="Phiếu Báo Giá Đã Được Tạo Thành Công!"
            subTitle={`Mã báo giá: ${createdQuotation.code} - Hiệu lực trong 7 ngày.`}
            extra={[
              <Button
                type="primary"
                key="print"
                icon={<PrinterOutlined />}
                style={{ background: '#e53935' }}
                onClick={() => window.print()}
              >
                In / Xuất Báo Giá (PDF)
              </Button>,
              <Button key="new" onClick={() => setCreatedQuotation(null)}>
                Tạo Báo Giá Khác
              </Button>,
            ]}
          />

          <Divider />

          <div>
            <Title level={4}>Chi Tiết Bảng Giá: {createdQuotation.code}</Title>
            <p><strong>Khách hàng:</strong> {createdQuotation.customerName} ({createdQuotation.customerPhone})</p>
            <p><strong>Ngày tạo:</strong> {new Date(createdQuotation.createdAt).toLocaleDateString('vi-VN')}</p>

            <Table
              dataSource={createdQuotation.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Tên mô hình',
                  render: (_, r: any) => r.product?.name || 'Mô hình',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  render: (q) => `x${q}`,
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  key: 'price',
                  render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
                },
                {
                  title: 'Thành tiền',
                  render: (_, r: any) =>
                    `${(Number(r.unitPrice) * r.quantity).toLocaleString('vi-VN')} đ`,
                },
              ]}
            />

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Title level={4} style={{ color: '#e53935', margin: 0 }}>
                Tổng cộng: {Number(createdQuotation.totalAmount).toLocaleString('vi-VN')} đ
              </Title>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Yêu cầu báo giá mô hình' },
        ]}
      />

      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <Title level={2} style={{ margin: '0 0 8px 0' }}>
          Yêu Cầu Báo Giá Mô Hình Gundam
        </Title>
        <Paragraph type="secondary">
          Bảng báo giá điện tử được áp dụng theo mức giá mới nhất tại thời điểm lập. Có thể xuất in trực tiếp
          thành file PDF gửi cho cá nhân hoặc doanh nghiệp.
        </Paragraph>
      </Card>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Card title="Thông Tin Khách Hàng" style={{ borderRadius: 12 }}>
              <Form.Item
                name="customerName"
                label="Họ và tên khách hàng / Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận báo giá' }]}
              >
                <Input placeholder="Nguyễn Văn A" size="large" />
              </Form.Item>

              <Form.Item
                name="customerPhone"
                label="Số điện thoại liên hệ"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="0912345678" size="large" />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú yêu cầu thêm">
                <Input.TextArea rows={3} placeholder="Ví dụ: Báo giá kèm phí ship hỏa tốc..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={14}>
            <Card title="Danh Sách Mô Hình Cần Báo Giá" style={{ borderRadius: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Chọn mô hình thêm vào bảng giá:
                </Text>
                <Select
                  placeholder="Tìm và chọn Gunpla..."
                  style={{ width: '100%' }}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleAddProduct}
                  value={null}
                >
                  {availableProducts.map((p) => (
                    <Option key={p.id} value={p.id}>
                      [{p.grade}] {p.name} - {Number(p.currentPrice).toLocaleString('vi-VN')} đ
                    </Option>
                  ))}
                </Select>
              </div>

              <Table
                dataSource={selectedItems}
                rowKey="key"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Tên mô hình',
                    dataIndex: 'productName',
                    key: 'name',
                  },
                  {
                    title: 'Số lượng',
                    key: 'quantity',
                    width: 90,
                    render: (_, r) => (
                      <InputNumber
                        min={1}
                        value={r.quantity}
                        onChange={(val) => handleQuantityChange(r.key, val || 1)}
                      />
                    ),
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'unitPrice',
                    key: 'price',
                    render: (p) => `${p.toLocaleString('vi-VN')} đ`,
                  },
                  {
                    title: '',
                    key: 'del',
                    width: 50,
                    render: (_, r) => (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(r.key)}
                      />
                    ),
                  },
                ]}
              />

              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <Text style={{ fontSize: 16 }}>Tổng giá trị báo giá: </Text>
                <Text strong style={{ fontSize: 22, color: '#e53935' }}>
                  {totalAmount.toLocaleString('vi-VN')} đ
                </Text>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={submitting}
                icon={<FileProtectOutlined />}
                style={{ background: '#e53935', marginTop: 24, height: 48, fontWeight: 700 }}
              >
                Tạo Báo Giá & Xuất PDF
              </Button>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

