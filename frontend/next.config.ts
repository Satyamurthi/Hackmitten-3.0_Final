import type { NextConfig } from "next";

const rawOrigin = (process.env.BACKEND_API_ORIGIN ?? "https://hackmitten-3-0-api.mitt.edu.in").trim();
let backendApiOrigin = "https://hackmitten-3-0-api.mitt.edu.in";

if (rawOrigin && rawOrigin !== "*") {
  try {
    const parsed = new URL(rawOrigin.startsWith("http") ? rawOrigin : `https://${rawOrigin}`);
    backendApiOrigin = `${parsed.protocol}//${parsed.host}`;
  } catch {
    backendApiOrigin = "https://hackmitten-3-0-api.mitt.edu.in";
  }
}

const isExport = process.env.NODE_ENV === "production" && process.env.NEXT_EXPORT !== "false";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  allowedDevOrigins: [
    "hackmitten-3-0-api.mitt.edu.in",
    "hackmitten-3-0.mitt.edu.in",
    "*.mitt.edu.in",
    "**.mitt.edu.in",
    "localhost",
    "127.0.0.1",
    "*.localhost",
    "*.netlify.app",
    "*",
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
  ...(!isExport ? {
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, PUT, DELETE, OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          ],
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: `${backendApiOrigin}/api/:path*`,
        },
        {
          source: "/uploads/:path*",
          destination: `${backendApiOrigin}/uploads/:path*`,
        },
      ];
    },
  } : {}),
};

export default nextConfig;

