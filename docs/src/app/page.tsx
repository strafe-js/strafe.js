import Link from 'next/link';
import {
  Shield,
  ArrowRight,
  Cpu,
  Wrench,
  Terminal,
  Package,
  Radio,
  Sparkles,
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
      {/* Topbar matching https://app.strafe.chat/docs/ */}
      <header className="sticky top-0 z-40 h-14 backdrop-blur-md bg-[#101216]/85 border-b border-[#2a2f39]">
        <div className="max-w-[1380px] mx-auto px-5 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="strafe-brand inline-flex items-center gap-2">
              <img
                src="https://app.strafe.chat/icons/icon-192.png"
                alt="Strafe"
                width={24}
                height={24}
                className="w-6 h-6 rounded-md"
              />
              <span>
                <span className="strafe-brand-mark">Strafe</span>
                <span className="strafe-brand-dot">.js</span>
                <span className="strafe-brand-docs">DOCS</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-[#b4bac6]">
              <Link
                href="/docs"
                className="px-2.5 py-1.5 rounded-md hover:text-[#e6e8ec] hover:bg-[#1e222a] transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/docs/strafebot/client"
                className="px-2.5 py-1.5 rounded-md hover:text-[#e6e8ec] hover:bg-[#1e222a] transition-colors"
              >
                Client & Bots
              </Link>
              <Link
                href="/docs/ws/overview"
                className="px-2.5 py-1.5 rounded-md hover:text-[#e6e8ec] hover:bg-[#1e222a] transition-colors"
              >
                Gateway
              </Link>
              <Link
                href="/docs/rest/overview"
                className="px-2.5 py-1.5 rounded-md hover:text-[#e6e8ec] hover:bg-[#1e222a] transition-colors"
              >
                REST API
              </Link>
              <Link
                href="/docs/tools/permission-calculator"
                className="px-2.5 py-1.5 rounded-md hover:text-[#e6e8ec] hover:bg-[#1e222a] transition-colors"
              >
                Permissions
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] bg-[#509b6b]/15 text-[#6ab585] border border-[#509b6b]/30">
              v1.2.0
            </span>
            <a
              href="https://app.strafe.chat/docs/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[#b4bac6] hover:text-[#e6e8ec] hover:bg-[#1e222a] transition-colors font-medium"
            >
              <span>Strafe API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/strafe-js/strafe.js"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#171a20] hover:bg-[#1e222a] text-[#e6e8ec] border border-[#2a2f39] transition-colors font-semibold"
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
              className="px-4 py-2 rounded-lg bg-[#509b6b] hover:bg-[#45875d] text-[#e6e8ec] font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/docs/guides/getting-started"
              className="px-4 py-2 rounded-lg bg-[#171a20] hover:bg-[#1e222a] text-[#e6e8ec] border border-[#2a2f39] hover:border-[#363c48] font-semibold text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-[#509b6b]" />
              <span>Quickstart Guide</span>
            </Link>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0b0d11] border border-[#2a2f39] font-mono text-xs text-[#b4bac6]">
              <Terminal className="w-3.5 h-3.5 text-[#509b6b]" />
              <span>npm create strafebot@latest my-bot</span>
            </div>
          </div>
        </div>

        {/* Documentation Sections Card Grid */}
        <h2 className="text-xl font-bold tracking-[-0.015em] text-[#e6e8ec] pb-2 border-b border-[#2a2f39] mb-4">
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

        {/* Quick Example */}
        <h2 className="text-xl font-bold tracking-[-0.015em] text-[#e6e8ec] pb-2 border-b border-[#2a2f39] mb-4">
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

        {/* Monorepo Packages Table / Cards */}
        <h2 className="text-xl font-bold tracking-[-0.015em] text-[#e6e8ec] pb-2 border-b border-[#2a2f39] mb-4">
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

        {/* Interactive Developer Tools */}
        <h2 className="text-xl font-bold tracking-[-0.015em] text-[#e6e8ec] pb-2 border-b border-[#2a2f39] mb-4">
          Interactive Developer Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Link href="/docs/tools/permission-calculator" className="strafe-card block group">
            <div className="flex items-center gap-2 font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] mb-1.5">
              <Shield className="w-4 h-4 text-[#509b6b]" />
              <span>Permission Calculator</span>
            </div>
            <p className="text-[13px] text-[#b4bac6] leading-snug">
              Toggle all 28 official Strafe permission bits and generate bitmask code.
            </p>
          </Link>
          <Link href="/docs/tools/command-builder" className="strafe-card block group">
            <div className="flex items-center gap-2 font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] mb-1.5">
              <Sparkles className="w-4 h-4 text-[#509b6b]" />
              <span>Command Builder</span>
            </div>
            <p className="text-[13px] text-[#b4bac6] leading-snug">
              Design typed command schemas visually and export ready-to-run TypeScript.
            </p>
          </Link>
          <Link href="/docs/tools/api-playground" className="strafe-card block group">
            <div className="flex items-center gap-2 font-bold text-[15px] text-[#e6e8ec] group-hover:text-[#6ab585] mb-1.5">
              <Radio className="w-4 h-4 text-[#509b6b]" />
              <span>API Playground</span>
            </div>
            <p className="text-[13px] text-[#b4bac6] leading-snug">
              Inspect Strafe REST endpoints and preview @strafe-js/rest calls.
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
