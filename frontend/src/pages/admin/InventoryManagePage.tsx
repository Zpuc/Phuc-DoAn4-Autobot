import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  InputNumber,
  Select,
  Typography,
  message,
  Tabs,
  Switch,
  Image,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DatabaseOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';
import { exportInventoryExcel } from '../../utils/excelExport';

const { Title, Text } = Typography;

interface InventoryOverview {
  totalBoxes: number;
  totalTrackedProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  grade: string | null;
  scale: string | null;
  brand: string;
  category: string;
  imageUrl: string | null;
  quantity: number;
  minStock: number;
  currentPrice: number;
  costPrice: number;
  stockStatus: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt: string;
}

interface InventoryLog {
  id: string;
  productId: string;
  change: number;
  reason: string;
  refId: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    grade: string | null;
  };
}

export const InventoryManagePage: React.FC = () => {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [warningOnly, setWarningOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [exporting, setExporting] = useState(false);

  const handleExportInventoryExcel = async () => {
    if (items.length === 0) {
      message.warning('Không có dữ liệu tồn kho để xuất');
      return;
    }
    try {
      setExporting(true);
      // Fetch full inventory if needed
      const data: any = await apiClient.get('/inventory', {
        params: {
          search: search || undefined,
          warningOnly: warningOnly ? 'true' : undefined,
          limit: 500,
        },
      });
      const fullItems = data.items || items;
      await exportInventoryExcel(fullItems, logs);
      message.success('Đã xuất file kiểm kê tồn kho Excel (.xlsx) chuẩn kho bãi thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xuất file kiểm kê Excel');
    } finally {
      setExporting(false);
    }
  };

  // Modal Nhập Kho
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedProductForImport, setSelectedProductForImport] = useState<InventoryItem | null>(null);
  const [importForm] = Form.useForm();
  const [importSubmitting, setImportSubmitting] = useState(false);

  // Modal Kiểm Kê / Điều chỉnh kho
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<InventoryItem | null>(null);
  const [adjustForm] = Form.useForm();
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Tải tổng quan và danh sách tồn kho
  const fetchOverview = async () => {
    try {
      const data: any = await apiClient.get('/inventory/overview');
      setOverview(data);
    } catch {
      // bỏ qua lỗi im lặng
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.get('/inventory', {
        params: {
          search: search || undefined,
          warningOnly: warningOnly ? 'true' : undefined,
          limit: 50,
        },
      });
      setItems(data.items || []);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const data: any = await apiClient.get('/inventory/logs', {
        params: { limit: 50 },
      });
      setLogs(data || []);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải lịch sử biến động kho');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchInventory();
  }, [warningOnly]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  // Xử lý nộp form Nhập Kho
  const handleImportSubmit = async (values: any) => {
    if (!selectedProductForImport) return;
    setImportSubmitting(true);
    try {
      await apiClient.post('/inventory/import', {
        productId: selectedProductForImport.id,
        quantity: values.quantity,
        unitCost: values.unitCost || undefined,
        note: values.note,
      });
      message.success('Nhập kho thành công!');
      setImportModalVisible(false);
      importForm.resetFields();
      fetchOverview();
      fetchInventory();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi nhập kho');
    } finally {
      setImportSubmitting(false);
    }
  };

  // Xử lý nộp form Kiểm Kê
  const handleAdjustSubmit = async (values: any) => {
    if (!selectedProductForAdjust) return;
    setAdjustSubmitting(true);
    try {
      await apiClient.post('/inventory/adjust', {
        productId: selectedProductForAdjust.id,
        actualQuantity: values.actualQuantity,
        reason: values.reason,
        note: values.note,
      });
      message.success('Cập nhật kiểm kê tồn kho thành công!');
      setAdjustModalVisible(false);
      adjustForm.resetFields();
      fetchOverview();
      fetchInventory();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi điều chỉnh kho');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const inventoryColumns: ColumnsType<InventoryItem> = [
    {
      title: 'Mô hình',
      key: 'product',
      render: (_, record) => (
        <Space orientation="horizontal" size={12} align="center">
          <Image
            src={record.imageUrl || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120'}
            alt={record.name}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }}
            fallback="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=120"
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: 14 }}>
              {record.name}
            </Text>
            <Space size={6} wrap style={{ marginTop: 2 }}>
              <Tag color="geekblue">{record.sku}</Tag>
              {record.grade && <Tag color="red">{record.grade}</Tag>}
              {record.scale && <Tag>{record.scale}</Tag>}
              <Tag color="default">{record.brand}</Tag>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 130,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty: number, record) => (
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{
              fontSize: 16,
              color: qty <= 0 ? '#ff4d4f' : qty <= record.minStock ? '#fa8c16' : '#52c41a',
            }}
          >
            {qty} hộp
          </Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>Min: {record.minStock}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'stockStatus',
      width: 140,
      render: (_, record) => {
        if (record.stockStatus === 'OUT_OF_STOCK') {
          return <Tag color="error">HẾT HÀNG</Tag>;
        }
        if (record.stockStatus === 'LOW_STOCK') {
          return <Tag color="warning">SẮP HẾT (≤ {record.minStock})</Tag>;
        }
        return <Tag color="success">ĐỦ HÀNG</Tag>;
      },
    },
    {
      title: 'Giá bán / Giá vốn',
      key: 'pricing',
      width: 170,
      render: (_, record) => (
        <div>
          <div>
            <Text strong style={{ color: '#e53935' }}>
              {record.currentPrice.toLocaleString('vi-VN')} đ
            </Text>
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            Vốn: {record.costPrice > 0 ? `${record.costPrice.toLocaleString('vi-VN')} đ` : 'Chưa có'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác kho',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size={8}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProductForImport(record);
              importForm.setFieldsValue({
                quantity: 5,
                unitCost: record.costPrice || undefined,
                note: '',
              });
              setImportModalVisible(true);
            }}
          >
            Nhập kho
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedProductForAdjust(record);
              adjustForm.setFieldsValue({
                actualQuantity: record.quantity,
                reason: 'ADJUST',
                note: '',
              });
              setAdjustModalVisible(true);
            }}
          >
            Kiểm kê
          </Button>
        </Space>
      ),
    },
  ];

  const logColumns: ColumnsType<InventoryLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val: string) => new Date(val).toLocaleString('vi-VN'),
    },
    {
      title: 'Mô hình Gundam',
      key: 'product',
      render: (_, record) => (
        <div>
          <Text strong>{record.product?.name || 'N/A'}</Text>
          <div>
            <Tag color="geekblue" style={{ marginTop: 2 }}>
              {record.product?.sku}
            </Tag>
            {record.product?.grade && <Tag color="red">{record.product?.grade}</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Biến động',
      dataIndex: 'change',
      key: 'change',
      width: 120,
      render: (change: number) => {
        const isPos = change > 0;
        return (
          <Tag color={isPos ? 'green' : 'volcano'} style={{ fontWeight: 'bold', fontSize: 13 }}>
            {isPos ? `+${change}` : `${change}`} hộp
          </Tag>
        );
      },
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => {
        const map: Record<string, { label: string; color: string }> = {
          IMPORT: { label: 'Nhập hàng', color: 'blue' },
          SALE: { label: 'Xuất bán theo đơn', color: 'orange' },
          ORDER_PLACED: { label: 'Khách đặt đơn', color: 'orange' },
          RETURN: { label: 'Hủy đơn hoàn kho', color: 'cyan' },
          ADJUST: { label: 'Kiểm kê định kỳ', color: 'purple' },
          DAMAGE: { label: 'Hư hỏng/Hao hụt', color: 'red' },
          INITIAL: { label: 'Khởi tạo ban đầu', color: 'default' },
        };
        const config = map[reason] || { label: reason, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Mã tham chiếu / Ghi chú',
      dataIndex: 'refId',
      key: 'refId',
      render: (val: string | null) => val || <Text type="secondary">---</Text>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản Lý Tồn Kho Gunpla
        </Title>
        <Text type="secondary">
          Kiểm soát số lượng hộp thực tế, cảnh báo kit sắp hết và ghi vết toàn bộ lịch sử xuất nhập kho.
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Tổng số hộp trong kho"
              value={overview?.totalBoxes || 0}
              suffix="hộp"
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Mã sản phẩm quản lý"
              value={overview?.totalTrackedProducts || 0}
              suffix="kit"
              valueStyle={{ fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Cảnh báo sắp hết (≤ 2)"
              value={overview?.lowStockCount || 0}
              suffix="kit"
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Kit đã hết hàng (0 hộp)"
              value={overview?.outOfStockCount || 0}
              suffix="kit"
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Card bordered={false} style={{ borderRadius: 8 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportInventoryExcel}
                loading={exporting}
                style={{ borderColor: '#52c41a', color: '#52c41a', fontWeight: 600 }}
              >
                Xuất Kiểm Kê Excel (.xlsx)
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchOverview();
                  if (activeTab === 'inventory') fetchInventory();
                  else fetchLogs();
                }}
              >
                Làm mới
              </Button>
            </Space>
          }
          items={[
            {
              key: 'inventory',
              label: (
                <span>
                  <DatabaseOutlined /> Tồn kho hiện tại
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <Space size={12}>
                      <Input
                        placeholder="Tìm theo tên mô hình hoặc SKU..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={fetchInventory}
                        style={{ width: 280 }}
                        allowClear
                      />
                      <Button type="primary" onClick={fetchInventory}>
                        Tìm kiếm
                      </Button>
                    </Space>

                    <Space size={8}>
                      <Switch
                        checked={warningOnly}
                        onChange={(val) => setWarningOnly(val)}
                      />
                      <Text>Chỉ hiện kit sắp hết / hết hàng</Text>
                    </Space>
                  </div>

                  <Table
                    columns={inventoryColumns}
                    dataSource={items}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15, showTotal: (t) => `Tổng cộng ${t} sản phẩm` }}
                  />
                </div>
              ),
            },
            {
              key: 'logs',
              label: (
                <span>
                  <HistoryOutlined /> Lịch sử biến động kho
                </span>
              ),
              children: (
                <Table
                  columns={logColumns}
                  dataSource={logs}
                  rowKey="id"
                  loading={logsLoading}
                  pagination={{ pageSize: 15, showTotal: (t) => `Tổng cộng ${t} giao dịch kho` }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Nhập Hàng */}
      <Modal
        title={
          <div>
            <PlusOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            Nhập hàng vào kho: {selectedProductForImport?.name}
          </div>
        }
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={importForm} layout="vertical" onFinish={handleImportSubmit} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <Text type="secondary">Mã SKU: </Text>
            <Text strong>{selectedProductForImport?.sku}</Text>
            <br />
            <Text type="secondary">Tồn kho hiện tại: </Text>
            <Text strong style={{ color: '#1677ff' }}>
              {selectedProductForImport?.quantity} hộp
            </Text>
          </div>

          <Form.Item
            name="quantity"
            label="Số lượng nhập thêm (hộp)"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber min={1} max={9999} style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="unitCost"
            label="Giá vốn nhập đợt này (VNĐ - tùy chọn)"
            tooltip="Nếu để trống sẽ giữ nguyên giá vốn hiện tại"
          >
            <InputNumber
              min={0}
              step={10000}
              style={{ width: '100%' }}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú / Số hóa đơn chứng từ nhập">
            <Input placeholder="Ví dụ: Lô hàng Bandai Shizuoka T11/2026..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setImportModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={importSubmitting}>
                Xác nhận nhập kho
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Modal Kiểm Kê / Điều Chỉnh Kho */}
      <Modal
        title={
          <div>
            <EditOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            Kiểm kê / Điều chỉnh kho: {selectedProductForAdjust?.name}
          </div>
        }
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={adjustForm} layout="vertical" onFinish={handleAdjustSubmit} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <Text type="secondary">Mã SKU: </Text>
            <Text strong>{selectedProductForAdjust?.sku}</Text>
            <br />
            <Text type="secondary">Tồn ghi nhận trên hệ thống: </Text>
            <Text strong style={{ color: '#fa8c16' }}>
              {selectedProductForAdjust?.quantity} hộp
            </Text>
          </div>

          <Form.Item
            name="actualQuantity"
            label="Số lượng thực tế đếm được (hộp)"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng kiểm kê thực tế' }]}
          >
            <InputNumber min={0} max={9999} style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do điều chỉnh"
            rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
          >
            <Select
              options={[
                { label: 'Kiểm kê kho định kỳ (ADJUST)', value: 'ADJUST' },
                { label: 'Hao hụt / Rách hộp / Hư hỏng linh kiện (DAMAGE)', value: 'DAMAGE' },
                { label: 'Khách trả hàng trực tiếp tại quầy (RETURN)', value: 'RETURN' },
                { label: 'Cập nhật lại số liệu ban đầu (INITIAL)', value: 'INITIAL' },
              ]}
            />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú kiểm kê">
            <Input placeholder="Ví dụ: Kiểm kê định kỳ kho tháng 11..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setAdjustModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={adjustSubmitting}>
                Cập nhật số liệu kiểm kê
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
