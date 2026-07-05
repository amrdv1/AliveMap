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
  'DRONE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 14.5 10 21 18C22 19.5 21 21.5 19 21.5C17 21.5 13.5 17.5 12 14.5C10.5 17.5 7 21.5 5 21.5C3 21.5 2 19.5 3 18C9.5 10 12 2 12 2Z"/></svg>`,
  'MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C11.4 1 11 1.4 11 2V7L7 9V11L11 10.5V17L9 19V21L12 20.5L15 21V19L13 17V10.5L17 11V9L13 7V2C13 1.4 12.6 1 12 1Z"/></svg>`,
  'CRUISE_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C11.4 1 11 1.4 11 2V7L7 9V11L11 10.5V17L9 19V21L12 20.5L15 21V19L13 17V10.5L17 11V9L13 7V2C13 1.4 12.6 1 12 1Z"/></svg>`,
  'BALLISTIC_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L14 8V18L16 22H8L10 18V8L12 0Z"/></svg>`,
  'AIRCRAFT': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="0.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C12.5 1 13 2 13 4V9L22 14V16L13 13.5V19L16 21V22L12 21.5L8 22V21L11 19V13.5L2 16V14L11 9V4C11 2 11.5 1 12 1Z"/></svg>`,
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
