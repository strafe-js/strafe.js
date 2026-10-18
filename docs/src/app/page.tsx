import Link from 'next/link';
import { CodeWindow } from '@/components/CodeWindow';
import { PACKAGE_VERSIONS, SDK_VERSION_TAG } from '@/lib/version';

const DOC_SECTIONS = [
  {
    title: 'Getting Started & Bot Client',
    route: 'POST /applications/:id/bot',
    desc: 'Create a bot application, connect to Stargate Gateway, and configure @strafe-js/strafebot Client.',
    href: '/docs/guides/getting-started',
  },
  {
    title: 'Command Framework & Arguments',
    route: 'command() / tokenizeArguments()',
    desc: 'Declarative prefix commands, typed argument schemas, per-user cooldowns, and Equinox permission guards.',
    href: '/docs/commands/overview',
  },
  {
    title: 'Stargate WebSocket Gateway',
    route: 'wss://app.strafe.chat/gateway/events',
    desc: 'Persistent WebSocket session handling opcodes 0..8, space_rooms hydration, and jittered reconnects.',
    href: '/docs/ws/overview',
  },
  {
    title: 'HTTP REST Client & OAuth2',
    route: 'https://app.strafe.chat/api',
    desc: 'Typed HTTP methods for Spaces, Rooms, Messages, Threads, Reactions, Pins, OAuth2, and Web Push.',
    href: '/docs/rest/overview',
  },
  {
    title: 'Equinox 6-Stage Permission Engine',
    route: 'bits 0..27 (0x0FFFFFFF)',
    desc: 'Space owner short-circuits, role masks, room overrides, thread inheritance, and ViewRoom / SendMessages cascades.',
    href: '/docs/guides/permissions',
  },
  {
    title: 'E2EE Rooms & RFC 8291 Web Push',
    route: 'e2ee_enabled / PUT /users/@me/push',
    desc: 'Encrypted room detection (isEncryptedRoom, encryptedMessageCreate), runtime SPACE_CREATE joins, and VAPID subscriptions.',
    href: '/docs/guides/e2ee-and-push',
  },
];

const PACKAGES = [
  {
    name: '@strafe-js/strafebot',
    version: `v${PACKAGE_VERSIONS['@strafe-js/strafebot']}`,
    deps: '@strafe-js/*',
    desc: 'Bot Client, Collection caches (spaces, rooms, spaceRooms, members), Equinox permission resolver, and CommandHandler.',
    href: '/docs/strafebot/client',
  },
  {
    name: '@strafe-js/rest',
    version: `v${PACKAGE_VERSIONS['@strafe-js/rest']}`,
    deps: '@strafe-js/util',
    desc: 'Fetch-based HTTP client with automatic HTTP 429 retry_after backoff, OAuth2 token exchange, and multipart uploads.',
    href: '/docs/rest/overview',
  },
  {
    name: '@strafe-js/ws',
    version: `v${PACKAGE_VERSIONS['@strafe-js/ws']}`,
    deps: '@strafe-js/util, ws',
    desc: 'Stargate WebSocket Gateway client supporting nested and flat op: 3 event envelopes, heartbeats, and reconnects.',
    href: '/docs/ws/overview',
  },
  {
    name: '@strafe-js/builders',
    version: `v${PACKAGE_VERSIONS['@strafe-js/builders']}`,
    deps: '@strafe-js/util',
    desc: 'MessageBuilder, PermissionOverwriteBuilder, bitmask helpers, and OAuth2 / bot invite URL builders.',
    href: '/docs/packages/builders',
  },
  {
    name: '@strafe-js/formatters',
    version: `v${PACKAGE_VERSIONS['@strafe-js/formatters']}`,
    deps: '@strafe-js/util',
    desc: 'Mention tokens (<@id>, <#id>, <@&id>), custom emoji tags (<:name:id>, custom:id), and Markdown escaping.',
    href: '/docs/packages/formatters',
  },
  {
    name: '@strafe-js/collection',
    version: `v${PACKAGE_VERSIONS['@strafe-js/collection']}`,
    deps: 'Zero dependencies',
    desc: 'Map<K, V> subclass with find, filter, map, first, last, random, partition, reduce, and sweep.',
    href: '/docs/packages/collection',
  },
  {
    name: '@strafe-js/util',
    version: `v${PACKAGE_VERSIONS['@strafe-js/util']}`,
    deps: 'Zero dependencies',
    desc: '28-bit Permission flags, BitField, Snowflake deconstruction, GatewayOp, RoomType, and TypeScript interfaces.',
    href: '/docs/packages/util',
  },
  {
    name: 'create-strafebot',
    version: `v${PACKAGE_VERSIONS['create-strafebot']}`,
    deps: 'Node.js built-ins',
    desc: 'CLI scaffolder for new TypeScript bot projects and src/commands/<name>.ts command modules.',
    href: '/docs/cli/overview',
  },
];

