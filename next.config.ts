import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  outputFileTracingRoot: 'pnpm-lock.yaml'
};

const withMDX = createMDX({
    extension: /\.(md|mdx)$/
});

export default withMDX(nextConfig);
