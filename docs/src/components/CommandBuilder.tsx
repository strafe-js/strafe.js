'use client';

import React, { useState } from 'react';
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
        error: `Command prefix or name mismatch: expected "!${name}", received "${trigger || '(empty)'}"`,
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
    <div className="my-6 rounded-lg border border-[#2a303c] bg-[#161920] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#12151b] border-b border-[#2a303c] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
              Command Schema Designer &amp; Tokenizer
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#0b0d11] text-[#7fd19c] border border-[#5c677a]">
              command()
            </span>
          </div>
          <p className="text-xs text-[#b4bac6] !m-0 mt-1">
            Define prefix command guards, typed argument schemas, and test quote-aware argument parsing.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded bg-[#0b0d11] border border-[#5c677a] font-mono text-xs text-[#7fd19c]">
          {usageSignature}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2a303c]">
        <div className="p-5 space-y-5 text-xs">
          <div className="space-y-3.5">
            <div className="text-xs font-mono font-bold text-[#e6e8ec]">
              1. Metadata &amp; Execution Guards
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="cmd-name-input" className="block font-mono text-xs text-[#b4bac6] mb-1">
                  name
                </label>
                <input
                  id="cmd-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                />
              </div>
              <div>
                <label htmlFor="cmd-cooldown-input" className="block font-mono text-xs text-[#b4bac6] mb-1">
                  cooldown (ms)
                </label>
                <input
                  id="cmd-cooldown-input"
                  type="number"
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                  className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cmd-desc-input" className="block font-mono text-xs text-[#b4bac6] mb-1">
                description
              </label>
              <input
                id="cmd-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] text-xs focus:border-[#7fd19c]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                aria-pressed={guildOnly}
                onClick={() => setGuildOnly((v) => !v)}
                className={`px-3 py-2 min-h-[44px] rounded border font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  guildOnly
                    ? 'border-[#7fd19c] bg-[#26613c] text-white'
                    : 'border-[#5c677a] bg-[#0b0d11] text-[#b4bac6]'
                }`}
              >
                <span>guildOnly</span>
                <span>{guildOnly ? 'true' : 'false'}</span>
              </button>
              <button
                type="button"
                aria-pressed={botOwnerOnly}
                onClick={() => setBotOwnerOnly((v) => !v)}
                className={`px-3 py-2 min-h-[44px] rounded border font-mono text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  botOwnerOnly
                    ? 'border-[#7fd19c] bg-[#26613c] text-white'
                    : 'border-[#5c677a] bg-[#0b0d11] text-[#b4bac6]'
                }`}
              >
                <span>botOwnerOnly</span>
                <span>{botOwnerOnly ? 'true' : 'false'}</span>
              </button>
            </div>

            <div>
              <div className="block font-mono text-xs text-[#b4bac6] mb-1.5">
                Required Equinox Permissions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GUARD_PERMISSIONS.map((perm) => {
                  const active = permissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleGuardPerm(perm)}
                      className={`px-2.5 py-1.5 min-h-[38px] rounded font-mono text-xs border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#26613c] border-[#7fd19c] text-white'
                          : 'bg-[#0b0d11] border-[#5c677a] text-[#b4bac6] hover:border-[#7fd19c] hover:text-white'
                      }`}
                    >
                      {perm}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#2a303c]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#e6e8ec]">
                2. Arguments Schema ({args.length})
              </span>
              <button
                type="button"
                onClick={addArg}
                className="px-3 py-1.5 min-h-[38px] rounded bg-[#26613c] border border-[#7fd19c] hover:bg-[#1f5433] text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                + Add Argument Slot
              </button>
            </div>

            {args.length === 0 ? (
              <div className="p-3.5 rounded bg-[#0b0d11] border border-[#5c677a] font-mono text-xs text-[#b4bac6]">
                [EMPTY SCHEMA] No arguments configured. Click &quot;+ Add Argument Slot&quot; above to define positional command arguments.
              </div>
            ) : (
              <div className="space-y-2">
                {args.map((a, idx) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded border border-[#2a303c] bg-[#0b0d11] flex flex-wrap items-center gap-2"
                  >
                    <span className="font-mono text-xs text-[#949eb0] w-5 text-center">
                      #{idx}
                    </span>
                    <input
                      type="text"
                      aria-label={`Argument ${idx} name`}
                      value={a.name}
                      onChange={(e) => updateArg(a.id, 'name', e.target.value)}
                      className="w-28 px-2.5 py-1.5 min-h-[36px] rounded border border-[#5c677a] bg-[#161920] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                    />
                    <select
                      aria-label={`Argument ${idx} type`}
                      value={a.type}
                      onChange={(e) => updateArg(a.id, 'type', e.target.value)}
                      className="px-2.5 py-1.5 min-h-[36px] rounded border border-[#5c677a] bg-[#161920] text-[#7fd19c] font-mono text-xs focus:border-[#7fd19c]"
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
                      aria-pressed={a.required}
                      onClick={() => updateArg(a.id, 'required', !a.required)}
                      className={`ml-auto px-2.5 py-1.5 min-h-[36px] rounded font-mono text-xs border cursor-pointer transition-colors ${
                        a.required
                          ? 'bg-[#26613c] border-[#7fd19c] text-white'
                          : 'bg-[#161920] border-[#5c677a] text-[#b4bac6]'
                      }`}
                    >
                      {a.required ? 'required' : 'optional'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeArg(a.id)}
                      className="px-2.5 py-1.5 min-h-[36px] rounded border border-[#5c677a] bg-[#161920] text-[#b4bac6] hover:border-[#f28b8b] hover:text-[#f28b8b] font-mono text-xs transition-colors cursor-pointer"
                      aria-label={`Remove argument ${a.name}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-[#0b0d11] flex flex-col justify-between space-y-5">
          <CodeWindow
            title={`src/commands/${name || 'command'}.ts`}
            lang="ts"
            code={codeSnippet}
            showLineNumbers
          />

          <div className="space-y-3 pt-4 border-t border-[#2a303c]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#e6e8ec] font-bold">
                3. Tokenizer &amp; Validator Simulator
              </span>
              <span className="font-mono text-xs text-[#949eb0]">
                parseAndValidateArguments()
              </span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="text"
                aria-label="Sample chat message input"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 min-h-[44px] rounded border border-[#5c677a] bg-[#161920] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
              />
              <button
                type="button"
                onClick={runSimulation}
                className="px-4 py-2 min-h-[44px] rounded bg-[#26613c] hover:bg-[#1f5433] border border-[#7fd19c] text-white font-mono font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                Validate Input
              </button>
            </div>

            {!simResult ? (
              <div className="p-3.5 rounded border border-[#2a303c] bg-[#161920] font-mono text-xs text-[#b4bac6]">
                [READY] Enter a sample command invocation above and click &quot;Validate Input&quot; to inspect tokenized arguments and validation output.
              </div>
            ) : (
              <div
                className={`p-3.5 rounded border font-mono text-xs space-y-2 ${
                  simResult.ok
                    ? 'bg-[#26613c]/20 border-[#7fd19c] text-[#e6e8ec]'
                    : 'bg-[#f28b8b]/15 border-[#f28b8b] text-[#f28b8b]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className={simResult.ok ? 'text-[#7fd19c] font-bold' : 'text-[#f28b8b] font-bold'}>
                    {simResult.ok ? '[PASS] SCHEMA VALIDATED' : '[FAIL] VALIDATION REJECTED'}
                  </span>
                  <span className="text-[#b4bac6]">
                    tokens: [{simResult.tokens.map((t) => `"${t}"`).join(', ')}]
                  </span>
                </div>

                {simResult.ok ? (
                  <>
                    <div className="p-2.5 rounded bg-[#0b0d11] border border-[#2a303c] text-[#7fd19c] whitespace-pre-wrap">
                      {JSON.stringify(simResult.parsed, null, 2)}
                    </div>
                    <div className="text-xs text-[#b4bac6]">
                      ctx.reply: <span className="text-[#7fd19c]">&quot;{simResult.reply}&quot;</span>
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 rounded bg-[#0b0d11] border border-[#f28b8b]/50 text-[#f28b8b]">
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
