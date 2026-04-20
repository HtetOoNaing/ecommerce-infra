import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@infrapro/ui", "@infrapro/shared-types", "@infrapro/api-client"],
};

export default nextConfig;
