import React from 'react';
import { FloatButton } from 'antd';
import {
  PhoneOutlined,
  FacebookOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';

// Icon Zalo chuẩn thương hiệu
const ZaloBadgeIcon: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    width="20"
    height="20"
    style={{ display: 'block', margin: 'auto' }}
  >
    <rect width="48" height="48" rx="10" fill="#0068FF" />
    <path
      fill="#FFFFFF"
      d="M13 16h11l-9.2 12.3c-.4.5-.4 1.1-.1 1.6.3.5.9.8 1.5.8h11.8v-3.4H17.8l9.2-12.3c.4-.5.4-1.1.1-1.6-.3-.5-.9-.8-1.5-.8H13V16z"
    />
    <path
      fill="#FFFFFF"
      d="M31.5 21.2c-2.8 0-4.5 1.9-4.5 4.8 0 3 1.8 4.8 4.5 4.8 2.8 0 4.5-1.9 4.5-4.8 0-3-1.7-4.8-4.5-4.8zm0 6.6c-1.1 0-1.8-1-1.8-2 0-1 .7-2 1.8-2 1.1 0 1.8 1 1.8 2 0 1-.7 2-1.8 2z"
    />
  </svg>
);

export const FloatingContactWidget: React.FC = () => {
  return (
    <>
      {/* Nút Cuộn Lên Đầu Trang */}
      <FloatButton.BackTop
        tooltip="Lên đầu trang"
        visibilityHeight={250}
        style={{ right: 28, bottom: 95 }}
      />

      {/* Menu Các Kênh Liên Hệ Nổi */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 28, bottom: 28 }}
        icon={<CustomerServiceOutlined style={{ fontSize: 20 }} />}
        tooltip="Hotline & Hỗ Trợ Trực Tuyến"
        badge={{ dot: true, color: '#52c41a' }}
      >
        {/* Gọi Điện Thoại Trực Tiếp */}
        <FloatButton
          icon={<PhoneOutlined style={{ color: '#fff', fontSize: 17 }} />}
          tooltip="Hotline: 0967.708.350 (Gọi ngay)"
          href="tel:0967708350"
          style={{ backgroundColor: '#e53935' }}
        />

        {/* Chat Zalo */}
        <FloatButton
          icon={<ZaloBadgeIcon />}
          tooltip="Chat Zalo: 0967.708.350"
          href="https://zalo.me/0967708350"
          target="_blank"
          style={{ backgroundColor: '#ffffff', border: '1px solid #0068FF' }}
        />

        {/* Nhắn Tin Facebook */}
        <FloatButton
          icon={<FacebookOutlined style={{ color: '#fff', fontSize: 19 }} />}
          tooltip="Facebook: zann.puc"
          href="https://www.facebook.com/zann.puc"
          target="_blank"
          style={{ backgroundColor: '#1877F2' }}
        />
      </FloatButton.Group>
    </>
  );
};
