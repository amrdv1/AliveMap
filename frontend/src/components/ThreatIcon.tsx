import React from 'react';

export const THREAT_COLORS = {
  'DRONE': '#f87171', // Flat soft red
  'MOLNIYA': '#f87171', // Flat soft red
  'DECOY': '#9ca3af', // Gray
  'FPV': '#fb923c', // Orange
  'MISSILE': '#ef4444', // Flat strong red
  'CRUISE_MISSILE': '#dc2626', // Deep red
  'KH101': '#ea580c', // Orange-red
  'KALIBR': '#f43f5e', // Rose
  'BALLISTIC_MISSILE': '#f97316', // Flat orange
  'ISKANDER': '#d946ef', // Fuchsia
  'KINZHAL': '#dc2626', // Red
  'AIRCRAFT': '#60a5fa', // Soft blue
  'PPO': '#4ade80', // Soft green
  'KAB': '#c084fc', // Soft purple
  'RECON': '#9ca3af', // Flat gray
  'ZIRCON': '#ff0000', // Neon glowing red
  'UNKNOWN': '#a1a1aa', // Zinc
};

export const THREAT_SVGS = {
  'DRONE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.5 12L22 17L21.5 19L13 16V20L15 22H9L11 20V16L2.5 19L2 17L9.5 12L12 2Z"/><path d="M12 4L13 12L18 16L12 15L6 16L11 12L12 4Z" fill="black" fill-opacity="0.25"/></svg>`,
  'MOLNIYA': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.5 12L22 17L21.5 19L13 16V20L15 22H9L11 20V16L2.5 19L2 17L9.5 12L12 2Z"/><path d="M12 4L13 12L18 16L12 15L6 16L11 12L12 4Z" fill="black" fill-opacity="0.25"/></svg>`,
  'DECOY': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.5 12L22 17L21.5 19L13 16V20L15 22H9L11 20V16L2.5 19L2 17L9.5 12L12 2Z"/><path d="M12 4L13 12L18 16L12 15L6 16L11 12L12 4Z" fill="black" fill-opacity="0.25"/></svg>`,
  'FPV': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 7 17 17M17 7 7 17"/><circle cx="5.4" cy="5.4" r="2.9"/><circle cx="18.6" cy="5.4" r="2.9"/><circle cx="5.4" cy="18.6" r="2.9"/><circle cx="18.6" cy="18.6" r="2.9"/><rect x="9.2" y="9.2" width="5.6" height="5.6" rx="1.3" fill="currentColor"/></svg>`,
  'MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C11.5 1 11 1.5 11 2.5V8L6 11V13L11 12V17.5L8 20V22L12 21L16 22V20L13 17.5V12L18 13V11L13 8V2.5C13 1.5 12.5 1 12 1Z"/><path d="M12 3V8L14 11V12L12 11.5V17L14 19V20L12 19.5V3Z" fill="black" fill-opacity="0.25"/></svg>`,
  'CRUISE_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C11.5 1 11 1.5 11 2.5V8L6 11V13L11 12V17.5L8 20V22L12 21L16 22V20L13 17.5V12L18 13V11L13 8V2.5C13 1.5 12.5 1 12 1Z"/><path d="M12 3V8L14 11V12L12 11.5V17L14 19V20L12 19.5V3Z" fill="black" fill-opacity="0.25"/></svg>`,
  'KH101': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C11.5 1 11 1.5 11 2.5V8L6 11V13L11 12V17.5L8 20V22L12 21L16 22V20L13 17.5V12L18 13V11L13 8V2.5C13 1.5 12.5 1 12 1Z"/><path d="M12 3V8L14 11V12L12 11.5V17L14 19V20L12 19.5V3Z" fill="black" fill-opacity="0.25"/></svg>`,
  'KALIBR': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C11.5 1 11 1.5 11 2.5V8L6 11V13L11 12V17.5L8 20V22L12 21L16 22V20L13 17.5V12L18 13V11L13 8V2.5C13 1.5 12.5 1 12 1Z"/><path d="M12 3V8L14 11V12L12 11.5V17L14 19V20L12 19.5V3Z" fill="black" fill-opacity="0.25"/></svg>`,
  'BALLISTIC_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C11 0 10 2 10 4V16L7 22H17L14 16V4C14 2 13 0 12 0Z"/><path d="M12 2V16L14 20H12V2Z" fill="black" fill-opacity="0.25"/><path d="M10 22L10 24H14L14 22H10Z" fill="#fbbf24" /></svg>`,
  'ISKANDER': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C11 0 10 2 10 4V16L7 22H17L14 16V4C14 2 13 0 12 0Z"/><path d="M12 2V16L14 20H12V2Z" fill="black" fill-opacity="0.25"/><path d="M10 22L10 24H14L14 22H10Z" fill="#fbbf24" /></svg>`,
  'KINZHAL': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L13.5 2V6L18 8V10L13.5 9V14L17 17V19L12 17.5L7 19V17L10.5 14V9L6 10V8L10.5 6V2L12 0Z"/><path d="M10 19L10 22L12 24L14 22V19L12 20L10 19Z" fill="#ff4444"/><path d="M12 2V14L14 17V18L12 17V2Z" fill="white" fill-opacity="0.15"/></svg>`,
  'ZIRCON': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L13.5 2V6L18 8V10L13.5 9V14L17 17V19L12 17.5L7 19V17L10.5 14V9L6 10V8L10.5 6V2L12 0Z"/><path d="M10 19L10 22L12 24L14 22V19L12 20L10 19Z" fill="#ff4444"/><path d="M9 21L7 23H17L15 21H9Z" fill="#ff6600" fill-opacity="0.8"/><path d="M12 2V14L14 17V18L12 17V2Z" fill="white" fill-opacity="0.15"/></svg>`,
  'AIRCRAFT': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 1L13 3V7L22 14V16L13 13V19L16 21V22L12 21L8 22V21L11 19V13L2 16V14L11 7V3L12 1Z"/><path d="M12 3V7L16 12V14L12 12V19L14 20V21L12 20.5V3Z" fill="black" fill-opacity="0.25"/></svg>`,
  'PPO': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 2L2 4L19 21L21 19L4 2Z"/><path d="M21 4L19 2L2 19L4 21L21 4Z"/></svg>`,
  'KAB': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C9 2 8 5 8 10V15L6 18V20H18V18L16 15V10C16 5 15 2 12 2Z"/><path d="M10 20V22H14V20H10Z" fill="black" fill-opacity="0.3"/><path d="M12 4C10.5 4 10 6 10 10V15L12 17V4Z" fill="white" fill-opacity="0.2"/></svg>`,
  'RECON': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L13 6V9L22 10V12L13 11V16L15 19V20L12 19L9 20V19L11 16V11L2 12V10L11 9V6L12 3Z"/><circle cx="12" cy="14" r="1.5" fill="black" fill-opacity="0.4"/></svg>`,
  'UNKNOWN': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/></svg>`,
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
