import Link from 'next/link';
import {
  Shield,
  Zap,
  ArrowRight,
  Cpu,
  Wrench,
  Terminal,
  Package,
  Radio,
  Sparkles,
  BookOpen,
  Layers,
} from 'lucide-react';

const PACKAGES = [
  {
    name: '@strafe-js/strafebot',
    desc: 'High-level Bot Client, state caches, Equinox permission engine, and typed Command Framework.',
    href: '/docs/strafebot/client',
    badge: 'Core SDK',
  },
  {
    name: '@strafe-js/rest',
    desc: 'Fetch-based HTTP REST client with automatic 429 Retry-After backoff and multipart uploads.',
    href: '/docs/rest/overview',
    badge: 'HTTP Client',
  },
  {
    name: '@strafe-js/ws',
    desc: 'Persistent WebSocket Gateway client with automatic heartbeating, jitter backoff, and event normalization.',
    href: '/docs/ws/overview',
    badge: 'Gateway WS',
  },
  {
    name: '@strafe-js/builders',
    desc: 'Fluent MessageBuilder and permission bitmask factories for clean payload construction.',
    href: '/docs/packages/overview',
    badge: 'Builders',
  },
  {
    name: '@strafe-js/collection',
    desc: 'Extended Map<K, V> data structure with functional query helpers (find, filter, map, first).',
    href: '/docs/packages/overview',
    badge: 'Data Structure',
  },
  {
    name: 'create-strafebot',
    desc: 'Interactive CLI tool to scaffold new TypeScript bots and generate command modules.',
    href: '/docs/cli/overview',
    badge: 'CLI Tool',
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between bg-[#0d0f12] text-[#f3f5f7] min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0d0f12]/80 border-b border-[#262b33]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#509b6b]/15 border border-[#509b6b]/30 text-[#509b6b]">
              <Zap className="w-4 h-4" />
            </span>
            <span>Strafe.js</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#509b6b]/15 text-[#6db888] border border-[#509b6b]/25">
              v1.0.5
            </span>
          </Link>

          <nav className="flex items-center gap-5 text-xs sm:text-sm font-medium text-[#9ba5b4]">
            <Link href="/docs" className="hover:text-[#f3f5f7] transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#509b6b]" />
              <span>Docs</span>
            </Link>
            <Link
              href="/docs/tools/permission-calculator"
              className="hidden sm:flex hover:text-[#f3f5f7] transition-colors items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-[#509b6b]" />
              <span>Permissions</span>
            </Link>
            <Link
              href="/docs/tools/command-builder"
              className="hidden md:flex hover:text-[#f3f5f7] transition-colors items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#509b6b]" />
              <span>Command Builder</span>
            </Link>
            <Link
              href="/docs/tools/api-playground"
              className="hidden md:flex hover:text-[#f3f5f7] transition-colors items-center gap-1.5"
            >
              <Radio className="w-4 h-4 text-[#509b6b]" />
              <span>API Playground</span>
            </Link>
            <a
              href="https://github.com/strafe-js/strafe.js"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#15181d] hover:bg-[#1e2229] text-[#f3f5f7] border border-[#262b33] transition-colors text-xs font-semibold"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 max-w-6xl mx-auto w-full text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-35 pointer-events-none">
          <div className="w-[620px] h-[620px] bg-[#509b6b]/20 rounded-full blur-3xl" />
          <div className="w-[420px] h-[420px] bg-[#3f8a5a]/15 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#509b6b]/10 border border-[#509b6b]/25 text-[#6db888] text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-[#509b6b]" /> Next-Gen Strafe Chat Bot SDK Suite
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f3f5f7] max-w-4xl mx-auto leading-tight">
          Build powerful bots on{' '}
          <span className="bg-gradient-to-r from-[#509b6b] to-[#6db888] bg-clip-text text-transparent">
            Strafe Chat
          </span>{' '}
          with TypeScript
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#9ba5b4] max-w-2xl mx-auto leading-relaxed">
          Complete, strictly-typed monorepo suite featuring a REST API client, WebSocket Gateway engine, Equinox permission resolver, typed Command Framework, and interactive CLI scaffolder.
        </p>

        {/* Quick Install Pill */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#15181d] border border-[#262b33] font-mono text-xs text-[#d4dbe3] shadow-inner">
          <Terminal className="w-4 h-4 text-[#509b6b]" />
          <span>npm create strafebot@latest my-bot</span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/docs"
            className="px-6 py-3 rounded-xl bg-[#509b6b] hover:bg-[#45875d] text-[#f5f9f7] font-bold text-sm transition-all shadow-lg shadow-[#509b6b]/20 flex items-center gap-2"
          >
            Read Documentation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs/guides/getting-started"
            className="px-5 py-3 rounded-xl bg-[#15181d] hover:bg-[#1e2229] text-[#f3f5f7] border border-[#262b33] font-bold text-sm transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#509b6b]" /> Quickstart Guide
          </Link>
          <Link
            href="/docs/tools/permission-calculator"
            className="px-5 py-3 rounded-xl bg-[#15181d] hover:bg-[#1e2229] text-[#f3f5f7] border border-[#262b33] font-bold text-sm transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#509b6b]" /> Permission Calculator
          </Link>
        </div>

        {/* Code Snippet Banner */}
        <div className="mt-14 max-w-3xl mx-auto text-left rounded-2xl border border-[#262b33] bg-[#15181d] p-6 shadow-2xl overflow-hidden font-mono text-xs text-[#f3f5f7]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262b33] text-[#9ba5b4]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-[11px]">src/index.ts — @strafe-js/strafebot</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#509b6b]/15 text-[#6db888]">TypeScript ESM</span>
          </div>

          <pre className="text-[#6db888] leading-relaxed overflow-x-auto">
            <code>{`import { Client, command } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: 'https://app.strafe.chat/api',
  gatewayUrl: 'wss://app.strafe.chat/gateway/events',
  prefix: '!',
});

client.commands.register(
  command({
    name: 'ban',
    description: 'Ban a member with typed arguments',
    permissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    arguments: {
      target: { type: 'user', required: true },
      reason: { type: 'string', default: 'No reason provided' },
    },
    async run(ctx) {
      const targetId = ctx.arguments.get('target');
      const reason = ctx.arguments.get('reason');
      await ctx.client.rest.banMember(ctx.spaceId!, targetId, reason);
      await ctx.reply(\`Banned <@\${targetId}> (\${reason})\`);
    },
  })
);

await client.login(process.env.BOT_TOKEN!);`}</code>
          </pre>
        </div>
      </section>

      {/* Monorepo Ecosystem Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-[#262b33]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f3f5f7]">
            Modular Monorepo Architecture
          </h2>
          <p className="mt-2 text-sm text-[#9ba5b4]">
            Install the full <code className="text-[#6db888] font-mono">@strafe-js/strafebot</code> suite or cherry-pick standalone packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKAGES.map((pkg) => (
            <Link
              key={pkg.name}
              href={pkg.href}
              className="group p-5 rounded-2xl border border-[#262b33] bg-[#15181d] hover:border-[#509b6b]/60 hover:bg-[#191d24] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-[#6db888] group-hover:text-[#509b6b] transition-colors">
                    <Package className="w-4 h-4" />
                    {pkg.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#509b6b]/10 text-[#6db888] border border-[#509b6b]/20">
                    {pkg.badge}
                  </span>
                </div>
                <p className="text-xs text-[#9ba5b4] leading-relaxed">{pkg.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#262b33]/60 flex items-center text-xs font-semibold text-[#509b6b] group-hover:translate-x-0.5 transition-transform">
                Explore Reference <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-[#262b33]">
        <h2 className="text-2xl font-bold text-center mb-12 text-[#f3f5f7]">
          Why Engineers Choose Strafe.js
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-[#262b33] bg-[#15181d]">
            <div className="p-3 rounded-xl bg-[#509b6b]/10 text-[#509b6b] w-fit mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#f3f5f7] mb-2">High-Resilience REST & WS</h3>
            <p className="text-xs text-[#9ba5b4] leading-relaxed">
              Automatic HTTP 429 Retry-After backoff, WebSocket Ping/Pong heartbeats, jittered exponential reconnects, and in-flight member fetch deduplication.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#262b33] bg-[#15181d]">
            <div className="p-3 rounded-xl bg-[#509b6b]/10 text-[#509b6b] w-fit mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#f3f5f7] mb-2">Equinox Permission Engine</h3>
            <p className="text-xs text-[#9ba5b4] leading-relaxed">
              Full 6-stage hierarchical permission calculation supporting Space Owners, Role masks, Administrator short-circuiting, Room overrides, and dependent cascades.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#262b33] bg-[#15181d]">
            <div className="p-3 rounded-xl bg-[#509b6b]/10 text-[#509b6b] w-fit mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#f3f5f7] mb-2">Typed Command Schemas</h3>
            <p className="text-xs text-[#9ba5b4] leading-relaxed">
              Declarative argument validation supporting strings, integers, numbers, booleans, user mentions, snowflakes, and file attachments with full TypeScript inference.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#262b33] text-center text-xs text-[#9ba5b4]">
        Released under Apache-2.0 License • Strafe.js Ecosystem
      </footer>
    </div>
  );
}
