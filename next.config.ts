import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-mariadb", "mariadb"],
  async redirects() {
    return [
      {
        source: "/catalog",
        destination: "/catalogo",
        permanent: true,
      },
      {
        source: "/catalog/:path*",
        destination: "/catalogo/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

