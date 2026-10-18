import { createMDX } from 'fumadocs-mdx/next';
import { ensurePlaygroundRelayServer } from './playground-relay.mjs';

const withMDX = createMDX();

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  ensurePlaygroundRelayServer();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isDev ? undefined : 'export',
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: !isDev,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: '/_playground-relay',
              destination: 'http://127.0.0.1:3099/_playground-relay',
            },
          ];
        },
      }
    : {}),
};

export default withMDX(nextConfig);
