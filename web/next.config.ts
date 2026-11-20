import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photo uploads (P3-08) go through a server action. Vercel functions
      // accept at most a 4.5 MB request body, so lib/photos/upload.ts caps
      // the file at 4 MB and this leaves room for the form's other fields.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
