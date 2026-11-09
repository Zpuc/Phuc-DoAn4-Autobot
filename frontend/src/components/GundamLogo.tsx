import React from 'react';

interface GundamLogoProps {
  size?: 'small' | 'medium' | 'large' | number;
  showText?: boolean;
  collapsed?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  style?: React.CSSProperties;
}

export const GundamLogo: React.FC<GundamLogoProps> = ({
  size = 'medium',
  showText = true,
  collapsed = false,
  theme = 'dark',
  className = '',
  style = {},
}) => {
  let pixelSize = 40;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'small':
        pixelSize = 32;
        break;
      case 'medium':
        pixelSize = 44;
        break;
      case 'large':
        pixelSize = 64;
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
        gap: collapsed ? 0 : 12,
        userSelect: 'none',
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* Mecha V-Fin Emblem SVG */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(229, 57, 53, 0.35))',
          flexShrink: 0,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <defs>
          <linearGradient id="logoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e222d" />
            <stop offset="50%" stopColor="#141720" />
            <stop offset="100%" stopColor="#0a0c10" />
          </linearGradient>

          <linearGradient id="logoGoldVFin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="30%" stopColor="#ffd700" />
            <stop offset="70%" stopColor="#ff9100" />
            <stop offset="100%" stopColor="#e65100" />
          </linearGradient>

          <linearGradient id="logoRedArmor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff3d00" />
            <stop offset="50%" stopColor="#e53935" />
            <stop offset="100%" stopColor="#b71c1c" />
          </linearGradient>

          <linearGradient id="logoSilverPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          <filter id="logoCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Hexagonal Shield Armor */}
        <polygon
          points="50,3 88,14 94,52 74,86 50,98 26,86 6,52 12,14"
          fill="url(#logoShieldGrad)"
          stroke="url(#logoRedArmor)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Tech Panel Grid Lines */}
        <polygon
          points="50,8 83,18 88,51 70,82 50,92 30,82 12,51 17,18"
          fill="none"
          stroke="#2d3748"
          strokeWidth="1"
          strokeDasharray="2,3"
        />

        {/* Left V-Fin Antenna */}
        <polygon
          points="49,38 14,12 24,32 45,43"
          fill="url(#logoGoldVFin)"
          stroke="#d97706"
          strokeWidth="0.8"
        />
        <polygon
          points="45,43 24,32 32,38 46,45"
          fill="#b45309"
          opacity="0.6"
        />

        {/* Right V-Fin Antenna */}
        <polygon
          points="51,38 86,12 76,32 55,43"
          fill="url(#logoGoldVFin)"
          stroke="#d97706"
          strokeWidth="0.8"
        />
        <polygon
          points="55,43 76,32 68,38 54,45"
          fill="#b45309"
          opacity="0.6"
        />

        {/* Central Red Sensor Jewel */}
        <polygon
          points="50,22 57,33 50,44 43,33"
          fill="url(#logoRedArmor)"
          stroke="#ff8a80"
          strokeWidth="1"
        />
        <polygon points="50,24 55,33 50,37 45,33" fill="#ff5252" />

        {/* Brow Armor Band */}
        <polygon
          points="32,44 68,44 64,50 36,50"
          fill="#374151"
          stroke="#1f2937"
          strokeWidth="0.8"
        />

        {/* Cheek Armor */}
        <polygon
          points="31,48 37,48 40,68 33,65"
          fill="url(#logoSilverPlate)"
          stroke="#4b5563"
          strokeWidth="0.8"
        />
        <polygon
          points="69,48 63,48 60,68 67,65"
          fill="url(#logoSilverPlate)"
          stroke="#4b5563"
          strokeWidth="0.8"
        />

        {/* Cheek Thruster Slits */}
        <line x1="33" y1="54" x2="37" y2="54" stroke="#e53935" strokeWidth="1.2" />
        <line x1="34" y1="58" x2="38" y2="58" stroke="#e53935" strokeWidth="1.2" />
        <line x1="67" y1="54" x2="63" y2="54" stroke="#e53935" strokeWidth="1.2" />
        <line x1="66" y1="58" x2="62" y2="58" stroke="#e53935" strokeWidth="1.2" />

        {/* Glowing Mecha Optics / Cyan Eyes */}
        <polygon
          points="37,51 46,53 44,57 38,56"
          fill="#00f5ff"
          filter="url(#logoCyanGlow)"
        />
        <polygon
          points="63,51 54,53 56,57 62,56"
          fill="#00f5ff"
          filter="url(#logoCyanGlow)"
        />

        {/* Nose Bridge */}
        <polygon points="46,53 54,53 53,60 47,60" fill="#1f2937" />

        {/* Mouthplate */}
        <polygon
          points="42,60 58,60 55,75 45,75"
          fill="url(#logoSilverPlate)"
          stroke="#6b7280"
          strokeWidth="0.8"
        />

        {/* Classic Twin Slit Gunpla Vents */}
        <line x1="46" y1="64" x2="54" y2="64" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="47" y1="68" x2="53" y2="68" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />

        {/* Red Chin Guard */}
        <polygon
          points="46,75 54,75 52,85 48,85"
          fill="url(#logoRedArmor)"
          stroke="#d32f2f"
          strokeWidth="0.8"
        />

        {/* Neon Energy Core Chevron */}
        <polyline
          points="42,88 50,94 58,88"
          fill="none"
          stroke="#00f5ff"
          strokeWidth="1.5"
          filter="url(#logoCyanGlow)"
        />
      </svg>

      {/* Typography Brand Block */}
      {showText && !collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                color: isDark ? '#ffffff' : '#141414',
                fontSize: pixelSize >= 44 ? 20 : 16,
                fontWeight: 900,
                letterSpacing: 2,
                fontFamily: `'Rajdhani', 'Oswald', 'Montserrat', sans-serif, system-ui`,
                textTransform: 'uppercase',
              }}
            >
              AUTOBOT
            </span>
            <span
              style={{
                color: '#e53935',
                fontSize: pixelSize >= 44 ? 20 : 16,
                fontWeight: 900,
                letterSpacing: 1.5,
                fontFamily: `'Rajdhani', 'Oswald', 'Montserrat', sans-serif, system-ui`,
                textTransform: 'uppercase',
              }}
            >
              GUNDAM
            </span>
          </div>
          <span
            style={{
              color: isDark ? '#9ca3af' : '#6b7280',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            GUNPLA STORE // HN — HY
          </span>
        </div>
      )}
    </div>
  );
};
