import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js infers it from the
  // nearest lockfile, which can incorrectly resolve to a parent directory
  // (e.g. the user's home folder) if one happens to exist there.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
