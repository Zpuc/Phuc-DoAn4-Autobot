import React from 'react';

interface GundamLogoProps {
  size?: 'small' | 'medium' | 'large' | number;
  showText?: boolean;
  collapsed?: boolean;
  theme?: 'dark' | 'light';
  badge?: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const GundamLogo: React.FC<GundamLogoProps> = ({
  size = 'medium',
  showText = true,
  collapsed = false,
  theme = 'dark',
  badge,
  subtitle = 'GUNPLA STORE // HN — HY',
  className = '',
  style = {},
}) => {
  let pixelSize = 42;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'small':
        pixelSize = 34;
        break;
      case 'medium':
        pixelSize = 44;
        break;
      case 'large':
        pixelSize = 58;
        break;
    }
  }

  const isDark = theme === 'dark';

  return (
    <div
      className={`gundam-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 10,
        userSelect: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {/* Sắc nét Gundam V-Fin Head Vector Emblem */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.45)) drop-shadow(0 2px 6px rgba(255, 23, 68, 0.35))',
          flexShrink: 0,
          transition: 'transform 0.25s ease',
        }}
      >
        <defs>
          {/* V-Fin Sừng Vàng Kim Loại */}
          <linearGradient id="vFinGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="35%" stopColor="#FFD54F" />
            <stop offset="70%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#FF6F00" />
          </linearGradient>

          {/* Giáp Đỏ Mecha Crimson */}
          <linearGradient id="armorRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF5252" />
            <stop offset="50%" stopColor="#E53935" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>

          {/* Giáp Trắng Kim Khí Cao Cấp */}
          <linearGradient id="armorWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#ECEFF1" />
            <stop offset="100%" stopColor="#CFD8DC" />
          </linearGradient>

          {/* Đèn Mắt LED Xanh Neon */}
          <filter id="eyeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Nền Khiên Đa Giác Cơ Khí Đậm Chất Autobot */}
        <polygon
          points="50,4 90,16 95,50 75,86 50,97 25,86 5,50 10,16"
          fill="#111827"
          stroke="url(#armorRed)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Viền Kim Loại Phụ Bên Trong */}
        <polygon
          points="50,9 85,20 89,49 71,81 50,91 29,81 11,49 15,20"
          fill="#1F2937"
          stroke="#374151"
          strokeWidth="1"
        />

        {/* Cặp Sừng V-Fin Vàng Kim Loại Khổng Lồ */}
        {/* Sừng Trái */}
        <polygon
          points="49,38 12,11 23,32 46,43"
          fill="url(#vFinGold)"
          stroke="#FF8F00"
          strokeWidth="0.8"
        />
        <polygon
          points="46,43 23,32 31,37 47,45"
          fill="#E65100"
          opacity="0.8"
        />

        {/* Sừng Phải */}
        <polygon
          points="51,38 88,11 77,32 54,43"
          fill="url(#vFinGold)"
          stroke="#FF8F00"
          strokeWidth="0.8"
        />
        <polygon
          points="54,43 77,32 69,37 53,45"
          fill="#E65100"
          opacity="0.8"
        />

        {/* Viên Kim Cương Sensor Đỏ Trung Tâm Trán */}
        <polygon
          points="50,21 58,32 50,43 42,32"
          fill="url(#armorRed)"
          stroke="#FF8A80"
          strokeWidth="1"
        />
        <polygon points="50,24 55,32 50,37 45,32" fill="#FF1744" />

        {/* Vòm Mũi & Lông Mày Giáp Sắt */}
        <polygon
          points="31,43 69,43 64,49 36,49"
          fill="#374151"
          stroke="#111827"
          strokeWidth="0.8"
        />

        {/* Ốp Má Giáp Trắng (2 Bên) */}
        <polygon
          points="29,48 37,48 41,68 32,65"
          fill="url(#armorWhite)"
          stroke="#90A4AE"
          strokeWidth="0.8"
        />
        <polygon
          points="71,48 63,48 59,68 68,65"
          fill="url(#armorWhite)"
          stroke="#90A4AE"
          strokeWidth="0.8"
        />

        {/* Khe Thoát Khí 2 Bên Má (Đỏ Mecha) */}
        <line x1="32" y1="54" x2="36" y2="54" stroke="#FF1744" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="59" x2="37" y2="59" stroke="#FF1744" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="68" y1="54" x2="64" y2="54" stroke="#FF1744" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="67" y1="59" x2="63" y2="59" stroke="#FF1744" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cặp Mắt Quang Học LED Xanh Cyan Sáng Rực */}
        <polygon
          points="36,50 45,52 43,57 37,56"
          fill="#00E5FF"
          filter="url(#eyeGlow)"
        />
        <polygon
          points="64,50 55,52 57,57 63,56"
          fill="#00E5FF"
          filter="url(#eyeGlow)"
        />
        <polygon points="38,52 44,53 43,55 39,54" fill="#E0F7FA" />
        <polygon points="62,52 56,53 57,55 61,54" fill="#E0F7FA" />

        {/* Sống Mũi Kim Loại */}
        <polygon points="46,52 54,52 53,59 47,59" fill="#1E293B" />

        {/* Mặt Nạ Miệng Gundam (Trắng Bạc) */}
        <polygon
          points="41,59 59,59 56,75 44,75"
          fill="url(#armorWhite)"
          stroke="#78909C"
          strokeWidth="0.8"
        />

        {/* 2 Khe Thoát Khí Đen Đặc Trưng Của Gundam */}
        <line x1="45" y1="64" x2="55" y2="64" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="46" y1="69" x2="54" y2="69" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />

        {/* Cằm Đỏ Nhọn Mecha */}
        <polygon
          points="45,75 55,75 53,85 47,85"
          fill="url(#armorRed)"
          stroke="#D50000"
          strokeWidth="0.8"
        />

        {/* Tia Năng Lượng Đáy Khiên */}
        <polyline
          points="40,89 50,94 60,89"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#eyeGlow)"
        />
      </svg>

      {/* Cụm Chữ Thương Hiệu */}
      {showText && !collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                color: isDark ? '#FFFFFF' : '#111827',
                fontSize: pixelSize >= 42 ? 18 : 15,
                fontWeight: 900,
                letterSpacing: 1.5,
                fontFamily: `'Montserrat', 'Rajdhani', -apple-system, sans-serif`,
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              AUTOBOT
            </span>
            <span
              style={{
                color: '#FF2A2A',
                fontSize: pixelSize >= 42 ? 18 : 15,
                fontWeight: 900,
                letterSpacing: 1.2,
                fontFamily: `'Montserrat', 'Rajdhani', -apple-system, sans-serif`,
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              GUNDAM
            </span>

            {/* Tag Phụ (Ví dụ: ADMIN) */}
            {badge && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF1744, #B71C1C)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 4,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  boxShadow: '0 1px 4px rgba(255, 23, 68, 0.4)',
                }}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Subtitle mô tả */}
          {subtitle && !badge && (
            <span
              style={{
                color: isDark ? '#9CA3AF' : '#6B7280',
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginTop: 2,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
