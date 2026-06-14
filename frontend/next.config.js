/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async rewrites() {
    // Proxies /api/* to the Express backend so the frontend can use
    // same-origin relative paths (avoids CORS/cookie complications
    // in both dev and production when served behind one host).
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
    ];
  },
};

module.exports = nextConfig;
