import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cpnmghbsbaspmypcuqgh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
