import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // emailjs is a Node-only CommonJS package that extends built-in classes.
  // Bundling it for the server build rewrites those class hierarchies and it
  // dies at collect-page-data with "Super expression must either be null or a
  // function". Listing it here leaves it as a plain runtime require.
  serverExternalPackages: ["emailjs"],

  // Ship browser source maps in production.
  //
  // Lighthouse Best Practices flags "Missing source maps for large first-party
  // JavaScript" without them, and more usefully: a production error otherwise
  // arrives as an unreadable stack through minified chunk names, which is
  // exactly when you need to read it.
  //
  // The trade-off is deliberate — .map files make the original source
  // retrievable by anyone who looks. That is acceptable here because this is a
  // public marketing site whose client bundle holds no secrets; every secret
  // lives in .env and is read server-side only. Do NOT copy this setting into
  // a project where the client code is itself proprietary.
  productionBrowserSourceMaps: true,

  // Without this Next walks up looking for a lockfile, finds ~/package-lock.json
  // outside the repo, and warns on every build.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
