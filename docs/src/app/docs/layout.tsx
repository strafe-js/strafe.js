import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { Zap, Shield, Sparkles, Radio } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="font-extrabold text-[#509b6b] tracking-tight flex items-center gap-2 text-base">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#509b6b]/15 border border-[#509b6b]/30 text-[#509b6b]">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <span>Strafe.js</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#509b6b]/15 text-[#6db888] border border-[#509b6b]/25">
              v1.0
            </span>
          </span>
        ),
        url: '/',
      }}
      githubUrl="https://github.com/strafe-js/strafe.js"
      links={[
        {
          text: 'Permission Calculator',
          url: '/docs/tools/permission-calculator',
          icon: <Shield className="w-4 h-4 text-[#509b6b]" />,
        },
        {
          text: 'Command Builder',
          url: '/docs/tools/command-builder',
          icon: <Sparkles className="w-4 h-4 text-[#509b6b]" />,
        },
        {
          text: 'API Playground',
          url: '/docs/tools/api-playground',
          icon: <Radio className="w-4 h-4 text-[#509b6b]" />,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
