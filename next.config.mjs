/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['eagle-library.s3.amazonaws.com'],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable image optimization
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['eagle-library.s3.amazonaws.com'],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
