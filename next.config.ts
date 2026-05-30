import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'grupormultimedio.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pcware.com.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pcware.com.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.hp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hp.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
