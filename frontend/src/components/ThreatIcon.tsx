import React from 'react';

export const THREAT_COLORS = {
  'DRONE': '#f87171', // Flat soft red
  'MISSILE': '#ef4444', // Flat strong red
  'CRUISE_MISSILE': '#dc2626', // Deep red
  'BALLISTIC_MISSILE': '#f97316', // Flat orange
  'AIRCRAFT': '#60a5fa', // Soft blue
  'PPO': '#4ade80', // Soft green
  'KAB': '#c084fc', // Soft purple
  'RECON': '#9ca3af', // Flat gray
};

// Flat tactical vectors
export const THREAT_SVGS = {
  'DRONE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.5 10L21 18L19 21.5L12 14.5L5 21.5L3 18L9.5 10L12 2Z"/></svg>`,
  'MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L11 2V7L7 9V11L11 10.5V17L9 19V21L12 20.5L15 21V19L13 17V10.5L17 11V9L13 7V2L12 1Z"/></svg>`,
  'CRUISE_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L11 2V7L7 9V11L11 10.5V17L9 19V21L12 20.5L15 21V19L13 17V10.5L17 11V9L13 7V2L12 1Z"/></svg>`,
  'BALLISTIC_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L14 8V18L16 22H8L10 18V8L12 0Z"/></svg>`,
  'AIRCRAFT': `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L13 4V9L22 14V16L13 13.5V19L16 21V22L12 21.5L8 22V21L11 19V13.5L2 16V14L11 9V4L12 1Z"/></svg>`,
  'PPO': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 2L2 4L19 21L21 19L4 2Z"/><path d="M21 4L19 2L2 19L4 21L21 4Z"/></svg>`,
  'KAB': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.5 2 7.5 7 7.5 11L5 15V18H9.5V22H14.5V18H19V15L16.5 11C16.5 7 15.5 2 12 2Z"/></svg>`,
  'RECON': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L14 9H20L15 13L17 19L12 16L7 19L9 13L4 9H10L12 4Z"/></svg>`,
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
      style={{ color: color || defaultColor }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
