import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.MOBILE_BUILD === 'true' ? 'export' : undefined,
  images: { unoptimized: true }, // Always unoptimized for simplicity, or conditional
  /* config options here */
};

export default nextConfig;
