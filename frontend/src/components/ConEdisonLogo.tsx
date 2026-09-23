import React from 'react';

interface ConEdisonLogoProps {
  height?: number;
}

export const ConEdisonLogo: React.FC<ConEdisonLogoProps> = ({ 
  height = 40 
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg
        height={height}
        viewBox="0 0 216 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
        role="img"
        aria-label="Con Edison Logo"
      >
        {/* Background container in official Con Edison Navy */}
        <rect width="216" height="46" rx="8" fill="#002D62" />
        <rect x="0.5" y="0.5" width="215" height="45" rx="7.5" stroke="#004b87" strokeWidth="1" />
        
        {/* Dynamic Electric Cyan Energy Arc */}
        <path
          d="M 14 37 C 28 41, 52 41, 74 35 C 54 37, 30 37, 16 35 Z"
          fill="#00A3E0"
        />

        {/* Wordmark: lowercase 'con' */}
        <text
          x="16"
          y="29"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"
          fontSize="23"
          fontWeight="400"
          letterSpacing="-0.5px"
        >
          con
        </text>

        {/* Wordmark: bold 'Edison' */}
        <text
          x="56"
          y="29"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"
          fontSize="23"
          fontWeight="800"
          letterSpacing="-0.3px"
        >
          Edison
        </text>

        {/* Gas Control Energy Emblem */}
        <g transform="translate(168, 7)">
          <rect width="32" height="32" rx="6" fill="#001F44" />
          {/* Flame outer shell */}
          <path
            d="M 16 4 C 16 4, 25 14, 25 21 C 25 25.5, 21 28.5, 16 28.5 C 11 28.5, 7 25.5, 7 21 C 7 14, 16 4, 16 4 Z"
            fill="url(#coned_flame_gradient)"
          />
          {/* Natural gas blue core flame */}
          <path
            d="M 16 13 C 16 13, 20.5 19, 20.5 22.5 C 20.5 25, 18.5 26.5, 16 26.5 C 13.5 26.5, 11.5 25, 11.5 22.5 C 11.5 19, 16 13, 16 13 Z"
            fill="#00B4D8"
          />
          <circle cx="16" cy="22.5" r="2" fill="#FFFFFF" />
        </g>

        <defs>
          <linearGradient id="coned_flame_gradient" x1="16" y1="4" x2="16" y2="28.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFAA00" />
            <stop offset="65%" stopColor="#FF5500" />
            <stop offset="100%" stopColor="#0066CC" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
