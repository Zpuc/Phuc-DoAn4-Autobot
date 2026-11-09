import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Modal,
  Popconfirm,
  message,
  Breadcrumb,
  Divider,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/client';

const { Title, Text, Paragraph } = Typography;

interface AddressItem {
  id: string;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  isDefault: boolean;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth } = useAuthStore();

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [addressForm] = Form.useForm();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Modal địa chỉ
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Tải danh sách địa chỉ
  const fetchAddresses = async () => {
    if (!isAuthenticated) return;
    setAddressLoading(true);
    try {
      const data: any = await apiClient.get('/addresses');
      setAddresses(data || []);
    } catch {
      // bỏ qua lỗi
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }

    fetchAddresses();
  }, [isAuthenticated, user]);

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (values: any) => {
    setProfileLoading(true);
    try {
      const res: any = await apiClient.put('/auth/profile', {
        name: values.name,
        phone: values.phone,
      });
      message.success('Cập nhật thông tin cá nhân thành công!');
      if (res.user) {
        const token = localStorage.getItem('autobot_token') || '';
        setAuth(res.user, token);
      }
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setProfileLoading(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setPasswordLoading(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Lưu địa chỉ (Tạo mới hoặc Sửa)
  const handleSaveAddress = async (values: any) => {
    setAddressSubmitting(true);
    try {
      if (editingAddressId) {
        await apiClient.put(`/addresses/${editingAddressId}`, values);
        message.success('Cập nhật địa chỉ thành công!');
      } else {
        await apiClient.post('/addresses', values);
        message.success('Thêm địa chỉ giao hàng mới thành công!');
      }
      setAddressModalVisible(false);
      addressForm.resetFields();
      setEditingAddressId(null);
      fetchAddresses();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi lưu địa chỉ');
    } finally {
      setAddressSubmitting(false);
    }
  };

  // Đặt làm mặc định
  const handleSetDefaultAddress = async (id: string) => {
    try {
      await apiClient.patch(`/addresses/${id}/default`, {});
      message.success('Đã đặt làm địa chỉ mặc định');
      fetchAddresses();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật địa chỉ');
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/addresses/${id}`);
      message.success('Đã xóa địa chỉ');
      fetchAddresses();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi xóa địa chỉ');
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '30px auto', padding: '0 20px' }}>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> Trang chủ</Link> },
          { title: 'Tài khoản của tôi' },
        ]}
      />

      {/* Profile Header Card */}
      <Card
        style={{
          borderRadius: 12,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #1f1f1f 0%, #3a3a3a 100%)',
          color: '#fff',
        }}
        bordered={false}
      >
        <Space size={20} align="center">
          <Avatar size={72} icon={<UserOutlined />} style={{ backgroundColor: '#e53935' }} />
          <div>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              {user?.name}
            </Title>
            <Space size={8} style={{ marginTop: 4 }}>
              <Tag color="red">{user?.role}</Tag>
              <Text style={{ color: '#ccc' }}>{user?.email}</Text>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Main Tabs */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          defaultActiveKey="profile"
          items={[
            {
              key: 'profile',
              label: (
                <span>
                  <UserOutlined /> Thông tin cá nhân & Mật khẩu
                </span>
              ),
              children: (
                <Row gutter={[40, 32]}>
                  {/* Cột thông tin */}
                  <Col xs={24} md={12}>
                    <Title level={4}>Thông tin liên hệ</Title>
                    <Paragraph type="secondary">
                      Thông tin này được dùng khi liên hệ giao hàng và nhận mã đơn hàng.
                    </Paragraph>

                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                    >
                      <Form.Item label="Email đăng nhập" name="email">
                        <Input prefix={<MailOutlined />} disabled />
                      </Form.Item>

                      <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                      >
                        <Input prefix={<UserOutlined />} size="large" />
                      </Form.Item>

                      <Form.Item label="Số điện thoại" name="phone">
                        <Input prefix={<PhoneOutlined />} size="large" placeholder="09xxxxxxxx" />
                      </Form.Item>

                      <Button type="primary" htmlType="submit" loading={profileLoading}>
                        Lưu thông tin cá nhân
                      </Button>
                    </Form>
                  </Col>

                  {/* Cột đổi mật khẩu */}
                  <Col xs={24} md={12} style={{ borderLeft: '1px solid #f0f0f0' }}>
                    <Title level={4}>Đổi mật khẩu</Title>
                    <Paragraph type="secondary">
                      Khuyến nghị đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.
                    </Paragraph>

                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                    >
                      <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} size="large" />
                      </Form.Item>

                      <Form.Item
                        label="Mật khẩu mới (tối thiểu 6 ký tự)"
                        name="newPassword"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                          { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} size="large" />
                      </Form.Item>

                      <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} size="large" />
                      </Form.Item>

                      <Button type="default" danger htmlType="submit" loading={passwordLoading}>
                        Cập nhật mật khẩu mới
                      </Button>
                    </Form>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'addresses',
              label: (
                <span>
                  <EnvironmentOutlined /> Sổ địa chỉ nhận hàng ({addresses.length})
                </span>
              ),
              children: (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <Title level={4} style={{ margin: 0 }}>
                        Địa Chỉ Nhận Hàng Của Bạn
                      </Title>
                      <Text type="secondary">
                        Lưu địa chỉ để hệ thống tự động điền nhanh khi thanh toán đặt mua Gunpla.
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingAddressId(null);
                        addressForm.resetFields();
                        setAddressModalVisible(true);
                      }}
                    >
                      Thêm địa chỉ mới
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', background: '#fafafa', borderRadius: 8 }}>
                      <EnvironmentOutlined style={{ fontSize: 40, color: '#d9d9d9', marginBottom: 12 }} />
                      <Paragraph type="secondary">Bạn chưa lưu địa chỉ nhận hàng nào</Paragraph>
                    </div>
                  ) : (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {addresses.map((addr) => (
                        <Card
                          key={addr.id}
                          size="small"
                          style={{
                            borderRadius: 8,
                            borderColor: addr.isDefault ? '#e53935' : '#e8e8e8',
                            background: addr.isDefault ? '#fffbfb' : '#fff',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <Space size={8} align="center">
                                <Text strong style={{ fontSize: 15 }}>
                                  {addr.receiverName}
                                </Text>
                                <Divider type="vertical" />
                                <Text type="secondary">{addr.phone}</Text>
                                {addr.isDefault && (
                                  <Tag color="red" icon={<CheckCircleOutlined />}>
                                    Mặc định
                                  </Tag>
                                )}
                              </Space>

                              <div style={{ marginTop: 8, color: '#595959' }}>
                                <EnvironmentOutlined style={{ color: '#e53935', marginRight: 6 }} />
                                {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                              </div>
                            </div>

                            <Space size={8}>
                              {!addr.isDefault && (
                                <Button
                                  size="small"
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                >
                                  Đặt mặc định
                                </Button>
                              )}
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => {
                                  setEditingAddressId(addr.id);
                                  addressForm.setFieldsValue(addr);
                                  setAddressModalVisible(true);
                                }}
                              >
                                Sửa
                              </Button>
                              <Popconfirm
                                title="Xác nhận xóa địa chỉ này?"
                                onConfirm={() => handleDeleteAddress(addr.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                              >
                                <Button size="small" danger icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Space>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Thêm / Sửa Địa Chỉ */}
      <Modal
        title={editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới'}
        open={addressModalVisible}
        onCancel={() => {
          setAddressModalVisible(false);
          setEditingAddressId(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={addressForm} layout="vertical" onFinish={handleSaveAddress} style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="receiverName"
                label="Tên người nhận"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
              >
                <Input placeholder="Ví dụ: Hoàng Tuấn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
              >
                <Input placeholder="09xxxxxxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="Tỉnh / Thành phố"
                rules={[{ required: true, message: 'Nhập Tỉnh/Thành' }]}
              >
                <Input placeholder="TP. Hồ Chí Minh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district"
                label="Quận / Huyện"
                rules={[{ required: true, message: 'Nhập Quận/Huyện' }]}
              >
                <Input placeholder="Quận 1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ward"
                label="Phường / Xã"
                rules={[{ required: true, message: 'Nhập Phường/Xã' }]}
              >
                <Input placeholder="Phường Bến Nghé" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="detailAddress"
            label="Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà)"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
          >
            <Input placeholder="Số 123 Lê Duẩn, Căn hộ 4B..." />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setAddressModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={addressSubmitting}>
                Lưu địa chỉ
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
