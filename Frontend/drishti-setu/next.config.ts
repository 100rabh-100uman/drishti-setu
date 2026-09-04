import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
