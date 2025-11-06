import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    // 🔹 Permitir imágenes desde Cloudinary y localhost (modo dev)
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // 🔹 Variables públicas accesibles desde el frontend
  env: {
    NEXT_PUBLIC_API_BASE: isDev
      ? "http://localhost:4000"
      : "https://versusme-frontend.vercel.app/", // ⚠️ cambia este dominio al real
  },
};

export default nextConfig;
