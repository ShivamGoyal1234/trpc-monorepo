/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["api", "@repo/schemas"],
};

export default nextConfig;
