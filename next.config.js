/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: [
      'src/app',
      'src/components',
      'src/core',
      'src/lib',
      'src/hooks',
      'src/services',
      'src/store',
      'src/types',
      'src/utils',
    ],
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
