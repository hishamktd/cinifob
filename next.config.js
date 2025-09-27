const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'tmdb-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'tmdb-api',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

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

module.exports = withPWA(nextConfig);
