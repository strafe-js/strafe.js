import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { Shield, Sparkles, Radio } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="strafe-brand">
            <span className="strafe-brand-mark">Strafe</span>
            <span className="strafe-brand-dot">.js</span>
            <span className="strafe-brand-docs">DOCS</span>
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
