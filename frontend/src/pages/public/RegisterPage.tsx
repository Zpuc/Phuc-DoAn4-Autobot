import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore, User } from '../../store/useAuthStore';
import { GundamLogo } from '../../components/GundamLogo';

const { Title, Text } = Typography;

interface RegisterResponse {
  message: string;
  user: User;
  accessToken: string;
}

export const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await apiClient.post<any, RegisterResponse>('/auth/register', {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      setAuth(res.user, res.accessToken);
      message.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể đăng ký tài khoản');
    } finally {
      setLoading(false);
    }
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
          maxWidth: 480,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 12 }}>
            <GundamLogo size={64} showText={false} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            Tạo Tài Khoản Mới
          </Title>
          <Text type="secondary">Trở thành thành viên của Gundam AUTOBOT Store</Text>
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
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Ví dụ: ban@gmail.com" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 0912345678" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              icon={<UserAddOutlined />}
              style={{ background: '#e53935' }}
            >
              Đăng Ký Tài Khoản
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary">Đã có tài khoản? </Text>
          <Link to="/login" style={{ color: '#e53935', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
};

