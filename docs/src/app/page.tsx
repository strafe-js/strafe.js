import Link from 'next/link';
import {
  ArrowRight,
  Terminal,
  Package,
  BookOpen,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { CodeWindow } from '@/components/CodeWindow';

const DOC_SECTIONS = [
  {
    title: 'Getting Started & Bot Client',
    desc: 'Create a bot application, connect to Stargate Gateway, and use the high-level @strafe-js/strafebot Client.',
    href: '/docs/guides/getting-started',
    badge: 'Start Here',
  },
  {
    title: 'Command Framework',
    desc: 'Declarative prefix commands, typed argument schemas, cooldowns, and Equinox permission guards.',
    href: '/docs/commands/overview',
    badge: 'Commands',
  },
  {
    title: 'WebSocket Gateway (@strafe-js/ws)',
    desc: 'Connect to wss://app.strafe.chat/gateway/events, handle opcodes 0-8, space_rooms, and real-time events.',
    href: '/docs/ws/overview',
    badge: 'Gateway',
  },
  {
    title: 'REST API & OAuth2 (@strafe-js/rest)',
    desc: 'HTTP reference for Spaces, Rooms, Messages, Threads, Reactions, Pins, OAuth2 token exchange, and Web Push.',
    href: '/docs/rest/overview',
    badge: 'REST API',
  },
  {
    title: 'Permissions & Bitfields',
    desc: 'The 28-bit Strafe permission table, role & user room overrides, and the 6-stage Equinox resolver.',
    href: '/docs/tools/permission-calculator',
    badge: 'Permissions',
  },
  {
    title: 'Packages & Builders',
    desc: 'Explore @strafe-js/builders, @strafe-js/formatters, @strafe-js/collection, @strafe-js/util, and create-strafebot.',
    href: '/docs/packages/builders',
    badge: 'Ecosystem',
  },
  {
    title: 'OAuth2 & Bot Invite Generator',
    desc: 'Build /oauth2/authorize consent and bot installation links with permission presets and scopes.',
    href: '/docs/tools/oauth2-generator',
    badge: 'Tool',
  },
];

const PACKAGES = [
  {
    name: '@strafe-js/strafebot',
    version: 'v1.2.0',
    desc: 'High-level Bot Client, state caches (spaces, rooms, spaceRooms, members), Equinox permission engine, and typed Command Framework.',
    href: '/docs/strafebot/client',
  },
  {
    name: '@strafe-js/rest',
    version: 'v1.2.0',
    desc: 'Fetch-based HTTP REST client with automatic 429 Retry-After backoff, threads, reactions, pins, search, and multipart uploads.',
    href: '/docs/rest/overview',
  },
  {
    name: '@strafe-js/ws',
    version: 'v1.2.0',
    desc: 'Stargate WebSocket Gateway client supporting nested & flat op:3 event envelopes, heartbeats, and jittered reconnects.',
    href: '/docs/ws/overview',
  },
  {
    name: '@strafe-js/builders',
    version: 'v1.2.0',
    desc: 'Fluent MessageBuilder and permission bitmask factories for clean payload construction.',
    href: '/docs/packages/builders',
  },
  {
    name: '@strafe-js/formatters',
    version: 'v1.2.0',
    desc: 'Markdown, mention (<@id>, <#id>, <@&id>), custom emoji (<:name:id>, custom:id), and codeblock formatters.',
    href: '/docs/packages/formatters',
  },
  {
    name: '@strafe-js/collection',
    version: 'v1.2.0',
    desc: 'Extended Map<K, V> data structure with functional query helpers (find, filter, map, first).',
    href: '/docs/packages/collection',
  },
  {
    name: '@strafe-js/util',
    version: 'v1.2.0',
    desc: '28-bit Strafe Permission flags, BitField class, GatewayOp & RoomType constants, error classes, and TypeScript interfaces.',
    href: '/docs/packages/util',
  },
  {
    name: 'create-strafebot',
    version: 'v1.2.0',
    desc: 'Interactive CLI tool to scaffold new TypeScript bots and generate command modules.',
    href: '/docs/cli/overview',
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between bg-[#101216] text-[#e6e8ec] min-h-screen">
      <header className="strafe-header h-15">
        <div className="max-w-[1380px] mx-auto px-5 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="strafe-brand inline-flex items-center gap-2.5">
              <img
                src="https://app.strafe.chat/icons/icon-192.png"
                alt="Strafe"
                width={24}
                height={24}
                className="strafe-brand-icon w-6 h-6 rounded-md"
              />
              <span>
                <span className="strafe-brand-mark">Strafe</span>
                <span className="strafe-brand-dot">.js</span>
                <span className="strafe-brand-docs">DOCS</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/docs" className="strafe-nav-pill">
                Overview
              </Link>
              <Link href="/docs/strafebot/client" className="strafe-nav-pill">
                Client & Bots
              </Link>
              <Link href="/docs/ws/overview" className="strafe-nav-pill">
                Gateway
              </Link>
              <Link href="/docs/rest/overview" className="strafe-nav-pill">
                REST API
              </Link>
              <Link href="/docs/tools/permission-calculator" className="strafe-nav-pill">
                Permissions
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="hidden sm:inline-flex strafe-version-pill">
              v1.2.0
            </span>
            <a
              href="https://app.strafe.chat/docs/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 strafe-nav-pill"
            >
              <span>Strafe API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/strafe-js/strafe.js"
              target="_blank"
              rel="noreferrer"
              className="strafe-header-btn"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container inspired by https://app.strafe.chat/docs/ */}
      <main className="max-w-[960px] mx-auto w-full px-6 py-11 flex-1">
        {/* Hero Box */}
        <div className="strafe-hero mb-9">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#509b6b]/15 text-[#6ab585] border border-[#509b6b]/30 mb-3">
            @strafe-js/strafebot • v1.2.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-[#e6e8ec] leading-tight">
            Strafe.js Developer Documentation
          </h1>
          <p className="mt-3 text-[15px] text-[#b4bac6] max-w-[66ch] leading-relaxed">
            Build bots and integrations on{' '}
            <a
              href="https://app.strafe.chat/docs/"
              target="_blank"
              rel="noreferrer"
              className="text-[#6ab585] hover:underline"
            >
              Strafe Chat
            </a>{' '}
            with TypeScript. Everything you need to authenticate with the REST API, stream live events over the Stargate WebSocket Gateway, compute 28-bit room permissions, and build typed prefix commands.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="strafe-btn-primary text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/docs/guides/getting-started"
              className="strafe-btn-secondary text-xs sm:text-sm"
            >
              <Layers className="w-4 h-4 text-[#509b6b]" />
              <span>Quickstart Guide</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0b0d11] border border-[#2a2f39] shadow-inner font-mono text-xs text-[#b4bac6]">
              <Terminal className="w-3.5 h-3.5 text-[#509b6b]" />
              <span>npm create strafebot@latest my-bot</span>
            </div>
          </div>
        </div>

        <h2 className="strafe-section-heading">
          Documentation Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-10">
          {DOC_SECTIONS.map((item) => (
            <Link key={item.title} href={item.href} className="strafe-card block group">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] transition-colors">
                  {item.title}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#509b6b]/15 text-[#6ab585]">
                  {item.badge}
                </span>
              </div>
              <p className="text-[13px] text-[#b4bac6] leading-snug">{item.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="strafe-section-heading">
          Quick Example
        </h2>
        <div className="mb-10">
          <CodeWindow
            title="src/index.ts - @strafe-js/strafebot v1.2.0"
            lang="ts"
            showLineNumbers
            code={`import { Client, command } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: 'https://app.strafe.chat/api',
  gatewayUrl: 'wss://app.strafe.chat/gateway/events',
  prefix: '!',
});

client.commands.register(
  command({
    name: 'thread',
    description: 'Start a thread and react to the starter message',
    permissions: ['CreatePublicThreads'],
    botPermissions: ['CreatePublicThreads', 'AddReactions'],
    arguments: {
      name: { type: 'string', required: true },
    },
    async run(ctx) {
      await ctx.react('🧵');
      const thread = await ctx.client.rest.createThreadFromMessage(
        ctx.roomId,
        ctx.message.id,
        { name: ctx.arguments.get('name') },
      );
      await ctx.client.rest.createMessage(thread.id, {
        plaintext: \`Thread created by <@\${ctx.authorId}>!\`,
      });
    },
  }),
);

await client.login(process.env.BOT_TOKEN!);`}
          />
        </div>

        <h2 className="strafe-section-heading">
          Monorepo Packages (v1.2.0)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10">
          {PACKAGES.map((pkg) => (
            <Link key={pkg.name} href={pkg.href} className="strafe-card block group">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-[#6ab585] group-hover:text-[#509b6b] transition-colors">
                  <Package className="w-3.5 h-3.5" />
                  {pkg.name}
                </span>
                <span className="text-[11px] font-mono text-[#7f8797]">{pkg.version}</span>
              </div>
              <p className="text-[13px] text-[#b4bac6] leading-snug">{pkg.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="strafe-section-heading">
          Interactive Developer Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Link href="/docs/tools/permission-calculator" className="strafe-card block group">
            <div className="flex items-center gap-2 font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] mb-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b] shrink-0" aria-hidden="true">
                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.4" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.4" />
                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <span>Permission Calculator</span>
            </div>
            <p className="text-[13px] text-[#b4bac6] leading-snug">
              Toggle all 28 Strafe permission bits on a live 0..27 bit register and export bitmask code.
            </p>
          </Link>
          <Link href="/docs/tools/command-builder" className="strafe-card block group">
            <div className="flex items-center gap-2 font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] mb-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b] shrink-0" aria-hidden="true">
                <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4.5 6.2L6.8 8L4.5 9.8M8 10H11.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Command Builder</span>
            </div>
            <p className="text-[13px] text-[#b4bac6] leading-snug">
              Configure command guards and typed argument schemas, then test input tokenization.
            </p>
          </Link>
          <Link href="/docs/tools/api-playground" className="strafe-card block group">
            <div className="flex items-center gap-2 font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] mb-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#509b6b] shrink-0" aria-hidden="true">
                <path d="M1.5 8H4L6 4L8.5 12L10.5 6.5L12 8H14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>API Playground</span>
            </div>
            <p className="text-[13px] text-[#b4bac6] leading-snug">
              Inspect Strafe HTTP routes and Stargate WebSocket opcodes (op: 0..8).
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#2a2f39] text-center text-xs text-[#7f8797]">
        Strafe.js v1.2.0 • Apache-2.0 License • Built for{' '}
        <a
          href="https://app.strafe.chat/docs/"
          target="_blank"
          rel="noreferrer"
          className="text-[#6ab585] hover:underline"
        >
          Strafe Chat Developers
        </a>
      </footer>
    </div>
  );
}
