import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
