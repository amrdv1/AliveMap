import React from 'react';

export const THREAT_COLORS = {
  'DRONE': '#ef4444', // Red (was yellow, but user mockup shows red for drone)
  'MISSILE': '#ef4444', // Red
  'CRUISE_MISSILE': '#ef4444', // Red
  'BALLISTIC_MISSILE': '#f97316', // Orange
  'AIRCRAFT': '#3b82f6', // Blue
  'PPO': '#22c55e', // Green
  'KAB': '#a855f7', // Purple
  'RECON': '#9ca3af', // Gray
};

export const THREAT_SVGS = {
  'DRONE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C12 2.5 13.5 9 21 18L12 14.5L3 18C10.5 9 12 2.5 12 2.5Z"/></svg>`,
  'MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" transform="rotate(45)"><path d="M13 2H11V8L7 10V12H11V18L9 20V22H15V20L13 18V12H17V10L13 8V2Z"/></svg>`,
  'CRUISE_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" transform="rotate(45)"><path d="M13 2H11V8L7 10V12H11V18L9 20V22H15V20L13 18V12H17V10L13 8V2Z"/></svg>`,
  'BALLISTIC_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L13.5 9.5L22 11L13.5 12.5L12 21L10.5 12.5L2 11L10.5 9.5L12 1Z"/></svg>`,
  'AIRCRAFT': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.5 7L21 11V13L13.5 13V18L16 20V22L12 21L8 22V20L10.5 18V13L3 13V11L10.5 7L12 2Z"/></svg>`,
  'PPO': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 2.5L2.5 4.5L19.5 21.5L21.5 19.5L4.5 2.5Z"/><path d="M21.5 4.5L19.5 2.5L2.5 19.5L4.5 21.5L21.5 4.5Z"/></svg>`,
  'KAB': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.5 2 7.5 7 7.5 11L5 15V18H9.5V22H14.5V18H19V15L16.5 11C16.5 7 15.5 2 12 2Z"/></svg>`,
  'RECON': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L13 8L21 9V11L13 11V16L15 18V20L12 19L9 20V18L11 16V11L3 11V9L11 8L12 3Z"/></svg>`,
};

interface ThreatIconProps {
  type: string;
  className?: string;
  color?: string;
}

export function ThreatIcon({ type, className = "w-6 h-6", color }: ThreatIconProps) {
  const svgContent = THREAT_SVGS[type as keyof typeof THREAT_SVGS] || THREAT_SVGS['DRONE'];
  const defaultColor = THREAT_COLORS[type as keyof typeof THREAT_COLORS] || '#ffffff';
  
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ color: color || defaultColor, filter: `drop-shadow(0 0 6px ${color || defaultColor}80)` }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
