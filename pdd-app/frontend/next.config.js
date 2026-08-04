/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // REMOVED basePath for Android app to ensure local asset resolution
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
