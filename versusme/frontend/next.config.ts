import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: isDev
      ? [
          {
            protocol: "http",
            hostname: "localhost",
            port: "4000",
            pathname: "/uploads/**",
          },
        ]
      : [
          {
            protocol: "https",
            hostname: "api.versusme.com", // ⚠️ cambia este dominio por el real de tu backend en la nube
            pathname: "/uploads/**",
          },
        ],
  },
};

export default nextConfig;
