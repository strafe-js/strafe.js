import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { SDK_VERSION_TAG } from '@/lib/version';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      themeSwitch={{
        enabled: false,
      }}
      nav={{
        title: (
          <span className="strafe-brand inline-flex items-center gap-2">
            <img
              src="https://app.strafe.chat/icons/icon-192.png"
              alt="Strafe.js"
              width={22}
              height={22}
              className="strafe-brand-icon w-[22px] h-[22px]"
            />
            <span>
              <span className="strafe-brand-mark">Strafe</span>
              <span className="strafe-brand-dot">.js</span>
              <span className="strafe-brand-docs">{SDK_VERSION_TAG}</span>
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
        },
        {
          text: 'OAuth2 Generator',
          url: '/docs/tools/oauth2-generator',
        },
        {
          text: 'Command Builder',
          url: '/docs/tools/command-builder',
        },
        {
          text: 'API Playground',
          url: '/docs/tools/api-playground',
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
