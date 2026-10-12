'use client';

import React, { useState } from 'react';
import { Copy, Check, Shield, Binary, Hash, Code2 } from 'lucide-react';

export const PERMISSION_LIST = [
  { name: 'ViewRoom', bit: 1 << 0, group: 'General', desc: 'Allows members to view channels/rooms' },
  { name: 'SendMessages', bit: 1 << 1, group: 'Text', desc: 'Allows sending text messages' },
  { name: 'ReadMessageHistory', bit: 1 << 2, group: 'Text', desc: 'Allows reading past message history' },
  { name: 'AddReactions', bit: 1 << 3, group: 'Text', desc: 'Allows adding emoji reactions' },
  { name: 'UseExternalEmojis', bit: 1 << 4, group: 'Text', desc: 'Allows using emojis from other spaces' },
  { name: 'MentionEveryone', bit: 1 << 5, group: 'Text', desc: 'Allows @everyone or @here mentions' },
  { name: 'ManageMessages', bit: 1 << 6, group: 'Moderation', desc: 'Allows deleting or pinning messages' },
  { name: 'ManageRoles', bit: 1 << 7, group: 'Moderation', desc: 'Allows managing space roles' },
  { name: 'ManageRooms', bit: 1 << 8, group: 'Moderation', desc: 'Allows creating, editing, deleting rooms' },
  { name: 'KickMembers', bit: 1 << 9, group: 'Moderation', desc: 'Allows kicking members from the space' },
  { name: 'BanMembers', bit: 1 << 10, group: 'Moderation', desc: 'Allows banning members from the space' },
  { name: 'Administrator', bit: 1 << 11, group: 'Moderation', desc: 'Grants all permissions implicitly' },
  { name: 'ManageSpace', bit: 1 << 12, group: 'Moderation', desc: 'Allows changing space settings' },
  { name: 'CreateInvite', bit: 1 << 13, group: 'General', desc: 'Allows creating space invite codes' },
  { name: 'ManageEmojis', bit: 1 << 14, group: 'Moderation', desc: 'Allows managing custom emojis' },
  { name: 'Connect', bit: 1 << 15, group: 'Voice', desc: 'Allows joining voice rooms' },
  { name: 'Speak', bit: 1 << 16, group: 'Voice', desc: 'Allows speaking in voice rooms' },
  { name: 'Video', bit: 1 << 17, group: 'Voice', desc: 'Allows sharing video/screen' },
  { name: 'MuteMembers', bit: 1 << 18, group: 'Voice', desc: 'Allows muting members in voice rooms' },
  { name: 'DeafenMembers', bit: 1 << 19, group: 'Voice', desc: 'Allows deafening members in voice' },
  { name: 'MoveMembers', bit: 1 << 20, group: 'Voice', desc: 'Allows moving members between voice rooms' },
  { name: 'UseVoiceActivity', bit: 1 << 21, group: 'Voice', desc: 'Allows voice activity detection' },
  { name: 'PrioritySpeaker', bit: 1 << 22, group: 'Voice', desc: 'Allows priority speaker mode' },
  { name: 'AttachFiles', bit: 1 << 23, group: 'Text', desc: 'Allows uploading attachments/files' },
  { name: 'CreatePublicThreads', bit: 1 << 24, group: 'Threads', desc: 'Allows creating public threads' },
  { name: 'CreatePrivateThreads', bit: 1 << 25, group: 'Threads', desc: 'Allows creating private threads' },
  { name: 'SendMessagesInThreads', bit: 1 << 26, group: 'Threads', desc: 'Allows sending messages in threads' },
  { name: 'ManageThreads', bit: 1 << 27, group: 'Threads', desc: 'Allows deleting or managing threads' },
] as const;

export function PermissionCalculator() {
  const [mask, setMask] = useState<number>(
    (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 15) | (1 << 16)
  );
  const [copied, setCopied] = useState(false);

  const toggle = (bit: number) => setMask((prev) => prev ^ bit);

  const selectedNames = PERMISSION_LIST.filter((p) => (mask & p.bit) === p.bit).map((p) => p.name);

  const setPreset = (preset: 'all' | 'none' | 'member' | 'mod' | 'admin') => {
    if (preset === 'all') setMask(PERMISSION_LIST.reduce((acc, p) => acc | p.bit, 0));
    else if (preset === 'none') setMask(0);
    else if (preset === 'member') setMask((1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 13) | (1 << 15) | (1 << 16) | (1 << 21) | (1 << 23));
    else if (preset === 'mod') setMask((1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 6) | (1 << 9) | (1 << 13) | (1 << 15) | (1 << 16) | (1 << 18) | (1 << 23) | (1 << 27));
    else if (preset === 'admin') setMask(1 << 11);
  };

  const codeSnippet = `import { permissions } from '@strafe-js/builders';

// Permission Bitfield Value: ${mask} (0x${mask.toString(16)})
const requiredPermissions = permissions([
${selectedNames.map((n) => `  '${n}',`).join('
')}
]);`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groups = ['General', 'Text', 'Voice', 'Moderation', 'Threads'] as const;

  return (
    <div className="my-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/80 shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-purple-500/10 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500 text-white shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Interactive Permission Bitfield Calculator
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Toggle Strafe permissions to instantly calculate integer masks, binary bits, and generate code snippets.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 mr-2">Presets:</span>
          <button onClick={() => setPreset('member')} className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-sky-500 hover:text-white transition-colors">Basic Member</button>
          <button onClick={() => setPreset('mod')} className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-sky-500 hover:text-white transition-colors">Moderator</button>
          <button onClick={() => setPreset('admin')} className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-sky-500 hover:text-white transition-colors">Administrator</button>
          <button onClick={() => setPreset('all')} className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-sky-500 hover:text-white transition-colors">Select All</button>
          <button onClick={() => setPreset('none')} className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500 hover:text-white transition-colors">Clear All</button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const items = PERMISSION_LIST.filter((p) => p.group === group);
          return (
            <div key={group} className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">{group} Permissions</h4>
              <div className="space-y-2.5">
                {items.map((p) => {
                  const isChecked = (mask & p.bit) === p.bit;
                  return (
                    <label key={p.name} className="flex items-start gap-2.5 cursor-pointer select-none group text-xs">
                      <input type="checkbox" checked={isChecked} onChange={() => toggle(p.bit)} className="mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500" />
                      <div>
                        <div className={`font-mono font-semibold transition-colors ${isChecked ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{p.name}</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-zinc-950 text-zinc-100 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"><span className="text-zinc-400 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-sky-400" /> Mask Decimal</span><span className="font-bold text-sky-400 text-sm">{mask}</span></div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"><span className="text-zinc-400 flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-purple-400" /> Hex Value</span><span className="font-bold text-purple-400 text-sm">0x{mask.toString(16).toUpperCase()}</span></div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"><span className="text-zinc-400 flex items-center gap-1.5"><Binary className="w-3.5 h-3.5 text-emerald-400" /> Active Bits</span><span className="font-bold text-emerald-400 text-sm">{selectedNames.length} / 28</span></div>
        </div>

        <div className="relative group">
          <button onClick={copyCode} className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 z-10">{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? 'Copied Code' : 'Copy Snippet'}</span></button>
          <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed"><code>{codeSnippet}</code></pre>
        </div>
      </div>
    </div>
  );
}
