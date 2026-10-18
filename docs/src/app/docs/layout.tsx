import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { SDK_VERSION_TAG } from '@/lib/version';

function BitIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b]" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function OAuthIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b]" aria-hidden="true">
      <circle cx="5.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 8H14.5M12.5 8V10.5M10.5 8V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CmdIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b]" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 6.2L6.8 8L4.5 9.8M8 10H11.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b]" aria-hidden="true">
      <path d="M1.5 8H4L6 4L8.5 12L10.5 6.5L12 8H14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
              alt="Strafe"
              width={22}
              height={22}
              className="strafe-brand-icon w-[22px] h-[22px] rounded-md"
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
          icon: <BitIcon />,
        },
        {
          text: 'OAuth2 Generator',
          url: '/docs/tools/oauth2-generator',
          icon: <OAuthIcon />,
        },
        {
          text: 'Command Builder',
          url: '/docs/tools/command-builder',
          icon: <CmdIcon />,
        },
        {
          text: 'API Playground',
          url: '/docs/tools/api-playground',
          icon: <WaveIcon />,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
