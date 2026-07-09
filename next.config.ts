import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Stary adres Vercela przekierowany na docelową domenę — jedno kanoniczne miejsce dla SEO i linków
      {
        source: "/:path*",
        has: [{ type: "host", value: "rc-photo-journey.vercel.app" }],
        destination: "https://rcichocki.fyi/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
