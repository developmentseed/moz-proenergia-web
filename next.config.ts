import type { NextConfig } from "next";
import createMDX from '@next/mdx';
import { BASE_PATH } from './src/config/website';

const nextConfig: NextConfig = {
  output: 'export',
  // BASE_PATH is empty for `pnpm dev` / `pnpm build` and `/app` under `build-prod`.
  basePath: BASE_PATH || undefined,
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
