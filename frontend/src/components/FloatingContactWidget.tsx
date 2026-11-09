import React from 'react';
import { FloatButton } from 'antd';
import {
  PhoneOutlined,
  FacebookOutlined,
  MessageOutlined,
} from '@ant-design/icons';

// Icon Zalo chuẩn thương hiệu (sắc nét, không méo)
const ZaloBadgeIcon: React.FC = () => (
  <div
    style={{
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: '#0068FF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontWeight: 900,
      fontSize: 10,
      fontFamily: `'Montserrat', -apple-system, sans-serif`,
      letterSpacing: -0.3,
      boxShadow: '0 2px 4px rgba(0, 104, 255, 0.35)',
    }}
  >
    Zalo
  </div>
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
        icon={<PhoneOutlined style={{ fontSize: 20, color: '#fff' }} />}
        tooltip="Hotline & Liên Hệ Nhanh"
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
