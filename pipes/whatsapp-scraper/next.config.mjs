/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Required for screenpipe pipes to work in subdirectories
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  output: 'standalone',
};

export default nextConfig; 