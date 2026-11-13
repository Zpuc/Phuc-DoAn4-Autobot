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
  Row,
  Col,
  Statistic,
  Avatar,
  Popconfirm,
  message,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserOutlined,
  CrownOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  StarFilled,
  TeamOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { exportUsersExcel } from '../../utils/excelExport';

const { Title, Text } = Typography;
const { Option } = Select;

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  ordersCount: number;
  reviewsCount: number;
  addressesCount: number;
  totalSpent: number;
  rank: string;
}

interface UserOverview {
  totalUsers: number;
  adminCount: number;
  customerCount: number;
  totalMemberSpent: number;
}

export const UserManagePage: React.FC = () => {
  const { user: currentAdmin } = useAuthStore();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [exporting, setExporting] = useState(false);

  const fetchOverview = async () => {
    try {
      const res: any = await apiClient.get('/auth/admin/overview');
      setOverview(res);
    } catch {
      // Ignored
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res: any = await apiClient.get('/auth/admin/users', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          role: roleFilter || undefined,
        },
      });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'CUSTOMER') => {
    try {
      await apiClient.patch(`/auth/admin/users/${userId}/role`, { role: newRole });
      message.success(`Đã cập nhật vai trò người dùng thành ${newRole === 'ADMIN' ? 'Quản Trị Viên' : 'Khách Hàng'}`);
      fetchOverview();
      fetchUsers();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  const handleExportUsers = async () => {
    if (users.length === 0) {
      message.warning('Không có tài khoản nào để xuất');
      return;
    }
    try {
      setExporting(true);
      const res: any = await apiClient.get('/auth/admin/users', {
        params: {
          limit: 500,
          search: search || undefined,
          role: roleFilter || undefined,
        },
      });
      const exportList = res.items || users;
      await exportUsersExcel(exportList);
      message.success('Đã xuất danh sách thành viên Excel (.xlsx) chuẩn doanh nghiệp thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'VIP Kim Cương':
        return <Tag color="purple" icon={<CrownOutlined />} style={{ fontWeight: 600 }}>VIP Kim Cương</Tag>;
      case 'VIP Vàng':
        return <Tag color="gold" icon={<CrownOutlined />} style={{ fontWeight: 600 }}>VIP Vàng</Tag>;
      case 'Thành Viên Bạc':
        return <Tag color="blue" style={{ fontWeight: 500 }}>Thành Viên Bạc</Tag>;
      default:
        return <Tag color="default">Thành Viên Mới</Tag>;
    }
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: 'Khách hàng / Thành viên',
      key: 'user',
      render: (_, record) => {
        const isMe = record.id === currentAdmin?.id;
        return (
          <Space size={12} align="center">
            <Avatar
              size={42}
              style={{
                backgroundColor: record.role === 'ADMIN' ? '#e53935' : '#1677ff',
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              {record.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Space size={6} wrap>
                <Text strong style={{ fontSize: 14 }}>
                  {record.name}
                </Text>
                {isMe && <Tag color="red">Bạn</Tag>}
              </Space>
              <div style={{ marginTop: 2 }}>{getRankBadge(record.rank)}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Email & Số Điện Thoại',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MailOutlined style={{ color: '#8c8c8c' }} />
            <Text copyable style={{ fontSize: 13 }}>
              {record.email}
            </Text>
          </div>
          {record.phone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text copyable style={{ fontSize: 12 }}>
                {record.phone}
              </Text>
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chưa cập nhật SĐT
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role: string) => (
        <Tag
          color={role === 'ADMIN' ? 'red' : 'blue'}
          icon={role === 'ADMIN' ? <SafetyCertificateOutlined /> : <UserOutlined />}
          style={{ padding: '2px 8px', fontWeight: 600 }}
        >
          {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
        </Tag>
      ),
    },
    {
      title: 'Đơn Hàng / Đánh Giá',
      key: 'activity',
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Link to={`/admin/orders?search=${encodeURIComponent(record.email)}`}>
            <Tag color="cyan" icon={<ShoppingOutlined />} style={{ cursor: 'pointer' }}>
              {record.ordersCount} đơn hàng
            </Tag>
          </Link>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            <StarFilled style={{ color: '#faad14', marginRight: 4 }} />
            {record.reviewsCount} đánh giá mô hình
          </span>
        </Space>
      ),
    },
    {
      title: 'Tổng Chi Tiêu Tích Lũy',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 170,
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (spent: number) => (
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ color: '#e53935', fontSize: 14 }}>
            {spent.toLocaleString('vi-VN')} đ
          </Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>Từ đơn hoàn tất</div>
        </div>
      ),
    },
    {
      title: 'Ngày Tham Gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (d: string) => (
        <span style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
          {new Date(d).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Phân Quyền',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const isMe = record.id === currentAdmin?.id;
        const targetRole = record.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
        const actionLabel = record.role === 'ADMIN' ? 'Hạ về Khách' : 'Nâng làm Admin';

        return (
          <Space size="small">
            {isMe ? (
              <Tooltip title="Tài khoản của bạn đang đăng nhập">
                <Button size="small" disabled>
                  Chính bạn
                </Button>
              </Tooltip>
            ) : (
              <Popconfirm
                title={`Xác nhận đổi vai trò?`}
                description={`Bạn có chắc muốn đổi vai trò của "${record.name}" thành ${
                  targetRole === 'ADMIN' ? 'Quản Trị Viên (ADMIN)' : 'Khách Hàng (CUSTOMER)'
                }?`}
                onConfirm={() => handleRoleChange(record.id, targetRole)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  type={record.role === 'ADMIN' ? 'default' : 'primary'}
                  danger={record.role === 'ADMIN'}
                  style={{
                    borderRadius: 6,
                    background: record.role === 'ADMIN' ? undefined : '#e53935',
                  }}
                >
                  {actionLabel}
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header & Công cụ */}
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              Quản Lý Khách Hàng & Thành Viên
            </Title>
            <Text type="secondary">
              Quản lý danh sách tài khoản, theo dõi phân hạng tích lũy chi tiêu và phân quyền quản trị
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportUsers}
                loading={exporting}
                style={{ borderColor: '#52c41a', color: '#52c41a', fontWeight: 600 }}
              >
                Xuất Excel Thành Viên (.xlsx)
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchOverview();
                  fetchUsers();
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Tổng số thành viên"
              value={overview?.totalUsers || 0}
              suffix="tài khoản"
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Quản trị viên (Admin)"
              value={overview?.adminCount || 0}
              suffix="admin"
              valueStyle={{ color: '#e53935', fontWeight: 'bold' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Khách hàng mua sắm"
              value={overview?.customerCount || 0}
              suffix="khách"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Tổng chi tiêu từ thành viên"
              value={overview?.totalMemberSpent || 0}
              precision={0}
              suffix="đ"
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thanh lọc & Bảng người dùng */}
      <Card style={{ borderRadius: 8 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo tên khách, email, số điện thoại..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchUsers();
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo vai trò"
              allowClear
              style={{ width: '100%' }}
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
            >
              <Option value="ADMIN">Quản Trị Viên (ADMIN)</Option>
              <Option value="CUSTOMER">Khách Hàng (CUSTOMER)</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            total,
            pageSize: 10,
            onChange: (p) => setPage(p),
            showTotal: (totalCount) => `Tổng cộng ${totalCount} tài khoản thành viên`,
          }}
        />
      </Card>
    </div>
  );
};
