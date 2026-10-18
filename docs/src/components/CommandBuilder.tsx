'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CodeWindow } from './CodeWindow';

interface ArgSchema {
  id: string;
  name: string;
  type: 'string' | 'integer' | 'number' | 'boolean' | 'user' | 'snowflake' | 'attachment';
  required: boolean;
  description: string;
}

const GUARD_PERMISSIONS = [
  'BanMembers',
  'KickMembers',
  'ManageMessages',
  'ManageRooms',
  'ManageRoles',
  'ManageThreads',
  'Administrator',
] as const;

function CommandAstSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#6ab585] shrink-0" aria-hidden="true">
      <rect x="2.5" y="3.5" width="19" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
      <path
        d="M6.5 9.5L9.5 12L6.5 14.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 14.5H16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="17" cy="8.5" r="1.25" fill="currentColor" />
      <circle cx="13.5" cy="8.5" r="1.25" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

export function CommandBuilder() {
  const [name, setName] = useState('ban');
  const [description, setDescription] = useState('Ban a member from the space');
  const [cooldown, setCooldown] = useState(5000);
  const [guildOnly, setGuildOnly] = useState(true);
  const [botOwnerOnly, setBotOwnerOnly] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(['BanMembers']);
  const [args, setArgs] = useState<ArgSchema[]>([
    { id: '1', name: 'target', type: 'user', required: true, description: 'User ID or mention' },
    { id: '2', name: 'reason', type: 'string', required: false, description: 'Audit reason' },
  ]);

  const [simInput, setSimInput] = useState('!ban <@123456789012345678> Repeated spam in #general');
  const [simResult, setSimResult] = useState<{
    ok: boolean;
    tokens: string[];
    parsed?: Record<string, unknown>;
    error?: string;
    reply?: string;
  } | null>(null);

  const toggleGuardPerm = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const addArg = () =>
    setArgs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `arg${prev.length + 1}`,
        type: 'string',
        required: false,
        description: '',
      },
    ]);

  const removeArg = (id: string) => setArgs((prev) => prev.filter((a) => a.id !== id));

  const updateArg = (id: string, field: keyof ArgSchema, val: string | boolean) =>
    setArgs((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));

  const permsString = permissions.length
    ? `  permissions: [${permissions.map((p) => `'${p}'`).join(', ')}],\n`
    : '';
  const botPermsString = permissions.length
    ? `  botPermissions: [${permissions.map((p) => `'${p}'`).join(', ')}],\n`
    : '';
  const guildString = guildOnly ? '  guildOnly: true,\n' : '';
  const ownerString = botOwnerOnly ? '  botOwnerOnly: true,\n' : '';
  const cooldownString = cooldown > 0 ? `  cooldown: ${cooldown},\n` : '';
  const argsString = args.length
    ? `  arguments: {\n${args
        .map(
          (a) =>
            `    ${a.name}: { type: '${a.type}', required: ${a.required}${
              a.description ? `, description: '${a.description}'` : ''
            } }`,
        )
        .join(',\n')}\n  },\n`
    : '';

  const runBodyString = args.length
    ? args.map((a) => `    const ${a.name} = ctx.arguments.get('${a.name}');`).join('\n') +
      '\n\n' +
      `    await ctx.reply(\`Executed ${name} on \${${args[0]?.name || "'target'"}}\`);`
    : `    await ctx.reply('Executed ${name}');`;

  const codeSnippet = `import { command } from '@strafe-js/strafebot';

export default command({
  name: '${name}',
  description: '${description}',
${permsString}${botPermsString}${guildString}${ownerString}${cooldownString}${argsString}  async run(ctx) {
${runBodyString}
  },
});`;

  const tokenizeSimInput = (raw: string): string[] => {
    const tokens: string[] = [];
    let current = '';
    let quote: '"' | "'" | null = null;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i]!;
      if (quote) {
        if (ch === quote) quote = null;
        else current += ch;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (/\s/.test(ch)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  };

  const runSimulation = () => {
    const allTokens = tokenizeSimInput(simInput.trim());
    const trigger = allTokens[0] || '';
    const cmd = trigger.replace(/^!/, '');
    const rawArgs = allTokens.slice(1);

    if (!trigger.startsWith('!') || cmd.toLowerCase() !== name.toLowerCase()) {
      setSimResult({
        ok: false,
        tokens: rawArgs,
        error: `Command prefix/name mismatch: expected "!${name}", received "${trigger || '(empty)'}"`,
      });
      return;
    }

    const parsed: Record<string, unknown> = {};
    let tokenIdx = 0;

    for (let i = 0; i < args.length; i++) {
      const argDef = args[i]!;
      const isLast = i === args.length - 1;
      const val =
        isLast && argDef.type === 'string' && rawArgs.length > tokenIdx
          ? rawArgs.slice(tokenIdx).join(' ')
          : rawArgs[tokenIdx];

      if (argDef.required && (val === undefined || val === '')) {
        setSimResult({
          ok: false,
          tokens: rawArgs,
          error: `ArgumentValidationError [${argDef.name}]: Missing required argument "${argDef.name}" (${argDef.type})`,
        });
        return;
      }

      if (val !== undefined && val !== '') {
        if (argDef.type === 'user' || argDef.type === 'snowflake') {
          const match = /^<@!?(\d{16,20})>$/.exec(val) || /^(\d{16,20})$/.exec(val);
          if (!match) {
            setSimResult({
              ok: false,
              tokens: rawArgs,
              error: `ArgumentValidationError [${argDef.name}]: Expected valid Snowflake ID or <@id> mention, got "${val}"`,
            });
            return;
          }
          parsed[argDef.name] = match[1];
        } else if (argDef.type === 'integer') {
          const n = Number(val);
          if (!Number.isInteger(n)) {
            setSimResult({
              ok: false,
              tokens: rawArgs,
              error: `ArgumentValidationError [${argDef.name}]: Expected integer for "${argDef.name}", got "${val}"`,
            });
            return;
          }
          parsed[argDef.name] = n;
        } else if (argDef.type === 'number') {
          const n = Number(val);
          if (Number.isNaN(n)) {
            setSimResult({
              ok: false,
              tokens: rawArgs,
              error: `ArgumentValidationError [${argDef.name}]: Expected number for "${argDef.name}", got "${val}"`,
            });
            return;
          }
          parsed[argDef.name] = n;
        } else if (argDef.type === 'boolean') {
          const lower = val.toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
            setSimResult({
              ok: false,
              tokens: rawArgs,
              error: `ArgumentValidationError [${argDef.name}]: Expected boolean (true/false/yes/no/1/0), got "${val}"`,
            });
            return;
          }
          parsed[argDef.name] = ['true', '1', 'yes'].includes(lower);
        } else {
          parsed[argDef.name] = val;
        }
        tokenIdx++;
      }
    }

    setSimResult({
      ok: true,
      tokens: rawArgs,
      parsed,
      reply: `Executed ${name} on ${String(parsed[args[0]?.name ?? ''] ?? 'target')}`,
    });
  };

  const usageSignature = `!${name || 'cmd'} ${args
    .map((a) => (a.required ? `<${a.name}:${a.type}>` : `[${a.name}:${a.type}]`))
    .join(' ')}`.trim();

  return (
    <div className="my-6 rounded-xl border border-[#2a2f39] bg-[#12151b] shadow-[0_18px_42px_-12px_rgba(0,0,0,0.7),0_1px_0_0_rgba(255,255,255,0.04)_inset] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#161a22] border-b border-[#262b35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0d1015] border border-[#2a2f39] flex items-center justify-center shadow-inner">
            <CommandAstSvg />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
                Command Schema Designer & Tokenizer
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#509b6b]/15 text-[#7fd19c] border border-[#509b6b]/30">
                command()
              </span>
            </div>
            <p className="text-xs text-[#8f98a8] !m-0 mt-0.5">
              Define prefix command guards, typed argument schemas, and test quote-aware argument parsing.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#0b0d11] border border-[#252a34] font-mono text-xs text-[#7fd19c]">
          {usageSignature}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#262b35]">
        <div className="p-5 space-y-5 text-xs">
          <div className="space-y-3.5">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8f98a8]">
              1. Metadata & Execution Guards
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                  name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                  cooldown (ms)
                </label>
                <input
                  type="number"
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] text-xs focus:border-[#509b6b] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGuildOnly((v) => !v)}
                className={`px-3 py-2 rounded-lg border font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  guildOnly
                    ? 'border-[#509b6b] bg-[#509b6b]/15 text-[#7fd19c]'
                    : 'border-[#252a34] bg-[#0b0d11] text-[#8f98a8]'
                }`}
              >
                <span>guildOnly</span>
                <span className="text-[10px]">{guildOnly ? 'true' : 'false'}</span>
              </button>
              <button
                type="button"
                onClick={() => setBotOwnerOnly((v) => !v)}
                className={`px-3 py-2 rounded-lg border font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  botOwnerOnly
                    ? 'border-[#509b6b] bg-[#509b6b]/15 text-[#7fd19c]'
                    : 'border-[#252a34] bg-[#0b0d11] text-[#8f98a8]'
                }`}
              >
                <span>botOwnerOnly</span>
                <span className="text-[10px]">{botOwnerOnly ? 'true' : 'false'}</span>
              </button>
            </div>

            <div>
              <label className="block font-mono text-[11px] text-[#8f98a8] mb-1.5">
                Required Equinox Permissions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GUARD_PERMISSIONS.map((perm) => {
                  const active = permissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      onClick={() => toggleGuardPerm(perm)}
                      className={`px-2 py-1 rounded font-mono text-[11px] border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#509b6b]/18 border-[#509b6b] text-[#7fd19c]'
                          : 'bg-[#0b0d11] border-[#252a34] text-[#8f98a8] hover:border-[#363c48]'
                      }`}
                    >
                      {perm}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#252a34]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8f98a8]">
                2. Arguments Schema ({args.length})
              </span>
              <button
                type="button"
                onClick={addArg}
                className="px-2.5 py-1 rounded-md bg-[#181c24] border border-[#2a2f39] hover:border-[#509b6b] text-[#7fd19c] font-mono text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>

            <div className="space-y-2">
              {args.map((a, idx) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-lg border border-[#252a34] bg-[#0b0d11] flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-[#5c6474] w-4 text-center">
                    #{idx}
                  </span>
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => updateArg(a.id, 'name', e.target.value)}
                    className="w-28 px-2 py-1 rounded border border-[#222731] bg-[#141820] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                  />
                  <select
                    value={a.type}
                    onChange={(e) => updateArg(a.id, 'type', e.target.value)}
                    className="px-2 py-1 rounded border border-[#222731] bg-[#141820] text-[#7fd19c] font-mono text-xs focus:border-[#509b6b] outline-none"
                  >
                    <option value="string">string</option>
                    <option value="user">user</option>
                    <option value="snowflake">snowflake</option>
                    <option value="integer">integer</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="attachment">attachment</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => updateArg(a.id, 'required', !a.required)}
                    className={`ml-auto px-2 py-1 rounded font-mono text-[10px] border cursor-pointer transition-colors ${
                      a.required
                        ? 'bg-[#509b6b]/15 border-[#509b6b]/40 text-[#7fd19c]'
                        : 'bg-[#141820] border-[#222731] text-[#7f8797]'
                    }`}
                  >
                    {a.required ? 'required' : 'optional'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeArg(a.id)}
                    className="p-1 text-[#7f8797] hover:text-[#e25555] transition-colors cursor-pointer"
                    title="Remove argument"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#0e1116] flex flex-col justify-between space-y-5">
          <CodeWindow
            title={`src/commands/${name || 'command'}.ts`}
            lang="ts"
            code={codeSnippet}
            showLineNumbers
          />

          <div className="space-y-3 pt-4 border-t border-[#252a34]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#8f98a8] font-bold uppercase tracking-wider">
                3. Tokenizer & Validator Simulator
              </span>
              <span className="font-mono text-[10px] text-[#6b7385]">
                parseAndValidateArguments()
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs outline-none focus:border-[#509b6b]"
              />
              <button
                type="button"
                onClick={runSimulation}
                className="px-4 py-2 rounded-lg bg-[#509b6b] hover:bg-[#45875d] text-white font-mono font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                Validate
              </button>
            </div>

            {simResult && (
              <div
                className={`p-3.5 rounded-lg border font-mono text-xs space-y-2 ${
                  simResult.ok
                    ? 'bg-[#509b6b]/[0.08] border-[#509b6b]/35 text-[#cfd5e0]'
                    : 'bg-[#e25555]/[0.08] border-[#e25555]/35 text-[#f28b8b]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className={simResult.ok ? 'text-[#7fd19c] font-bold' : 'text-[#f28b8b] font-bold'}>
                    {simResult.ok ? 'STATUS: VALIDATED' : 'STATUS: REJECTED'}
                  </span>
                  <span className="text-[#8f98a8]">
                    tokens: [{simResult.tokens.map((t) => `"${t}"`).join(', ')}]
                  </span>
                </div>

                {simResult.ok ? (
                  <>
                    <div className="p-2.5 rounded bg-[#0b0d11] border border-[#222731] text-[#7fd19c] whitespace-pre-wrap">
                      {JSON.stringify(simResult.parsed, null, 2)}
                    </div>
                    <div className="text-[11px] text-[#b4bac6]">
                      ctx.reply -&gt; <span className="text-[#7fd19c]">&quot;{simResult.reply}&quot;</span>
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 rounded bg-[#0b0d11] border border-[#e25555]/25 text-[#f28b8b]">
                    {simResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
