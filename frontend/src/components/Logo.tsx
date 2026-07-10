import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <img src="/logo.png" alt="AliveMap Logo" className={className} />
  );
}
