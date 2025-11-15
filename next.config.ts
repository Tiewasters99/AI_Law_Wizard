import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Simple configuration for Vercel Blob storage

  // Exclude archive-src folder from build
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: /archive-src/,
      use: "ignore-loader",
    });
    return config;
  },

  // Exclude from static generation
  generateBuildId: async () => {
    return "build-" + Date.now();
  },
};

export default nextConfig;
