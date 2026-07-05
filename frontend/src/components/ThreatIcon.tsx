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
  'DRONE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 14.5 10 22 20L12 16L2 20C9.5 10 12 2 12 2Z"/></svg>`,
  'MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" transform="rotate(45)"><path d="M11 2h2v7h4l1 3h-5v5h2v3h-6v-3h2v-5H6l1-3h4V2z"/></svg>`,
  'CRUISE_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" transform="rotate(45)"><path d="M11 2h2v7h4l1 3h-5v5h2v3h-6v-3h2v-5H6l1-3h4V2z"/></svg>`,
  'BALLISTIC_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3.5"/><path d="M12 1v7m0 8v7m9-11h-7M8 12H1" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  'AIRCRAFT': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2 4.5 1 4.5 7 4v2l-8-2.5 1 4 2 1.5v1.5l-5-1.5-5 1.5v-1.5l2-1.5 1-4-8 2.5v-2l7-4 1-4.5 2-4.5z"/></svg>`,
  'PPO': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.36 4.22l1.42 1.42-12.73 12.73-1.42-1.42L18.36 4.22z"/><path d="M5.64 4.22l12.73 12.73-1.42 1.42L4.22 5.64l1.42-1.42z"/><circle cx="12" cy="12" r="3"/></svg>`,
  'KAB': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c-1.5 0-3 2-3 5v5l-3 4v3h12v-3l-3-4V7c0-3-1.5-5-3-5z"/></svg>`,
  'RECON': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l9 16-9-4-9 4 9-16z"/></svg>`,
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
