import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://strafe-js.github.io/strafe.js';
const siteTitle = 'Strafe.js — TypeScript SDK for Strafe Chat';
const siteDescription =
  'Complete TypeScript & JavaScript SDK suite for the Strafe Chat REST API and WebSocket Gateway.';
const strafeIcon512 = 'https://app.strafe.chat/icons/icon-512.png';
const strafeIcon192 = 'https://app.strafe.chat/icons/icon-192.png';
const strafeFavicon32 = 'https://app.strafe.chat/icons/favicon-32.png';
const strafeAppleIcon = 'https://app.strafe.chat/icons/apple-touch-icon.png';

export const viewport: Viewport = {
  themeColor: '#509b6b',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Strafe.js',
    default: siteTitle,
  },
  description: siteDescription,
  applicationName: 'Strafe.js Docs',
  keywords: [
    'Strafe',
    'Strafe Chat',
    'Strafe.js',
    'strafebot',
    '@strafe-js/strafebot',
    'TypeScript SDK',
    'Bot Framework',
    'WebSocket Gateway',
    'REST API',
  ],
  authors: [{ name: 'Strafe.js Contributors', url: 'https://github.com/strafe-js/strafe.js' }],
  creator: 'Strafe.js',
  publisher: 'Strafe.js',
  icons: {
    icon: [
      { url: strafeFavicon32, sizes: '32x32', type: 'image/png' },
      { url: strafeIcon192, sizes: '192x192', type: 'image/png' },
      { url: strafeIcon512, sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [strafeFavicon32],
    apple: [{ url: strafeAppleIcon, sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Strafe.js Documentation',
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: strafeIcon512,
        width: 512,
        height: 512,
        alt: 'Strafe.js — TypeScript SDK for Strafe Chat',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
    images: [strafeIcon512],
  },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-fd-background text-fd-foreground antialiased selection:bg-[#509b6b]/25 selection:text-[#6db888]">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            forcedTheme: 'dark',
            enableSystem: false,
          }}
          search={{
            options: {
              type: 'static',
              api: `${basePath}/api/search`,
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
