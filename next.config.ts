import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

const withMDX = createMDX({
    extension: /\.(md|mdx)$/
});

export default withMDX(nextConfig);

