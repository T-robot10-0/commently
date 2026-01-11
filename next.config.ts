import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yt3.ggpht.com", // Pour les avatars utilisateurs
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com", // Pour les miniatures de vidéos
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Pour ton avatar Google
      },
    ],
  },
};

export default nextConfig;