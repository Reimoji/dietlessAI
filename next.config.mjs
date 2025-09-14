// next.config.mjs
import createMDX from '@next/mdx';

const withMDX = createMDX({
  // Any file ending with .mdx will be processed by the MDX loader
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Let Next treat .mdx files like pages/components alongside ts/tsx
  pageExtensions: ['ts', 'tsx', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
};

export default withMDX(nextConfig);
