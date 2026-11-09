import React from 'react';
import { Layout, Menu, Button, Space, Badge, Dropdown, Avatar, Typography, Row, Col, Divider, Tag } from 'antd';
import type { MenuProps } from 'antd';
import {
  RocketOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  HeartOutlined,
  AppstoreOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  LoginOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStaffOrAdmin, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.getTotalCount());
  const loadCartFromStorage = useCartStore((state) => state.loadFromStorage);
  const wishlistItems = useWishlistStore((state) => state.items);
  const loadWishlistFromStorage = useWishlistStore((state) => state.loadFromStorage);

  React.useEffect(() => {
    loadCartFromStorage();
    loadWishlistFromStorage();
  }, [loadCartFromStorage, loadWishlistFromStorage]);

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
    {
      key: 'my-orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/my-orders">Đơn hàng của tôi</Link>,
    },
    ...(isStaffOrAdmin
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
          padding: '0 28px',
          borderBottom: '2px solid #e53935',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <RocketOutlined style={{ fontSize: 26, color: '#e53935' }} />
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: 1.5 }}>
            AUTOBOT GUNDAM
          </span>
        </Link>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ background: 'transparent', flex: 1, marginLeft: 40, borderBottom: 'none' }}
          items={[
            {
              key: '/',
              icon: <AppstoreOutlined />,
              label: <Link to="/">Trang Chủ</Link>,
            },
            {
              key: '/products',
              label: <Link to="/products">Danh Mục Gundam</Link>,
            },
            {
              key: '/quotations',
              label: <Link to="/quotations">Yêu Cầu Báo Giá</Link>,
            },
          ]}
        />

        <Space size="middle">
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

          <Link to="/cart">
            <Badge count={cartCount} showZero={false} offset={[-2, 6]}>
              <Button type="primary" icon={<ShoppingCartOutlined />} style={{ background: '#e53935' }}>
                Giỏ Hàng
              </Button>
            </Badge>
          </Link>

          {isAuthenticated && user ? (
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
          )}
        </Space>
      </Header>

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
                <Space size={8} align="center">
                  <RocketOutlined style={{ fontSize: 22, color: '#e53935' }} />
                  <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>
                    AUTOBOT GUNDAM
                  </span>
                </Space>
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
                  • Hotline / Zalo đặt hàng: <strong style={{ color: '#e53935' }}>0901.234.567</strong> (8:00 - 22:00)
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
    </Layout>
  );
};

