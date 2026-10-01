import React from 'react';

interface SarathiLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const SarathiLogo: React.FC<SarathiLogoProps> = ({ 
  size = 28, 
  className = "",
  showText = false
}) => {
  return (
    <div className={`sarathi-logo-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.45))' }}
      >
        <defs>
          <linearGradient id="sarathiGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#00a8ff" />
            <stop offset="100%" stopColor="#00ff9d" />
          </linearGradient>
          <linearGradient id="shieldFill" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 168, 255, 0.02)" />
          </linearGradient>
        </defs>

        {/* Outer Cyber Shield */}
        <path 
          d="M24 4L7 11V23C7 33.5 14.3 43.1 24 45.5C33.7 43.1 41 33.5 41 23V11L24 4Z" 
          fill="url(#shieldFill)" 
          stroke="url(#sarathiGrad)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Charioteer / Pilot Chakra Wheel Outer Rim */}
        <circle 
          cx="24" 
          cy="23" 
          r="10.5" 
          stroke="#00f0ff" 
          strokeWidth="1.5" 
          strokeDasharray="2 2"
          opacity="0.8" 
        />

        {/* Core Navigational Spokes */}
        <line x1="24" y1="12.5" x2="24" y2="33.5" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13.5" y1="23" x2="34.5" y2="23" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16.5" y1="15.5" x2="31.5" y2="30.5" stroke="#00ff9d" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16.5" y1="30.5" x2="31.5" y2="15.5" stroke="#00ff9d" strokeWidth="1.2" strokeLinecap="round" />

        {/* Central Autonomous Beacon Core */}
        <circle cx="24" cy="23" r="4.5" fill="#06080d" stroke="url(#sarathiGrad)" strokeWidth="2" />
        <circle cx="24" cy="23" r="2" fill="#00f0ff" />
        
        {/* Top Sentinel Notch */}
        <polygon points="24,7 27,11 21,11" fill="#00ff9d" />
      </svg>
      {showText && (
        <span style={{ 
          fontFamily: "'JetBrains Mono', monospace", 
          fontWeight: 800, 
          letterSpacing: '2px', 
          fontSize: '14px',
          background: 'linear-gradient(90deg, #ffffff 0%, #00f0ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SARATHI
        </span>
      )}
    </div>
  );
};
