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
  'DRONE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 20l10-3 10 3L12 2z"/></svg>`,
  'MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 2.5l7 7-3 3-4-4-6 6 4 4-3 3-7-7 7-7-3-3 4-4 4 4 3-3 3 3-6 6z" transform="rotate(-45 12 12)"/></svg>`,
  'CRUISE_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 2.5l7 7-3 3-4-4-6 6 4 4-3 3-7-7 7-7-3-3 4-4 4 4 3-3 3 3-6 6z" transform="rotate(-45 12 12)"/></svg>`,
  'BALLISTIC_MISSILE': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v6m0 8v6m8-10h-6M8 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  'AIRCRAFT': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
  'PPO': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 20L20 4m0 16L4 4"/></svg>`,
  'KAB': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L8 6v6l-4 4v4h4l4-4 4 4h4v-4l-4-4V6l-4-4z"/></svg>`,
  'RECON': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 22l10-4 10 4L12 2z"/></svg>`,
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