const WORKBENCHES = [
  {
    title: 'Equinox Permission Calculator',
    spec: '28-bit register (1 << 0 .. 1 << 27)',
    desc: 'Toggle Strafe permission bits, inspect Stage 3/5/6 Equinox cascade rules, and generate @strafe-js/builders bitmask code.',
    href: '/docs/tools/permission-calculator',
  },
  {
    title: 'OAuth2 & Bot Invite URL Builder',
    spec: 'GET /oauth2/authorize',
    desc: 'Construct RFC 6749 authorization and bot installation URLs with scope selection and role bitmask encoding.',
    href: '/docs/tools/oauth2-generator',
  },
  {
    title: 'Command Schema & Tokenizer Simulator',
    spec: 'command() / parseAndValidateArguments()',
    desc: 'Configure command guards and typed argument schemas, then test quote-aware tokenization against sample chat input.',
    href: '/docs/tools/command-builder',
  },
  {
    title: 'REST & Stargate Frame Inspector',
    spec: 'HTTP /api & WebSocket op: 0..8',
    desc: 'Inspect simulated REST responses and Gateway envelopes, or execute live requests with an in-memory Bot or Bearer token.',
    href: '/docs/tools/api-playground',
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between bg-[#101216] text-[#e6e8ec] min-h-screen">
      <header className="strafe-header">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="strafe-brand">
              <img
                src="https://app.strafe.chat/icons/icon-192.png"
                alt="Strafe.js"
                width={24}
                height={24}
                className="strafe-brand-icon w-6 h-6"
              />
              <span>
                <span className="strafe-brand-mark">Strafe</span>
                <span className="strafe-brand-dot">.js</span>
                <span className="strafe-brand-docs">{SDK_VERSION_TAG}</span>
              </span>
            </Link>

            <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1">
              <Link href="/docs" className="strafe-nav-pill">
                SDK Docs
              </Link>
              <Link href="/docs/strafebot/client" className="strafe-nav-pill">
                Client
              </Link>
              <Link href="/docs/commands/overview" className="strafe-nav-pill">
                Commands
              </Link>
              <Link href="/docs/ws/overview" className="strafe-nav-pill">
                Gateway
              </Link>
              <Link href="/docs/rest/overview" className="strafe-nav-pill">
                REST API
              </Link>
              <Link href="/docs/tools/permission-calculator" className="strafe-nav-pill">
                Tools
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href="https://app.strafe.chat/docs/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex strafe-nav-pill"
            >
              Strafe Platform Docs
            </a>
            <a
              href="https://github.com/strafe-js/strafe.js"
              target="_blank"
              rel="noreferrer"
              className="strafe-header-btn"
            >
              GitHub Repository
            </a>
          </div>
        </div>

        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden border-t border-[#2a303c] px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto"
        >
          <Link href="/docs" className="strafe-nav-pill shrink-0">
            SDK Docs
          </Link>
          <Link href="/docs/strafebot/client" className="strafe-nav-pill shrink-0">
            Client
          </Link>
          <Link href="/docs/commands/overview" className="strafe-nav-pill shrink-0">
            Commands
          </Link>
          <Link href="/docs/ws/overview" className="strafe-nav-pill shrink-0">
            Gateway
          </Link>
          <Link href="/docs/rest/overview" className="strafe-nav-pill shrink-0">
            REST
          </Link>
          <Link href="/docs/tools/permission-calculator" className="strafe-nav-pill shrink-0">
            Tools
          </Link>
        </nav>
      </header>

      <main className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 space-y-12">
        <section className="strafe-hero grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-5">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#e6e8ec] leading-tight">
              Strafe.js TypeScript SDK &amp; Protocol Reference ({SDK_VERSION_TAG})
            </h1>
            <p className="text-sm sm:text-base text-[#b4bac6] leading-relaxed">
              TypeScript monorepo for building bots and OAuth2 integrations on{' '}
              <a
                href="https://app.strafe.chat/docs/"
                target="_blank"
                rel="noreferrer"
                className="text-[#7fd19c] underline underline-offset-4 hover:text-white"
              >
                Strafe Chat
              </a>
              . Includes the HTTP REST client with automatic <code>429 Retry-After</code> backoff,
              the Stargate WebSocket Gateway client (opcodes <code>0..8</code>), the 6-stage Equinox
              permission resolver, and a typed prefix command framework.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/docs" className="strafe-btn-primary text-sm">
                Read SDK Documentation
              </Link>
              <Link href="/docs/guides/getting-started" className="strafe-btn-secondary text-sm">
                Scaffold a Bot Project
              </Link>
            </div>

            <div className="pt-2 space-y-2">
              <div className="text-xs font-mono text-[#949eb0]">
                Install the main bot framework or scaffold a project:
              </div>
              <div className="p-3 rounded-md bg-[#0b0d11] border border-[#2a303c] font-mono text-xs text-[#7fd19c] overflow-x-auto">
                npm install @strafe-js/strafebot &amp;&amp; npx create-strafebot my-bot
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 w-full min-w-0">
            <CodeWindow
              title="src/index.ts"
              lang="ts"
              className="!my-0"
              code={`import { Client, command } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: 'https://app.strafe.chat/api',
  gatewayUrl: 'wss://app.strafe.chat/gateway/events',
  prefix: '!',
});

client.commands.register(
  command({
    name: 'thread',
    description: 'Create a public thread from the command message',
    permissions: ['CreatePublicThreads'],
    botPermissions: ['CreatePublicThreads', 'AddReactions'],
    arguments: {
      name: { type: 'string', required: true },
    },
    async run(ctx) {
      const thread = await ctx.client.rest.createThreadFromMessage(
        ctx.roomId,
        ctx.message.id,
        { name: ctx.arguments.get('name') },
      );
      await ctx.client.rest.createMessage(thread.id, {
        plaintext: \`Thread opened by <@\${ctx.authorId}>\`,
      });
    },
  }),
);

await client.login(process.env.BOT_TOKEN!);`}
            />
          </div>
        </section>

        <section>
          <h2 className="strafe-section-heading">
            Guides &amp; Protocol Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOC_SECTIONS.map((item) => (
              <Link key={item.title} href={item.href} className="strafe-card flex flex-col justify-between">
                <div>
                  <div className="font-mono text-xs text-[#7fd19c] mb-1.5">
                    {item.route}
                  </div>
                  <h3 className="font-bold text-base text-[#e6e8ec] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b4bac6] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="strafe-section-heading">
            Monorepo Package Architecture ({SDK_VERSION_TAG})
          </h2>
          <div className="rounded-lg border border-[#2a303c] bg-[#161920] overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#2a303c] bg-[#12151b] text-[#b4bac6]">
                  <th className="py-3 px-4 font-mono">Package</th>
                  <th className="py-3 px-4 font-mono">Version</th>
                  <th className="py-3 px-4 font-mono hidden md:table-cell">Dependencies</th>
                  <th className="py-3 px-4">Responsibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a303c]">
                {PACKAGES.map((pkg) => (
                  <tr key={pkg.name} className="hover:bg-[#1a1e27] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      <Link href={pkg.href} className="text-[#7fd19c] hover:underline">
                        {pkg.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#949eb0] whitespace-nowrap">
                      {pkg.version}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#949eb0] hidden md:table-cell whitespace-nowrap">
                      {pkg.deps}
                    </td>
                    <td className="py-3 px-4 text-[#b4bac6]">
                      {pkg.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="strafe-section-heading">
            Interactive Protocol Workbenches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKBENCHES.map((tool) => (
              <Link key={tool.title} href={tool.href} className="strafe-card block">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-base text-[#e6e8ec]">
                    {tool.title}
                  </h3>
                  <span className="font-mono text-xs text-[#7fd19c] bg-[#0b0d11] px-2 py-0.5 rounded border border-[#2a303c]">
                    {tool.spec}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#b4bac6] leading-relaxed">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-6 px-4 border-t border-[#2a303c] text-center text-xs text-[#949eb0]">
        Strafe.js {SDK_VERSION_TAG} • Apache-2.0 License •{' '}
        <a
          href="https://app.strafe.chat/docs/"
          target="_blank"
          rel="noreferrer"
          className="text-[#7fd19c] hover:underline"
        >
          Strafe Chat Platform Docs
        </a>{' '}
        •{' '}
        <a
          href="https://github.com/strafe-js/strafe.js"
          target="_blank"
          rel="noreferrer"
          className="text-[#7fd19c] hover:underline"
        >
          GitHub Monorepo
        </a>
      </footer>
    </div>
  );
}
