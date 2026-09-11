import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login/dashboard",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/gis",
        destination: "/gis-map",
        permanent: false,
      },
      {
        source: "/health",
        destination: "/health-monitoring",
        permanent: false,
      },
      {
        source: "/analysis/gaps",
        destination: "/gap-analysis",
        permanent: false,
      },
      {
        source: "/audit",
        destination: "/audit-trail",
        permanent: false,
      },
      {
        source: "/api-docs",
        destination: "/registry-api",
        permanent: false,
      },
      {
        source: "/admin/users",
        destination: "/users-roles",
        permanent: false,
      },
      {
        source: "/admin/departments",
        destination: "/departments",
        permanent: false,
      },
      {
        source: "/admin/settings",
        destination: "/settings",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
