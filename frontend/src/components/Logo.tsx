import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="12" fill="black" />
      <path d="M12 6 L17.5 15.5 H6.5 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
