import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Typography,
  Modal,
  Form,
  message,
  Descriptions,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  CarOutlined,
  PrinterOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { exportOrdersExcel } from '../../utils/excelExport';

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  shippingFee: number;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  total: number;
  status: string;
  paymentMethod: string;
  trackingCode?: string;
  note?: string;
  createdAt: string;
  items: OrderItem[];
}

export const OrderManagePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    searchParams.get('status') || undefined,
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [exporting, setExporting] = useState(false);

  // Modal Đổi trạng thái
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Modal Xem chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetchOrders = async (overrideSearch?: string, overrideStatus?: string) => {
    try {
      setLoading(true);
      const effectiveSearch = overrideSearch !== undefined ? overrideSearch : search;
      const effectiveStatus = overrideStatus !== undefined ? overrideStatus : statusFilter;
      const params: any = { page, limit: 10 };
      if (effectiveStatus) params.status = effectiveStatus;
      if (effectiveSearch) params.search = effectiveSearch;

      const res: any = await apiClient.get('/orders', { params });
      setOrders(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || undefined;
    setSearch(urlSearch);
    setStatusFilter(urlStatus);
    setPage(1);
    fetchOrders(urlSearch, urlStatus || '');
  }, [searchParams]);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleOpenStatusModal = (record: Order) => {
    setSelectedOrder(record);
    form.resetFields();
    form.setFieldsValue({
      status: record.status,
      trackingCode: record.trackingCode || '',
      note: '',
    });
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await apiClient.patch(`/orders/${selectedOrder.id}/status`, {
        status: values.status,
        trackingCode: values.trackingCode || undefined,
        note: values.note || undefined,
      });

      message.success('Cập nhật trạng thái đơn hàng thành công');
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (record: Order) => {
    setDetailOrder(record);
    setIsDetailModalOpen(true);
  };

  const handlePrintInvoice = (order: Order) => {
    const printWin = window.open('', '_blank', 'width=820,height=900');
    if (!printWin) {
      message.warning('Trình duyệt đang chặn cửa sổ bật lên (Pop-up), vui lòng cho phép để in phiếu!');
      return;
    }

    const discount = Number(order.discountAmount || 0);
    const isCod = order.paymentMethod === 'COD';
    const rowsHtml = order.items
      .map(
        (it, idx) => `
          <tr>
            <td style="text-align:center">${idx + 1}</td>
            <td><strong>${it.productName}</strong></td>
            <td style="text-align:center">x${it.quantity}</td>
            <td style="text-align:right">${Number(it.unitPrice).toLocaleString('vi-VN')} đ</td>
            <td style="text-align:right"><strong>${(Number(it.unitPrice) * it.quantity).toLocaleString('vi-VN')} đ</strong></td>
          </tr>`,
      )
      .join('');

    printWin.document.write(`
      <!doctype html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>Phiếu Giao Hàng - ${order.code}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; margin: 24px; line-height: 1.5; }
          .box { border: 2px solid #111827; padding: 20px 24px; border-radius: 6px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #dc2626; padding-bottom: 12px; margin-bottom: 16px; }
          .brand { font-size: 20px; font-weight: 800; color: #dc2626; letter-spacing: 0.5px; }
          .sub { font-size: 12px; color: #4b5563; margin-top: 2px; }
          .code-badge { font-size: 16px; font-weight: 700; background: #fef2f2; border: 1px solid #dc2626; color: #b91c1c; padding: 6px 12px; border-radius: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 13px; background: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 10px; }
          th { background: #111827; color: #fff; text-transform: uppercase; font-size: 11px; }
          .totals { width: 320px; margin-left: auto; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
          .cod-box { margin-top: 8px; padding: 10px 12px; background: #fef2f2; border: 2px dashed #dc2626; display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 800; color: #dc2626; }
          .sign { display: flex; justify-content: space-around; margin-top: 28px; text-align: center; font-size: 13px; }
          .sign div p { color: #6b7280; font-size: 11px; margin-top: 2px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="header">
            <div>
              <div class="brand">AUTOBOT GUNDAM STORE</div>
              <div class="sub">Phân phối Mô hình Gunpla Chính Hãng • Hotline/Zalo: 0967.708.350</div>
              <div class="sub">Tuyến giao vận: Hà Nội – Hưng Yên & Chuyển phát toàn quốc</div>
            </div>
            <div style="text-align:right">
              <div class="code-badge">${order.code}</div>
              <div class="sub" style="margin-top:6px">Ngày đặt: ${new Date(order.createdAt).toLocaleString('vi-VN')}</div>
            </div>
          </div>

          <h3 style="text-align:center; margin: 4px 0 14px; text-transform: uppercase; letter-spacing: 1px;">PHIẾU XUẤT KHO KIÊM GIAO NHẬN HÀNG HÓA</h3>

          <div class="info-grid">
            <div>
              <div><strong>Người nhận:</strong> ${order.customerName}</div>
              <div><strong>Điện thoại:</strong> ${order.customerPhone}</div>
              <div><strong>Địa chỉ giao:</strong> ${order.shippingAddress}</div>
            </div>
            <div>
              <div><strong>Phương thức TT:</strong> ${isCod ? 'Thu hộ tiền mặt (COD)' : 'Chuyển khoản ngân hàng'}</div>
              <div><strong>Mã vận đơn:</strong> ${order.trackingCode || 'Giao trực tiếp / Đang cập nhật'}</div>
              ${order.note ? `<div><strong>Ghi chú khách:</strong> ${order.note}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:45px">STT</th>
                <th>Tên Mô Hình Gunpla</th>
                <th style="width:65px">SL</th>
                <th style="width:120px">Đơn Giá</th>
                <th style="width:130px">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>

          <div class="totals">
            <div><span>Tạm tính tiền hàng:</span><strong>${Number(order.subtotal).toLocaleString('vi-VN')} đ</strong></div>
            ${discount > 0 ? `<div style="color:#16a34a"><span>Giảm giá Voucher (${order.couponCode || 'Coupon'}):</span><strong>-${discount.toLocaleString('vi-VN')} đ</strong></div>` : ''}
            <div><span>Phí vận chuyển:</span><strong>${Number(order.shippingFee).toLocaleString('vi-VN')} đ</strong></div>
            <div class="cod-box">
              <span>${isCod ? 'TIỀN THU HỘ (COD):' : 'TỔNG THANH TOÁN:'}</span>
              <span>${Number(order.total).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <p style="font-size:11px; color:#4b5563; margin-top:16px;">
            * Lưu ý đồng kiểm: Hàng mô hình lắp ráp hộp giấy, vui lòng quay video mở kiện hàng và kiểm tra runner còn nguyên túi seal trước khi xé bọc.
          </p>

          <div class="sign">
            <div>
              <strong>Thủ Kho / Người Đóng Gói</strong>
              <p>(Ký, ghi rõ họ tên)</p>
              <br/><br/><br/>
              <span>Autobot Store</span>
            </div>
            <div>
              <strong>Nhân Viên Giao Hàng</strong>
              <p>(Ký nhận bàn giao)</p>
            </div>
            <div>
              <strong>Khách Hàng Nhận Hàng</strong>
              <p>(Ký xác nhận đủ hộp nguyên vẹn)</p>
            </div>
          </div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'gold', label: 'Chờ xác nhận' },
      CONFIRMED: { color: 'purple', label: 'Đơn hàng đang được giao' },
      PACKING: { color: 'purple', label: 'Đơn hàng đang được giao' },
      SHIPPING: { color: 'purple', label: 'Đơn hàng đang được giao' },
      COMPLETED: { color: 'green', label: 'Hoàn thành' },
      CANCELLED: { color: 'red', label: 'Đã hủy (Hoàn kho)' },
      RETURNED: { color: 'magenta', label: 'Trả hàng' },
    };
    const item = map[status] || { color: 'default', label: status };
    return <Tag color={item.color}>{item.label}</Tag>;
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'code',
      key: 'code',
      width: 155,
      render: (code: string) => (
        <Text copyable strong style={{ color: '#1890ff', whiteSpace: 'nowrap' }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Khách Hàng',
      key: 'customer',
      width: 210,
      render: (_: any, record: Order) => (
        <div style={{ minWidth: 180 }}>
          <Text strong style={{ display: 'block', whiteSpace: 'nowrap' }}>
            {record.customerName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            SĐT: {record.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'total',
      key: 'total',
      width: 135,
      render: (val: number) => (
        <Text strong style={{ color: '#e53935', whiteSpace: 'nowrap' }}>
          {Number(val).toLocaleString('vi-VN')} đ
        </Text>
      ),
    },
    {
      title: 'Hình Thức',
      dataIndex: 'paymentMethod',
      key: 'payment',
      width: 130,
      render: (val: string) => (
        <Tag color={val === 'COD' ? 'orange' : 'green'}>
          {val === 'COD' ? 'COD' : 'Chuyển khoản'}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 175,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Mã Vận Đơn',
      dataIndex: 'trackingCode',
      key: 'tracking',
      width: 135,
      render: (code: string) => (code ? <Tag color="geekblue">{code}</Tag> : <Text type="secondary">-</Text>),
    },
    {
      title: 'Ngày Đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 115,
      render: (d: string) => (
        <span style={{ whiteSpace: 'nowrap' }}>{new Date(d).toLocaleDateString('vi-VN')}</span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 190,
      render: (_: any, record: Order) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<PrinterOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handlePrintInvoice(record)}
            title="In phiếu giao hàng"
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ background: '#e53935' }}
            onClick={() => handleOpenStatusModal(record)}
          >
            Đổi trạng thái
          </Button>
        </Space>
      ),
    },
  ];

  const handleExportOrdersExcel = async () => {
    if (orders.length === 0) {
      message.warning('Không có đơn hàng nào để xuất');
      return;
    }
    try {
      setExporting(true);
      // Lấy toàn bộ đơn hàng (hoặc 100 đơn gần nhất) nếu cần
      const res: any = await apiClient.get('/orders', {
        params: {
          limit: 200,
          status: statusFilter,
          search: search || undefined,
        },
      });
      const orderList = res.items || orders;
      await exportOrdersExcel(orderList);
      message.success('Đã xuất danh sách đơn hàng Excel (.xlsx) chuẩn kế toán thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý Đơn Đặt Hàng Gunpla
            </Title>
            <Text type="secondary">
              Theo dõi đơn đặt hàng, cập nhật đóng gói và nhập mã vận đơn GHN/GHTK
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button icon={<FileExcelOutlined />} onClick={handleExportOrdersExcel} loading={exporting} style={{ borderColor: '#52c41a', color: '#52c41a', fontWeight: 600 }}>
                Xuất Đơn Hàng Excel (.xlsx)
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => fetchOrders()}>
                Làm mới danh sách
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchOrders();
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <Option value="PENDING">Chờ xác nhận</Option>
              <Option value="SHIPPING">Đơn hàng đang được giao</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: (p) => setPage(p),
            showTotal: (totalCount) => `Tổng cộng ${totalCount} đơn hàng`,
          }}
        />
      </Card>

      {/* Modal Cập Nhật Trạng Thái Đơn Hàng */}
      <Modal
        title={`Cập Nhật Đơn Hàng: ${selectedOrder?.code}`}
        open={isStatusModalOpen}
        onOk={handleSaveStatus}
        onCancel={() => setIsStatusModalOpen(false)}
        confirmLoading={submitting}
        okText="Cập Nhật"
        cancelText="Đóng"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="status"
            label="Trạng thái tiến độ đơn hàng"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái mới' }]}
          >
            <Select size="large">
              <Option value="PENDING">1. Chờ xác nhận</Option>
              <Option value="SHIPPING">2. Đơn hàng đang được giao</Option>
              <Option value="COMPLETED">3. Hoàn thành</Option>
              <Option value="CANCELLED">Hủy đơn (Tự động hoàn lại tồn kho)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="trackingCode"
            label="Mã vận đơn bưu cục (GHN / GHTK / ViettelPost)"
          >
            <Input prefix={<CarOutlined />} placeholder="Ví dụ: GHN-192837482" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú nội bộ cho lần cập nhật này">
            <Input.TextArea rows={2} placeholder="Ví dụ: Đã gọi điện Zalo chốt đơn với khách..." />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            title="Lưu ý cơ chế tồn kho"
            description="Khi chuyển trạng thái sang 'Đã hủy', hệ thống sẽ tự động hoàn trả số lượng mô hình về lại kho hàng và ghi nhật ký xuất nhập."
          />
        </Form>
      </Modal>

      {/* Modal Chi Tiết Đơn Hàng */}
      <Modal
        title={`Chi Tiết Đơn Hàng: ${detailOrder?.code}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          detailOrder ? (
            <Button
              key="print"
              type="primary"
              icon={<PrinterOutlined />}
              style={{ background: '#1677ff' }}
              onClick={() => handlePrintInvoice(detailOrder)}
            >
              In Phiếu Giao Hàng
            </Button>
          ) : null,
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {detailOrder && (
          <div>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Mã đơn">{detailOrder.code}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(detailOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {detailOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {detailOrder.customerPhone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailOrder.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức">
                {detailOrder.paymentMethod}
              </Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn">
                {detailOrder.trackingCode || 'Chưa có'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Mô Hình Đặt Mua</Title>
            <Table
              dataSource={detailOrder.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Tên mô hình', dataIndex: 'productName' },
                { title: 'Số lượng', dataIndex: 'quantity', width: 80, render: (q) => `x${q}` },
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
              <p style={{ margin: '4px 0' }}>
                Tạm tính: <strong>{Number(detailOrder.subtotal).toLocaleString('vi-VN')} đ</strong>
              </p>
              {Number(detailOrder.discountAmount || 0) > 0 && (
                <p style={{ margin: '4px 0', color: '#52c41a' }}>
                  Giảm giá Voucher ({detailOrder.couponCode || 'Coupon'}):{' '}
                  <strong>-{Number(detailOrder.discountAmount).toLocaleString('vi-VN')} đ</strong>
                </p>
              )}
              <p style={{ margin: '4px 0 8px' }}>
                Phí giao hàng: <strong>{Number(detailOrder.shippingFee).toLocaleString('vi-VN')} đ</strong>
              </p>
              <Title level={4} style={{ color: '#e53935', margin: 0 }}>
                Tổng thanh toán: {Number(detailOrder.total).toLocaleString('vi-VN')} đ
              </Title>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

