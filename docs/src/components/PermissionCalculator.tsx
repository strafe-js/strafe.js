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

  const codeSnippet = `import { permissions } from '@strafe-js/builders';\n\n// Permission Bitfield Value: ${mask} (0x${mask.toString(16)})\nconst requiredPermissions = permissions([\n${selectedNames.map((n) => `  '${n}',`).join('\n')}\n]);`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groups = ['General', 'Text', 'Voice', 'Moderation', 'Threads'] as const;

  return (
    <div className="my-8 border border-[#2f3237] rounded-2xl bg-[#17191c] shadow-lg overflow-hidden text-[#f3f5f7]">
      <div className="p-6 bg-gradient-to-r from-[#509b6b]/10 via-[#26282c] to-[#101114] border-b border-[#2f3237]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#509b6b] text-white shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#f3f5f7]">
              Interactive Permission Bitfield Calculator
            </h3>
            <p className="text-xs text-[#aeb6c2]">
              Toggle Strafe permissions to instantly calculate integer masks, binary bits, and generate code snippets.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#aeb6c2] mr-2">Presets:</span>
          <button onClick={() => setPreset('member')} className="px-2.5 py-1 text-xs rounded-lg bg-[#26282c] text-[#f3f5f7] hover:bg-[#509b6b] hover:text-white transition-colors">Basic Member</button>
          <button onClick={() => setPreset('mod')} className="px-2.5 py-1 text-xs rounded-lg bg-[#26282c] text-[#f3f5f7] hover:bg-[#509b6b] hover:text-white transition-colors">Moderator</button>
          <button onClick={() => setPreset('admin')} className="px-2.5 py-1 text-xs rounded-lg bg-[#26282c] text-[#f3f5f7] hover:bg-[#509b6b] hover:text-white transition-colors">Administrator</button>
          <button onClick={() => setPreset('all')} className="px-2.5 py-1 text-xs rounded-lg bg-[#26282c] text-[#f3f5f7] hover:bg-[#509b6b] hover:text-white transition-colors">Select All</button>
          <button onClick={() => setPreset('none')} className="px-2.5 py-1 text-xs rounded-lg bg-[#26282c] text-[#f3f5f7] hover:bg-red-500 hover:text-white transition-colors">Clear All</button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const items = PERMISSION_LIST.filter((p) => p.group === group);
          return (
            <div key={group} className="p-4 rounded-xl border border-[#2f3237] bg-[#101114]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#509b6b] mb-3 pb-1 border-b border-[#2f3237]">{group} Permissions</h4>
              <div className="space-y-2.5">
                {items.map((p) => {
                  const isChecked = (mask & p.bit) === p.bit;
                  return (
                    <label key={p.name} className="flex items-start gap-2.5 cursor-pointer select-none group text-xs">
                      <input type="checkbox" checked={isChecked} onChange={() => toggle(p.bit)} className="mt-0.5 rounded border-[#2f3237] text-[#509b6b] focus:ring-[#57a875]" />
                      <div>
                        <div className={`font-mono font-semibold transition-colors ${isChecked ? 'text-[#509b6b]' : 'text-[#f3f5f7]'}`}>{p.name}</div>
                        <div className="text-[11px] text-[#aeb6c2]">{p.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-[#101114] text-[#f3f5f7] border-t border-[#2f3237] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#17191c] border border-[#2f3237] flex items-center justify-between"><span className="text-[#aeb6c2] flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-[#509b6b]" /> Mask Decimal</span><span className="font-bold text-[#509b6b] text-sm">{mask}</span></div>
          <div className="p-3 rounded-xl bg-[#17191c] border border-[#2f3237] flex items-center justify-between"><span className="text-[#aeb6c2] flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-[#509b6b]" /> Hex Value</span><span className="font-bold text-[#509b6b] text-sm">0x{mask.toString(16).toUpperCase()}</span></div>
          <div className="p-3 rounded-xl bg-[#17191c] border border-[#2f3237] flex items-center justify-between"><span className="text-[#aeb6c2] flex items-center gap-1.5"><Binary className="w-3.5 h-3.5 text-[#509b6b]" /> Active Bits</span><span className="font-bold text-[#509b6b] text-sm">{selectedNames.length} / 28</span></div>
        </div>

        <div className="relative group">
          <button onClick={copyCode} className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#26282c] text-[#f3f5f7] hover:bg-[#2e2e2e] transition-colors text-xs flex items-center gap-1.5 z-10">{copied ? <Check className="w-3.5 h-3.5 text-[#509b6b]" /> : <Copy className="w-3.5 h-3.5" />}<span>{copied ? 'Copied Code' : 'Copy Snippet'}</span></button>
          <pre className="p-4 rounded-xl bg-[#17191c] border border-[#2f3237] font-mono text-xs text-[#6db888] overflow-x-auto leading-relaxed"><code>{codeSnippet}</code></pre>
        </div>
      </div>
    </div>
  );
}
