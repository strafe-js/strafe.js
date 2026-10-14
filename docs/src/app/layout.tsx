import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';

export const metadata = {
  title: {
    template: '%s | Strafe.js',
    default: 'Strafe.js — TypeScript SDK for Strafe Chat',
  },
  description: 'Complete TypeScript & JavaScript SDK suite for the Strafe Chat REST API and WebSocket Gateway.',
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-fd-background text-fd-foreground antialiased selection:bg-[#509b6b]/25 selection:text-[#6db888]">
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            enableSystem: true,
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
