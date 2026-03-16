import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        hostname: "lms-system-storage.s3.us-east-1.amazonaws.com",
        port: "",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
