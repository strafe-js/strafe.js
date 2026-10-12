import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="font-bold text-sky-500 tracking-tight flex items-center gap-1.5 text-base">
            ⚡ Strafe.js Docs
          </span>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
