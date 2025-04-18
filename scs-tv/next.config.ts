import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
          protocol: 'https',
          hostname: 'drive.google.com',
          pathname: '/uc',
      },
      {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'docs.google.com',
          pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
