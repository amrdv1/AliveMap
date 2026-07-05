import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // The backend is always running on localhost:3001 inside the Railway container
    const internalBackend = 'http://127.0.0.1:3001';
    return [
      {
        source: '/api/:path((?!alerts).*)',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : `${internalBackend}/api/:path*`
      },
      {
        source: '/socket.io/:path*',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/socket.io/:path*` : `${internalBackend}/socket.io/:path*`
      }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
