import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
  },
  //TODO: If you want to enable ESLint during the build process, uncomment the following lines.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
