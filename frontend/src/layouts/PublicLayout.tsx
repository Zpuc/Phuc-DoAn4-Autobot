import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Space, Badge, Dropdown, Avatar, Typography, Row, Col, Divider, Tag, Popover, Empty, Drawer, Grid } from 'antd';
import type { MenuProps } from 'antd';
import {
  RocketOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  AppstoreOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  LoginOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  CheckOutlined,
  MenuOutlined,
  OrderedListOutlined,
  CarOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { GundamLogo } from '../components/GundamLogo';
import { FloatingContactWidget } from '../components/FloatingContactWidget';
import { apiClient } from '../api/client';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

interface NotificationItem {
  id: string;
  orderCode?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.getTotalCount());
  const loadCartFromStorage = useCartStore((state) => state.loadFromStorage);
  const wishlistItems = useWishlistStore((state) => state.items);
  const loadWishlistFromStorage = useWishlistStore((state) => state.loadFromStorage);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res: any = await apiClient.get('/orders/my-notifications');
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCartFromStorage();
    loadWishlistFromStorage();
  }, [loadCartFromStorage, loadWishlistFromStorage]);

  useEffect(() => {
    fetchNotifications();
    if (!isAuthenticated) return;
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [isAuthenticated, location.pathname, fetchNotifications]);

  const handleClickNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await apiClient.patch(`/orders/my-notifications/${item.id}/read`);
        fetchNotifications();
      } catch {
        // ignore
      }
    }
    setNotifOpen(false);
    if (item.orderCode) {
      navigate(`/track-order?code=${item.orderCode}`);
    } else {
      navigate('/my-orders');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/orders/my-notifications/read-all');
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const notificationContent = (
    <div style={{ width: isMobile ? 'min(300px, 82vw)' : 340, maxHeight: 380, overflowY: 'auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 8,
          marginBottom: 8,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          Thông báo đơn hàng ({unreadCount} chưa đọc)
        </Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleMarkAllRead} style={{ padding: 0 }}>
            Đọc tất cả
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo đơn hàng nào" />
      ) : (
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClickNotification(item)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: item.isRead ? '#fafafa' : '#fff1f0',
                border: item.isRead ? '1px solid #f0f0f0' : '1px solid #ffa39e',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text strong style={{ fontSize: 13, color: item.isRead ? '#262626' : '#e53935' }}>
                  {item.title}
                </Text>
                {!item.isRead && <Badge status="error" />}
              </div>
              <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.4 }}>{item.message}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                {new Date(item.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </Space>
      )}
    </div>
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div>
          <strong>{user?.name}</strong>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email} ({user?.role})
          </Text>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ & Sổ địa chỉ</Link>,
    },
    ...(isAdmin
      ? [
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Trang Quản Trị (Admin)</Link>,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const navItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <AppstoreOutlined />,
      label: <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>,
    },
    {
      key: '/products',
      icon: <RocketOutlined />,
      label: <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Danh Mục Gundam</Link>,
    },
    {
      key: '/my-orders',
      icon: <OrderedListOutlined />,
      label: <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>Đơn Hàng Của Tôi</Link>,
    },
    {
      key: '/track-order',
      icon: <CarOutlined />,
      label: <Link to="/track-order" onClick={() => setMobileMenuOpen(false)}>Tra Cứu Tiến Độ</Link>,
    },
    {
      key: '/quotations',
      icon: <CustomerServiceOutlined />,
      label: <Link to="/quotations" onClick={() => setMobileMenuOpen(false)}>Yêu Cầu Báo Giá</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#141414',
          padding: isMobile ? '0 12px' : '0 20px',
          height: 64,
          lineHeight: '64px',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', height: '100%', textDecoration: 'none', lineHeight: 1 }}>
          <GundamLogo size={isMobile ? 'small' : 'medium'} />
        </Link>

        {!isMobile && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            style={{ background: 'transparent', flex: 1, marginLeft: 20, borderBottom: 'none', lineHeight: '64px', height: 64 }}
            items={navItems}
          />
        )}

        <Space size={isMobile ? 8 : 10}>
          {!isMobile && (
            <Link to="/wishlist">
              <Badge count={wishlistItems.length} showZero={false} offset={[-2, 6]}>
                <Button
                  icon={<HeartOutlined />}
                  ghost
                  style={{ color: '#fff', borderColor: '#434343' }}
                >
                  Yêu Thích
                </Button>
              </Badge>
            </Link>
          )}

          <Link to="/cart">
            <Badge count={cartCount} showZero={false} offset={[-2, 6]}>
              {isMobile ? (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ShoppingCartOutlined style={{ fontSize: 17 }} />}
                  style={{ background: '#e53935' }}
                />
              ) : (
                <Button type="primary" icon={<ShoppingCartOutlined />} style={{ background: '#e53935' }}>
                  Giỏ Hàng
                </Button>
              )}
            </Badge>
          </Link>

          {isAuthenticated && user && (
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              open={notifOpen}
              onOpenChange={(v) => {
                setNotifOpen(v);
                if (v) fetchNotifications();
              }}
            >
              <Badge count={unreadCount} showZero={false} offset={[-2, 6]}>
                <Button
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 17 }} />}
                  ghost
                  style={{ color: '#fff', borderColor: '#434343' }}
                />
              </Badge>
            </Popover>
          )}

          {!isMobile && (
            isAuthenticated && user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Button type="text" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar style={{ backgroundColor: '#e53935' }} icon={<UserOutlined />} />
                  <span>{user.name}</span>
                </Button>
              </Dropdown>
            ) : (
              <Space>
                <Link to="/login">
                  <Button type="text" icon={<LoginOutlined />} style={{ color: '#fff' }}>
                    Đăng Nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button ghost style={{ color: '#fff', borderColor: '#e53935' }}>
                    Đăng Ký
                  </Button>
                </Link>
              </Space>
            )
          )}

          {isMobile && (
            <Button
              icon={<MenuOutlined style={{ fontSize: 18 }} />}
              ghost
              style={{ color: '#fff', borderColor: '#434343' }}
              onClick={() => setMobileMenuOpen(true)}
            />
          )}
        </Space>
      </Header>

      <Drawer
        title={<GundamLogo size="small" />}
        placement="right"
        width={285}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{
          header: { background: '#141414', borderBottom: '1px solid #303030', color: '#fff' },
          body: { padding: '16px 12px' },
        }}
        closeIcon={<span style={{ color: '#fff', fontSize: 18 }}>✕</span>}
      >
        {isAuthenticated && user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px',
              background: '#fff1f0',
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <Avatar size={42} style={{ backgroundColor: '#e53935' }} icon={<UserOutlined />} />
            <div style={{ overflow: 'hidden' }}>
              <Text strong style={{ display: 'block', fontSize: 14 }}>
                {user.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user.email}
              </Text>
            </div>
          </div>
        ) : (
          <Space style={{ width: '100%', marginBottom: 16 }} size={10}>
            <Button
              type="primary"
              block
              icon={<LoginOutlined />}
              style={{ background: '#e53935' }}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Đăng Nhập
            </Button>
            <Button
              block
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/register');
              }}
            >
              Đăng Ký
            </Button>
          </Space>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 'none' }}
          items={[
            ...(navItems || []),
            { type: 'divider' },
            {
              key: '/wishlist',
              icon: <HeartOutlined />,
              label: (
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                  Yêu Thích ({wishlistItems.length})
                </Link>
              ),
            },
            ...(isAuthenticated
              ? [
                  {
                    key: '/profile',
                    icon: <UserOutlined />,
                    label: (
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        Hồ Sơ & Sổ Địa Chỉ
                      </Link>
                    ),
                  },
                ]
              : []),
            ...(isAdmin
              ? [
                  {
                    key: '/admin',
                    icon: <DashboardOutlined />,
                    label: (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        Trang Quản Trị (Admin)
                      </Link>
                    ),
                  },
                ]
              : []),
          ]}
        />

        {isAuthenticated && (
          <div style={{ marginTop: 20, padding: '0 8px' }}>
            <Button
              danger
              block
              icon={<LogoutOutlined />}
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              Đăng Xuất Tài Khoản
            </Button>
          </div>
        )}
      </Drawer>

      <Content style={{ minHeight: 'calc(100vh - 134px)' }}>
        <Outlet />
      </Content>

      <Footer
        style={{
          background: '#141414',
          color: '#8c8c8c',
          padding: '40px 50px 24px',
          borderTop: '2px solid #e53935',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={8}>
              <Space direction="vertical" size={8}>
                <GundamLogo size={36} />
                <Text style={{ color: '#8c8c8c', fontSize: 13, lineHeight: 1.6 }}>
                  Hệ thống chuyên phân phối mô hình Gunpla chính hãng Bandai, Daban, Motor Nuclear... Cập nhật giá theo thời gian thực và quản lý xuất nhập tồn kho chuyên nghiệp.
                </Text>
                <div>
                  <Tag color="red">100% Chính Hãng</Tag>
                  <Tag color="blue">Box Đẹp MISB</Tag>
                  <Tag color="green">COD Toàn Quốc</Tag>
                </div>
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Space direction="vertical" size={8}>
                <Text strong style={{ color: '#fff', fontSize: 15 }}>
                  <EnvironmentOutlined style={{ color: '#e53935', marginRight: 6 }} />
                  Khu Vực Phục Vụ Trọng Điểm
                </Text>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  • <strong>Hà Nội:</strong> Cầu Giấy, Hoàn Kiếm, Đống Đa, Ba Đình, Thanh Xuân, Nam/Bắc Từ Liêm, Long Biên, Hà Đông... (Giao hỏa tốc).
                </Text>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  • <strong>Hưng Yên:</strong> Huyện Văn Giang (Ecopark), TP. Hưng Yên, Thị xã Mỹ Hào, Yên Mỹ, Văn Lâm...
                </Text>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  • Đóng gói bóng xốp 3 lớp chống móp méo hộp mô hình khi vận chuyển.
                </Text>
              </Space>
            </Col>

            <Col xs={24} md={8}>
              <Space direction="vertical" size={8}>
                <Text strong style={{ color: '#fff', fontSize: 15 }}>
                  <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                  Chính Sách & Hỗ Trợ Khách Hàng
                </Text>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  • Kiểm tra kit nguyên seal runner trước khi nhận hàng thanh toán.
                </Text>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  • Hỗ trợ xuất bảng báo giá điện tử định dạng PDF cho đơn vị hoặc cá nhân.
                </Text>
                <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                  • Hotline / Zalo đặt hàng: <strong style={{ color: '#e53935' }}>0967.708.350</strong> (8:00 - 22:00)
                </Text>
              </Space>
            </Col>
          </Row>

          <Divider style={{ borderColor: '#262626', margin: '28px 0 16px' }} />

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              © 2026 AUTOBOT GUNDAM STORE — Thiết kế chuẩn doanh nghiệp trên nền tảng React & Ant Design.
            </Text>
          </div>
        </div>
      </Footer>

      {/* Nút liên hệ nổi Hotline, Zalo, Facebook */}
      <FloatingContactWidget />
    </Layout>
  );
};

