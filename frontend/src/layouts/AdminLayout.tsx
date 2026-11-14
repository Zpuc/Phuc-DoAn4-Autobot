import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  theme,
  Badge,
  Popover,
  Tabs,
  Tag,
  Empty,
  Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  GiftOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CarOutlined,
  TeamOutlined,
  BellOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  StarFilled,
  ReloadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { GundamLogo } from '../components/GundamLogo';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AdminNotificationItem {
  id: string;
  type: 'ORDER_PENDING' | 'LOW_STOCK' | 'ORDER_CANCELLED' | 'NEW_REVIEW';
  title: string;
  message: string;
  badgeText: string;
  link: string;
  createdAt: string;
  isUrgent: boolean;
}

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();

  // Notification state
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchAdminNotifications = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/orders/admin/live-notifications');
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
      setPendingOrdersCount(res.pendingOrdersCount || 0);
      setLowStockCount(res.lowStockCount || 0);
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 20000);
    return () => clearInterval(interval);
  }, [fetchAdminNotifications, location.pathname]);

  const handleItemClick = (item: AdminNotificationItem) => {
    setNotifOpen(false);
    navigate(item.link);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'pending') return item.type === 'ORDER_PENDING';
    if (activeTab === 'stock') return item.type === 'LOW_STOCK';
    return true;
  });

  const notificationContent = (
    <div style={{ width: 380, maxWidth: '90vw' }}>
      {/* Header thông báo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 10,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 8,
        }}
      >
        <Space size={6}>
          <BellOutlined style={{ color: '#e53935', fontSize: 16 }} />
          <Text strong style={{ fontSize: 15 }}>
            Thông Báo Quản Trị
          </Text>
          {unreadCount > 0 && (
            <Tag color="red" style={{ borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
              {unreadCount} cần xử lý
            </Tag>
          )}
        </Space>
        <Tooltip title="Làm mới thông báo">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined spin={notifLoading} />}
            onClick={() => {
              setNotifLoading(true);
              fetchAdminNotifications().finally(() => setNotifLoading(false));
            }}
          />
        </Tooltip>
      </div>

      {/* Tabs phân loại */}
      <Tabs
        size="small"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'all',
            label: `Tất cả (${notifications.length})`,
          },
          {
            key: 'pending',
            label: (
              <span>
                Đơn mới{' '}
                {pendingOrdersCount > 0 && (
                  <Badge count={pendingOrdersCount} size="small" style={{ backgroundColor: '#faad14' }} />
                )}
              </span>
            ),
          },
          {
            key: 'stock',
            label: (
              <span>
                Kho{' '}
                {lowStockCount > 0 && (
                  <Badge count={lowStockCount} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                )}
              </span>
            ),
          },
        ]}
        style={{ marginBottom: 6 }}
      />

      {/* Danh sách thông báo */}
      <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
        {filteredNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo nào trong mục này"
            style={{ margin: '24px 0' }}
          />
        ) : (
          filteredNotifications.map((item) => {
            const isPending = item.type === 'ORDER_PENDING';
            const isStock = item.type === 'LOW_STOCK';
            const isCancelled = item.type === 'ORDER_CANCELLED';
            const isReview = item.type === 'NEW_REVIEW';

            let icon = <ShoppingOutlined style={{ color: '#faad14', fontSize: 16 }} />;
            let bgIcon = '#fffbe6';
            if (isStock) {
              icon = <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
              bgIcon = '#fff1f0';
            } else if (isCancelled) {
              icon = <CloseCircleOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />;
              bgIcon = '#f5f5f5';
            } else if (isReview) {
              icon = <StarFilled style={{ color: '#fa8c16', fontSize: 16 }} />;
              bgIcon = '#fff7e6';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  borderBottom: '1px solid #fafafa',
                  background: item.isUrgent ? '#fffbfb' : 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f9ff')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = item.isUrgent ? '#fffbfb' : 'transparent')
                }
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: bgIcon,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 2,
                    }}
                  >
                    <Text strong style={{ fontSize: 13 }} ellipsis>
                      {item.title}
                    </Text>
                    <Tag
                      color={isPending ? 'gold' : isStock ? 'red' : isReview ? 'orange' : 'default'}
                      style={{ fontSize: 10, marginRight: 0, padding: '0 4px', lineHeight: '18px' }}
                    >
                      {item.badgeText}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.4 }}>
                    {item.message}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11, color: '#bfbfbf', marginTop: 3, display: 'block' }}>
                    {formatTime(item.createdAt)}
                  </Text>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link nhanh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #f0f0f0',
          paddingTop: 8,
          marginTop: 6,
        }}
      >
        <Button
          type="link"
          size="small"
          style={{ padding: 0, fontSize: 12 }}
          onClick={() => {
            setNotifOpen(false);
            navigate('/admin/orders');
          }}
        >
          Xem Đơn Hàng →
        </Button>
        <Button
          type="link"
          size="small"
          style={{ padding: 0, fontSize: 12, color: '#ff4d4f' }}
          onClick={() => {
            setNotifOpen(false);
            navigate('/admin/inventory?warningOnly=true');
          }}
        >
          Xem Hàng Cảnh Báo →
        </Button>
      </div>
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-info',
      disabled: true,
      label: (
        <div>
          <strong>{user?.name}</strong>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Vai trò: {user?.role}
          </Text>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'shop',
      icon: <HomeOutlined />,
      label: <Link to="/">Về Trang Bán Hàng</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Tổng Quan (Dashboard)</Link>,
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: <Link to="/admin/users">Quản Lý Khách Hàng</Link>,
    },
    {
      key: '/admin/products',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/products">Quản Lý Sản Phẩm</Link>,
    },
    {
      key: '/admin/inventory',
      icon: <DatabaseOutlined />,
      label: <Link to="/admin/inventory">Quản Lý Tồn Kho</Link>,
    },
    {
      key: '/admin/orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/orders">Quản Lý Đơn Hàng</Link>,
    },
    {
      key: '/admin/order-progress',
      icon: <CarOutlined />,
      label: <Link to="/admin/order-progress">Quản Lý Tiến Độ Giao</Link>,
    },
    {
      key: '/admin/coupons',
      icon: <GiftOutlined />,
      label: <Link to="/admin/coupons">Mã Giảm Giá (Coupons)</Link>,
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: <Link to="/admin/reports">Báo Cáo Doanh Thu</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        width={255}
        collapsedWidth={64}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          background: '#001529',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 14px',
            background: '#002140',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <GundamLogo size="small" collapsed={collapsed} />
          </Link>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 40, height: 40 }}
          />

          <Space size="middle" align="center">
            {/* Chuông Thông Báo Quản Trị */}
            <Popover
              content={notificationContent}
              trigger="click"
              open={notifOpen}
              onOpenChange={setNotifOpen}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Tooltip title="Thông báo hệ thống">
                <Badge count={unreadCount} overflowCount={99} offset={[-3, 4]}>
                  <Button
                    type="text"
                    icon={
                      <BellOutlined
                        style={{
                          fontSize: 19,
                          color: unreadCount > 0 ? '#e53935' : '#595959',
                          transition: 'color 0.2s',
                        }}
                      />
                    }
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      background: notifOpen ? '#f0f0f0' : 'transparent',
                    }}
                  />
                </Badge>
              </Tooltip>
            </Popover>

            <Link to="/">
              <Button icon={<HomeOutlined />}>Xem Cửa Hàng</Button>
            </Link>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 600 }}>{user?.name || 'Quản trị viên'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

