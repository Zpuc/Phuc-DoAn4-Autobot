import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Descriptions,
  Row,
  Col,
  Form,
  Input,
  Select,
  InputNumber,
  message,
} from 'antd';
import { ReloadOutlined, EyeOutlined, PrinterOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/client';

const { Title, Text } = Typography;

interface Quotation {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  validUntil?: string;
  totalAmount: number;
  status: string;
  note?: string;
  createdAt: string;
  items: {
    id: string;
    product: { name: string; sku: string; grade?: string; scale?: string };
    quantity: number;
    unitPrice: number;
  }[];
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  grade?: string;
  currentPrice: number;
}

export const QuotationManagePage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal tạo báo giá mới
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/quotations');
      setQuotations(res || []);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách báo giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    apiClient
      .get('/products', { params: { limit: 100 } })
      .then((res: any) => setProducts(res?.items || []))
      .catch(() => {});
  }, []);

  const handleCreateQuotation = async (values: any) => {
    try {
      setCreating(true);
      await apiClient.post('/quotations', {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        note: values.note,
        items: values.items,
      });
      message.success('Đã lập phiếu báo giá mới thành công!');
      setCreateModalOpen(false);
      form.resetFields();
      fetchQuotations();
    } catch (err: any) {
      message.error(err.message || 'Không thể tạo phiếu báo giá');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      title: 'Mã Báo Giá',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <Text copyable strong style={{ color: '#1890ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Khách Hàng',
      dataIndex: 'customerName',
      key: 'customer',
      render: (val: string, r: Quotation) => (
        <div>
          <Text strong>{val}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            SĐT: {r.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tổng Giá Trị',
      dataIndex: 'totalAmount',
      key: 'total',
      render: (val: number) => (
        <Text strong style={{ color: '#e53935' }}>
          {Number(val).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: 'Ngày Lập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hạn Hiệu Lực',
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (d: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : 'Không thời hạn'),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_: any, record: Quotation) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedQuote(record);
              setIsModalOpen(true);
            }}
          >
            Chi tiết
          </Button>
          <Button
            type="text"
            icon={<PrinterOutlined />}
            onClick={() => {
              setSelectedQuote(record);
              setIsModalOpen(true);
              setTimeout(() => window.print(), 300);
            }}
          >
            In PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý Bảng Báo Giá Điện Tử
            </Title>
            <Text type="secondary">
              Danh sách các phiếu báo giá mô hình gửi cho khách hàng và đối tác
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchQuotations}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: '#e53935' }}
                onClick={() => {
                  form.resetFields();
                  form.setFieldsValue({
                    items: [{ productId: undefined, quantity: 1, unitPrice: 0 }],
                  });
                  setCreateModalOpen(true);
                }}
              >
                Lập Báo Giá Mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={quotations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Lập phiếu báo giá mới */}
      <Modal
        title="Lập Phiếu Báo Giá Mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateQuotation} style={{ marginTop: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerName"
                label="Tên khách hàng / Đối tác"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerPhone"
                label="Số điện thoại liên hệ"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>Danh sách mô hình báo giá</Text>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => add({ quantity: 1, unitPrice: 0 })}>
                    Thêm dòng
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={8} key={key} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'productId']}
                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          showSearch
                          optionFilterProp="label"
                          placeholder="Chọn mô hình..."
                          onChange={(val) => {
                            const found = products.find((p) => p.id === val);
                            if (found) {
                              const currentItems = form.getFieldValue('items') || [];
                              currentItems[name] = {
                                ...currentItems[name],
                                productId: val,
                                unitPrice: found.currentPrice || 0,
                              };
                              form.setFieldsValue({ items: [...currentItems] });
                            }
                          }}
                          options={products.map((p) => ({
                            value: p.id,
                            label: `[${p.grade || 'Gunpla'}] ${p.name}`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'SL' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="SL" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'unitPrice']}
                        rules={[{ required: true, message: 'Đơn giá' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          placeholder="Đơn giá"
                          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: 'center' }}>
                      {fields.length > 1 && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                      )}
                    </Col>
                  </Row>
                ))}
              </div>
            )}
          </Form.List>

          <Form.Item name="note" label="Ghi chú báo giá" style={{ marginTop: 12 }}>
            <Input.TextArea rows={2} placeholder="Điều khoản chiết khấu, thời gian giao hàng dự kiến..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creating} style={{ background: '#e53935' }}>
                Lưu Phiếu Báo Giá
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Xem chi tiết phiếu báo giá */}
      <Modal
        title={`Phiếu Báo Giá: ${selectedQuote?.code}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In Báo Giá
          </Button>,
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedQuote && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã báo giá">{selectedQuote.code}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="blue">{selectedQuote.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedQuote.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {selectedQuote.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày lập">
                {new Date(selectedQuote.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Hiệu lực đến">
                {selectedQuote.validUntil
                  ? new Date(selectedQuote.validUntil).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </Descriptions.Item>
              {selectedQuote.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedQuote.note}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Title level={5}>Danh Sách Sản Phẩm</Title>
            <Table
              dataSource={selectedQuote.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mô hình',
                  render: (_, r) => r.product?.name || 'Mô hình',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  render: (q) => `x${q}`,
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
                },
                {
                  title: 'Thành tiền',
                  render: (_, r) =>
                    `${(Number(r.unitPrice) * r.quantity).toLocaleString('vi-VN')} đ`,
                },
              ]}
            />

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Title level={4} style={{ color: '#e53935', margin: 0 }}>
                Tổng cộng: {Number(selectedQuote.totalAmount).toLocaleString('vi-VN')} đ
              </Title>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
