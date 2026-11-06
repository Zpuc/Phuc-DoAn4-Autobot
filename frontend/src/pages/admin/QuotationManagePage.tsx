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
  message,
} from 'antd';
import { ReloadOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
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

export const QuotationManagePage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, []);

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
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý Bảng Báo Giá Điện Tử
            </Title>
            <Text type="secondary">
              Danh sách các phiếu báo giá mô hình gửi cho khách hàng và đối tác
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={fetchQuotations}>
              Làm mới
            </Button>
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
