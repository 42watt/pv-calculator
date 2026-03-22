import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  // Enable gzip compression (critical for PageSpeed)
  compress: true,

  // Redirect favicon.ico to favicon.svg (prevents 404 error)
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.svg',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Long-term cache for Next.js static chunks (JS, CSS)
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Expires',
            value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(),
          },
        ],
      },
      // Long-term cache for static assets in /public
      {
        source: '/(.*)\\.(svg|ico|png|jpg|jpeg|webp|gif|mp4|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Expires',
            value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
