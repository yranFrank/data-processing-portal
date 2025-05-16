// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true, //  Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, //  Ignore TypeScript errors during build
  },
};

export default nextConfig;
