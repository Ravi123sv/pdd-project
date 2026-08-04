/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/pdd-project',
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
