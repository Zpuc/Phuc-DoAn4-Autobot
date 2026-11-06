import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore, User } from '../../store/useAuthStore';

const { Title, Text } = Typography;

interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/';

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await apiClient.post<any, LoginResponse>('/auth/login', {
        email: values.email,
        password: values.password,
      });

      setAuth(res.user, res.accessToken);
      message.success(`Đăng nhập thành công! Chào mừng ${res.user.name}`);

      if (res.user.role === 'ADMIN' || res.user.role === 'STAFF') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    form.setFieldsValue({
      email,
      password: pass,
    });
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyCertificateOutlined style={{ fontSize: 40, color: '#e53935', marginBottom: 8 }} />
          <Title level={3} style={{ margin: 0 }}>
            Đăng Nhập Hệ Thống
          </Title>
          <Text type="secondary">Cửa hàng mô hình Gundam AUTOBOT</Text>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg(null)}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: admin@autobot.vn" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              icon={<LoginOutlined />}
              style={{ background: '#e53935' }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary">Chưa có tài khoản? </Text>
          <Link to="/register" style={{ color: '#e53935', fontWeight: 600 }}>
            Đăng ký ngay
          </Link>
        </div>

        <Divider plain>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tài khoản mẫu dùng thử
          </Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Button
            size="small"
            block
            onClick={() => handleQuickLogin('admin@autobot.vn', 'Admin123@')}
          >
            Điền tài khoản Admin (admin@autobot.vn)
          </Button>
          <Button
            size="small"
            block
            onClick={() => handleQuickLogin('staff@autobot.vn', 'Staff123@')}
          >
            Điền tài khoản Staff (staff@autobot.vn)
          </Button>
          <Button
            size="small"
            block
            onClick={() => handleQuickLogin('customer@autobot.vn', 'Customer123@')}
          >
            Điền tài khoản Khách hàng (customer@autobot.vn)
          </Button>
        </Space>
      </Card>
    </div>
  );
};

