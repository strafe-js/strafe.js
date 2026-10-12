import Link from 'next/link';
import { Shield, Zap, ArrowRight, Cpu, Wrench } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between bg-[#101114] text-[#f3f5f7]">
      <section className="relative overflow-hidden pt-24 pb-16 px-6 max-w-6xl mx-auto w-full text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
          <div className="w-[600px] h-[600px] bg-[#509b6b]/20 rounded-full blur-3xl" />
          <div className="w-[400px] h-[400px] bg-[#3f8a5a]/20 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#509b6b]/10 border border-[#509b6b]/20 text-[#509b6b] text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-[#509b6b]" /> Next-gen Strafe Chat Bot SDK
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f3f5f7] max-w-4xl mx-auto leading-tight">
          Build powerful bots on <span className="text-[#509b6b]">Strafe Chat</span> with TypeScript
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#aeb6c2] max-w-2xl mx-auto">
          Fully-typed monorepo suite containing REST API SDK, Gateway WebSocket client, state caching, permission engine, and CLI framework.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs"
            className="px-6 py-3 rounded-xl bg-[#509b6b] hover:bg-[#45875d] text-[#f5f9f7] font-bold text-sm transition-all shadow-lg shadow-[#509b6b]/20 flex items-center gap-2"
          >
            Read Documentation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs/tools/permission-calculator"
            className="px-6 py-3 rounded-xl bg-[#26282c] hover:bg-[#2e2e2e] text-[#f3f5f7] border border-[#2f3237] font-bold text-sm transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#509b6b]" /> Permission Calculator
          </Link>
        </div>

        {/* Code Snippet Banner */}
        <div className="mt-12 max-w-3xl mx-auto text-left rounded-2xl border border-[#2f3237] bg-[#17191c] p-6 shadow-2xl overflow-hidden font-mono text-xs text-[#f3f5f7]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2f3237] text-[#aeb6c2]">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[11px]">bot.ts — Strafe.js</span>
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
    name: 'ping',
    description: 'Replies with pong',
    async run(ctx) {
      await ctx.reply('pong');
    },
  })
);

await client.login(process.env.BOT_TOKEN!);`}</code>
          </pre>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full border-t border-[#2f3237]">
        <h2 className="text-2xl font-bold text-center mb-12 text-[#f3f5f7]">
          Why Engineers Choose Strafe.js
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-[#2f3237] bg-[#17191c]">
            <div className="p-3 rounded-xl bg-[#509b6b]/10 text-[#509b6b] w-fit mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#f3f5f7] mb-2">High Performance REST & WS</h3>
            <p className="text-xs text-[#aeb6c2] leading-relaxed">
              Automatic rate limit retry delays, exponential backoff, WebSocket heartbeats, and de-duplicated member fetches.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#2f3237] bg-[#17191c]">
            <div className="p-3 rounded-xl bg-[#509b6b]/10 text-[#509b6b] w-fit mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#f3f5f7] mb-2">Permission Guard Engine</h3>
            <p className="text-xs text-[#aeb6c2] leading-relaxed">
              Full equinox cascade calculations supporting role permissions, room overrides, administrator bits, and dependent rules.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[#2f3237] bg-[#17191c]">
            <div className="p-3 rounded-xl bg-[#509b6b]/10 text-[#509b6b] w-fit mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#f3f5f7] mb-2">Typed Command Schemas</h3>
            <p className="text-xs text-[#aeb6c2] leading-relaxed">
              Type-safe argument validation supporting strings, integers, floats, booleans, user mentions, snowflakes, and attachments.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#2f3237] text-center text-xs text-[#aeb6c2]">
        Released under Apache-2.0 License • Strafe.js Ecosystem
      </footer>
    </div>
  );
}
