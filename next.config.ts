import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  dir: {
    src: "./src",
  },
  webpack: (config, { isServer }) => {
    // Alias to make /src/app work as /app
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/app": path.resolve(__dirname, "src/app"),
    };
    return config;
  },
  images: {
    // Only optimize local images from /public directory
    // External images (Google Drive, Supabase) are served unoptimized via AppImage
    // This prevents Vercel Image Transformation costs for external sources
    localPatterns: [
      {
        // This allows images from 'public' folder
        pathname: "/**",
      },
    ],
    // Allow external image domains for proxy fallback
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/thumbnail/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
    ],
    qualities: [100, 75],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
