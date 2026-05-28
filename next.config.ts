import type { NextConfig } from "next";

const getSupabaseHostname = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
};

const supabaseHostname = getSupabaseHostname() || "oxhpphwcymohgyfrljrh.supabase.co";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 82, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: supabaseHostname,
      },
    ],
  },
};

export default nextConfig;

