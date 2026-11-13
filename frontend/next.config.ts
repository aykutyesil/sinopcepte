import type { NextConfig } from "next";

// Not: rewrites derleme anında routes-manifest'e yazılır. Docker'da BACKEND_URL bu yüzden
// build ARG olarak da verilir (bkz. Dockerfile); sunucu tarafı fetch'ler ise çalışma anında okur.
const backendUrl = (process.env.BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
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
