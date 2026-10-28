import type { NextConfig } from "next";

// Slike iz admina (slajder…) servira backend na /uploads
const api = new URL(process.env.HTZ_API_URL ?? "http://localhost:3000/api/v1");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: api.protocol === "https:" ? "https" : "http", hostname: api.hostname, port: api.port, pathname: "/uploads/**" },
    ],
    // Lokalno je backend na localhost-u, a Next ne optimizuje slike sa lokalnih adresa ako ovo nije uključeno
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
