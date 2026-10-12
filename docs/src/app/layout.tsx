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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-sky-500/20 selection:text-sky-500">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
