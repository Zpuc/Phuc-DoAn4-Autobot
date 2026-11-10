import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore, User } from '../../store/useAuthStore';
import { GundamLogo } from '../../components/GundamLogo';

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

      if (res.user.role === 'ADMIN') {
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

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '28px 16px',
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
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 12 }}>
            <GundamLogo size={64} showText={false} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            Đăng Nhập Hệ Thống
          </Title>
          <Text type="secondary">Cửa hàng mô hình Gundam AUTOBOT</Text>
        </div>

        {errorMsg && (
          <Alert
            title={errorMsg}
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
            <Input prefix={<UserOutlined />} placeholder="Nhập địa chỉ email của bạn" size="large" />
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
      </Card>
    </div>
  );
};

