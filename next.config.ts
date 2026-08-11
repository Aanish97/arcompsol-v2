import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // emailjs is a Node-only CommonJS package that extends built-in classes.
  // Bundling it for the server build rewrites those class hierarchies and it
  // dies at collect-page-data with "Super expression must either be null or a
  // function". Listing it here leaves it as a plain runtime require.
  serverExternalPackages: ["emailjs"],

  // Without this Next walks up looking for a lockfile, finds ~/package-lock.json
  // outside the repo, and warns on every build.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
