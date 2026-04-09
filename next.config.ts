import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    /** Cache optimized variants at the CDN/edge (seconds). */
    minimumCacheTTL: 60 * 60 * 24 * 7,
    /** Allow any path on project hosts (storage, render/image, etc.) — member rails use next/image for local assets. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
    ],
  },
  /** Prisma delegates (`db.dailyVerse`, etc.) are runtime-defined; bundling can leave them undefined under Turbopack. */
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    ".prisma/client",
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
  ],
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
  async redirects() {
    return [
      { source: "/prayer-wall", destination: "/prayer", permanent: true },
      { source: "/workouts", destination: "/movement", permanent: true },
      { source: "/workouts/:path*", destination: "/movement/:path*", permanent: true },
      {
        source: "/movement/schedule-day/:scheduleDayId",
        destination: "/schedule/movement/:scheduleDayId",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
