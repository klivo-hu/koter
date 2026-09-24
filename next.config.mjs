/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Self-contained server build — this is what the deploy Dockerfile copies.
  output: 'standalone',

  // Native modules must stay outside the bundle and be require()'d at runtime.
  serverExternalPackages: ['better-sqlite3', 'sharp'],

  // better-sqlite3 locates its compiled binary at runtime through `bindings`,
  // which the file tracer cannot follow, so the .node file is named explicitly.
  // The Dockerfile also copies the package wholesale — belt and braces, because
  // a missing binary only shows up when the container starts.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/better-sqlite3/build/Release/*.node'],
  },

  images: {
    // AVIF first, WebP for everything that cannot take it.
    formats: ['image/avif', 'image/webp'],
    // Widths the site actually asks for, so the optimiser builds no dead variants.
    deviceSizes: [375, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512],
    // The qualities the components ask for (default 75, hero 78, uploads 80,
    // bundled photos 82). Anything else is refused, so nobody can make the
    // optimiser encode — and cache — arbitrary variants. Required from Next 16.
    qualities: [75, 78, 80, 82],
    // Uploads are content-addressed and immutable; cache the derivatives for a year.
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
  },

  experimental: {
    // The stylesheet is small (≈8 KB compressed), so it ships inside the HTML
    // instead of as a render-blocking request: one round trip less before the
    // first paint, which is most of the cost on a mobile connection.
    inlineCss: true,
  },

  eslint: {
    dirs: ['app', 'components', 'lib', 'scripts'],
  },

  /**
   * Baseline security headers for every response, including the static assets
   * the middleware matcher deliberately skips. The per-request policy in
   * middleware.ts is the strict one — it carries the CSP nonce — but these hold
   * even on paths middleware never sees.
   */
  async headers() {
    return [
      {
        // The hero clip. Its name is not hashed — swapping footage means pointing
        // NEXT_PUBLIC_HERO_VIDEO at a new file — so a week, not a year.
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ];
  },

  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
