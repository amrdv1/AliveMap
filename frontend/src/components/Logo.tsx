import React from 'react';

export default function Logo({ className }: { className?: string }) {
  return (
    <img src="/logo.svg" alt="AliveMap Logo" className={className} />
  );
}
