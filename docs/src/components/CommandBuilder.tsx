'use client';

import React, { useState } from 'react';
import { Terminal, Plus, Trash2, Play, Sparkles } from 'lucide-react';
import { CodeWindow } from './CodeWindow';

interface ArgSchema {
  id: string;
  name: string;
  type: 'string' | 'integer' | 'number' | 'boolean' | 'user' | 'snowflake' | 'attachment';
  required: boolean;
  description: string;
}

export function CommandBuilder() {
  const [name, setName] = useState('ban');
  const [description, setDescription] = useState('Ban a member from the space');
  const [cooldown, setCooldown] = useState(5000);
  const [guildOnly, setGuildOnly] = useState(true);
  const [permissions, setPermissions] = useState<string[]>(['BanMembers']);
  const [args, setArgs] = useState<ArgSchema[]>([
    { id: '1', name: 'target', type: 'user', required: true, description: 'User ID or mention' },
    { id: '2', name: 'reason', type: 'string', required: false, description: 'Reason for ban' },
  ]);

  const [simInput, setSimInput] = useState('!ban <@123456789012345678> Repeated rule violations');
  const [simOutput, setSimOutput] = useState<string | null>(null);
  const [simError, setSimError] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const addArg = () =>
    setArgs((prev) => [
      ...prev,
      { id: String(Date.now()), name: `arg${prev.length + 1}`, type: 'string', required: false, description: '' },
    ]);
  const removeArg = (id: string) => setArgs((prev) => prev.filter((a) => a.id !== id));
  const updateArg = (id: string, field: keyof ArgSchema, val: any) =>
    setArgs((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: val } : a)));

  const permsString = permissions.length
    ? `  permissions: [${permissions.map((p) => `'${p}'`).join(', ')}],\n`
    : '';
  const guildString = guildOnly ? '  guildOnly: true,\n' : '';
  const cooldownString = cooldown ? `  cooldown: ${cooldown},\n` : '';
  const argsString = args.length
    ? `  arguments: {\n${args
        .map(
          (a) =>
            `    ${a.name}: { type: '${a.type}', required: ${a.required}${
              a.description ? `, description: '${a.description}'` : ''
            } }`
        )
        .join(',\n')}\n  },\n`
    : '';

  const runBodyString = args.length
    ? args.map((a) => `    const ${a.name} = ctx.arguments.get('${a.name}');`).join('\n') +
      '\n\n' +
      `    await ctx.reply(\`Action executed on \${${args[0]?.name || "'user'"}}\`);`
    : `    await ctx.reply('Command executed');`;

  const codeSnippet = `import { command } from '@strafe-js/strafebot';

export default command({
  name: '${name}',
  description: '${description}',
${permsString}${guildString}${cooldownString}${argsString}  async run(ctx) {
${runBodyString}
  },
});`;

  const runSimulation = () => {
    try {
      const parts = simInput.trim().split(/\s+/);
      const cmd = parts[0]?.replace(/^!/, '') || '';
      const rawArgs = parts.slice(1);

      if (cmd.toLowerCase() !== name.toLowerCase()) {
        setSimError(true);
        setSimOutput(`[Error]: Command name mismatch. Expected "!${name}", got "${parts[0]}"`);
        return;
      }

      const parsed: Record<string, any> = {};
      let tokenIdx = 0;

      for (const argDef of args) {
        const val = rawArgs[tokenIdx];
        if (argDef.required && (!val || val === '')) {
          setSimError(true);
          setSimOutput(`[ArgumentValidationError]: Missing required argument "${argDef.name}" (${argDef.type})`);
          return;
        }

        if (val) {
          if (argDef.type === 'user' || argDef.type === 'snowflake') {
            const match = /^<@!?(\d{16,20})>$/.exec(val);
            parsed[argDef.name] = match ? match[1] : val;
          } else if (argDef.type === 'integer' || argDef.type === 'number') {
            const num = Number(val);
            if (isNaN(num)) {
              setSimError(true);
              setSimOutput(`[ArgumentValidationError]: Argument "${argDef.name}" must be a number`);
              return;
            }
            parsed[argDef.name] = num;
          } else {
            parsed[argDef.name] = rawArgs.slice(tokenIdx).join(' ');
            break;
          }
          tokenIdx++;
        }
      }

      setSimError(false);
      setSimOutput(
        `[SUCCESS]: Command executed!\nParsed Arguments:\n${JSON.stringify(
          parsed,
          null,
          2
        )}\nResponse: "Action executed on ${parsed[args[0]?.name] || 'target'}"`
      );
    } catch (err: any) {
      setSimError(true);
      setSimOutput(`[Error]: ${err.message}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border border-[#2f3237] rounded-2xl bg-[#17191c] shadow-lg overflow-hidden text-[#f3f5f7]">
      <div className="p-6 bg-gradient-to-r from-[#509b6b]/10 via-[#26282c] to-[#101114] border-b border-[#2f3237]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#509b6b] text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f3f5f7]">
              Interactive Command Builder & Argument Tester
            </h3>
            <p className="text-xs text-[#aeb6c2]">
              Configure command metadata, build typed schemas, and test execution against live argument validation!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2f3237]">
        <div className="p-6 space-y-6 text-xs">
          <div className="space-y-4">
            <h4 className="font-bold text-[#509b6b] uppercase tracking-wider text-[11px]">
              Command Configuration
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#f3f5f7] mb-1">Command Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:ring-1 focus:ring-[#509b6b] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#f3f5f7] mb-1">Cooldown (ms)</label>
                <input
                  type="number"
                  value={cooldown}
                  onChange={(e) => setCooldown(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:ring-1 focus:ring-[#509b6b] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[#f3f5f7] mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#2f3237] bg-[#101114] text-[#f3f5f7] text-xs focus:ring-1 focus:ring-[#509b6b] outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guildOnly}
                  onChange={(e) => setGuildOnly(e.target.checked)}
                  className="rounded border-[#2f3237] text-[#509b6b]"
                />
                <span className="font-medium text-[#f3f5f7]">Space Only (guildOnly)</span>
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#2f3237]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#509b6b] uppercase tracking-wider text-[11px]">
                Arguments Schema ({args.length})
              </h4>
              <button
                onClick={addArg}
                className="px-2.5 py-1 rounded-lg bg-[#509b6b] hover:bg-[#45875d] text-white font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Argument
              </button>
            </div>
            <div className="space-y-3">
              {args.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl border border-[#2f3237] bg-[#101114] flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => updateArg(a.id, 'name', e.target.value)}
                    className="w-1/3 px-2 py-1 rounded border border-[#2f3237] bg-[#17191c] text-[#f3f5f7] font-mono text-xs"
                  />
                  <select
                    value={a.type}
                    onChange={(e) => updateArg(a.id, 'type', e.target.value)}
                    className="w-1/3 px-2 py-1 rounded border border-[#2f3237] bg-[#17191c] text-[#f3f5f7] font-mono text-xs"
                  >
                    <option value="string">string</option>
                    <option value="user">user</option>
                    <option value="snowflake">snowflake</option>
                    <option value="integer">integer</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="attachment">attachment</option>
                  </select>
                  <label className="flex items-center gap-1 ml-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={a.required}
                      onChange={(e) => updateArg(a.id, 'required', e.target.checked)}
                    />
                    <span className="text-[11px] text-[#aeb6c2]">Req</span>
                  </label>
                  <button onClick={() => removeArg(a.id)} className="p-1 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#101114] text-[#f3f5f7] flex flex-col justify-between space-y-6">
          <CodeWindow
            title={`src/commands/${name || 'command'}.ts`}
            lang="ts"
            code={codeSnippet}
            showLineNumbers
          />

          <div className="space-y-3 pt-4 border-t border-[#2f3237]">
            <span className="font-mono text-xs text-[#509b6b] font-bold uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Live Execution Tester
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#2f3237] bg-[#17191c] text-[#f3f5f7] font-mono text-xs outline-none focus:border-[#509b6b]"
              />
              <button
                onClick={runSimulation}
                className="px-3 py-1.5 rounded-lg bg-[#509b6b] hover:bg-[#45875d] text-white font-medium transition-colors flex items-center gap-1 text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Run
              </button>
            </div>
            {simOutput && (
              <pre
                className={`p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap border ${
                  simError ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#509b6b]/10 border-[#509b6b]/30 text-[#6db888]'
                }`}
              >
                <code>{simOutput}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
