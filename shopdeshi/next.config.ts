import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // 👈 allow images from localhost
  },
};

export default nextConfig;