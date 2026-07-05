import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path((?!alerts).*)',
        destination: 'http://localhost:3001/api/:path*' // Proxy to Backend
      }
    ];
  }
};

export default nextConfig;
