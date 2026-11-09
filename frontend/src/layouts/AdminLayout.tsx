import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { GundamLogo } from '../components/GundamLogo';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { token } = theme.useToken();

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
      key: '/admin/quotations',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/quotations">Báo Giá Khách Hàng</Link>,
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
            padding: collapsed ? '0' : '0 16px',
            background: '#002140',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <GundamLogo size={32} collapsed={collapsed} />
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

          <Space size="large">
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

