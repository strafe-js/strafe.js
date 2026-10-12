import Link from 'next/link';
import { Shield, Zap, ArrowRight, Cpu, Wrench } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <section className="relative overflow-hidden pt-24 pb-16 px-6 max-w-6xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" /> Next-gen Strafe Chat Bot SDK
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Build powerful bots on <span className="bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent">Strafe Chat</span> with TypeScript
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Fully-typed monorepo suite containing REST API SDK, Gateway WebSocket client, state caching, permission engine, and CLI framework.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/docs" className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2">
            Read Documentation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/docs/tools/permission-calculator" className="px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-sm transition-all flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-500" /> Permission Calculator
          </Link>
        </div>
      </section>
      <footer className="py-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
        Released under Apache-2.0 License • Strafe.js Ecosystem
      </footer>
    </div>
  );
}
