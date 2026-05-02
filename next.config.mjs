/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["midtrans-client"],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
    };
    return config;
  },
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
