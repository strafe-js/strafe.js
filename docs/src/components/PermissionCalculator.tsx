'use client';

import React, { useState } from 'react';
import { CodeWindow } from './CodeWindow';

export const PERMISSION_LIST = [
  { name: 'ViewRoom', shift: 0, bit: 1 << 0, group: 'General', desc: 'View rooms and read channel metadata' },
  { name: 'SendMessages', shift: 1, bit: 1 << 1, group: 'Text', desc: 'Post text messages in rooms' },
  { name: 'ReadMessageHistory', shift: 2, bit: 1 << 2, group: 'Text', desc: 'Fetch historical messages via GET /rooms/:id/messages' },
  { name: 'AddReactions', shift: 3, bit: 1 << 3, group: 'Text', desc: 'Add Unicode and custom emoji reactions' },
  { name: 'UseExternalEmojis', shift: 4, bit: 1 << 4, group: 'Text', desc: 'Use custom emojis from other spaces' },
  { name: 'MentionEveryone', shift: 5, bit: 1 << 5, group: 'Text', desc: 'Trigger @everyone and @here notifications (requires SendMessages)' },
  { name: 'ManageMessages', shift: 6, bit: 1 << 6, group: 'Moderation', desc: 'Delete other members messages and pin messages' },
  { name: 'ManageRoles', shift: 7, bit: 1 << 7, group: 'Moderation', desc: 'Create, edit, and assign space roles below own hierarchy' },
  { name: 'ManageRooms', shift: 8, bit: 1 << 8, group: 'Moderation', desc: 'Create, edit, and delete rooms and permission overrides' },
  { name: 'KickMembers', shift: 9, bit: 1 << 9, group: 'Moderation', desc: 'Remove members from the space via DELETE /spaces/:id/members/:uid' },
  { name: 'BanMembers', shift: 10, bit: 1 << 10, group: 'Moderation', desc: 'Ban and unban user accounts from the space' },
  { name: 'Administrator', shift: 11, bit: 1 << 11, group: 'Moderation', desc: 'Short-circuits Equinox stage 3 to ALL_PERMISSIONS (0x0FFFFFFF)' },
  { name: 'ManageSpace', shift: 12, bit: 1 << 12, group: 'Moderation', desc: 'Modify space name, icon, and configuration' },
  { name: 'CreateInvite', shift: 13, bit: 1 << 13, group: 'General', desc: 'Generate invite codes via POST /spaces/:id/invites' },
  { name: 'ManageEmojis', shift: 14, bit: 1 << 14, group: 'Moderation', desc: 'Upload, rename, and remove custom space emojis' },
  { name: 'Connect', shift: 15, bit: 1 << 15, group: 'Voice', desc: 'Join SpaceVoice rooms' },
  { name: 'Speak', shift: 16, bit: 1 << 16, group: 'Voice', desc: 'Transmit audio streams in voice rooms' },
  { name: 'Video', shift: 17, bit: 1 << 17, group: 'Voice', desc: 'Stream camera video and screen shares' },
  { name: 'MuteMembers', shift: 18, bit: 1 << 18, group: 'Voice', desc: 'Server-mute members in voice rooms' },
  { name: 'DeafenMembers', shift: 19, bit: 1 << 19, group: 'Voice', desc: 'Server-deafen members in voice rooms' },
  { name: 'MoveMembers', shift: 20, bit: 1 << 20, group: 'Voice', desc: 'Move connected members between voice rooms' },
  { name: 'UseVoiceActivity', shift: 21, bit: 1 << 21, group: 'Voice', desc: 'Speak without push-to-talk enforcement' },
  { name: 'PrioritySpeaker', shift: 22, bit: 1 << 22, group: 'Voice', desc: 'Attenuate other speakers audio when speaking' },
  { name: 'AttachFiles', shift: 23, bit: 1 << 23, group: 'Text', desc: 'Upload files via POST /attachments (requires SendMessages)' },
  { name: 'CreatePublicThreads', shift: 24, bit: 1 << 24, group: 'Threads', desc: 'Create public thread rooms (RoomType.Thread)' },
  { name: 'CreatePrivateThreads', shift: 25, bit: 1 << 25, group: 'Threads', desc: 'Create invite-only private thread rooms' },
  { name: 'SendMessagesInThreads', shift: 26, bit: 1 << 26, group: 'Threads', desc: 'Post messages inside active threads' },
  { name: 'ManageThreads', shift: 27, bit: 1 << 27, group: 'Threads', desc: 'Archive, lock, edit, and delete any thread' },
] as const;

const PRESETS = [
  { id: 'read_post', label: 'READ_AND_POST (7)', mask: 7 },
  {
    id: 'everyone',
    label: 'DEFAULT_EVERYONE (10723359)',
    mask: 10723359,
  },
  {
    id: 'mod',
    label: 'Moderator',
    mask:
      (1 << 0) |
      (1 << 1) |
      (1 << 2) |
      (1 << 3) |
      (1 << 6) |
      (1 << 9) |
      (1 << 10) |
      (1 << 13) |
      (1 << 18) |
      (1 << 23) |
      (1 << 27),
  },
  { id: 'admin', label: 'Administrator (1 << 11)', mask: 1 << 11 },
  { id: 'all', label: 'ALL_PERMISSIONS (0x0FFFFFFF)', mask: 0x0fffffff },
  { id: 'none', label: 'Zero (0)', mask: 0 },
] as const;

const GROUPS = ['General', 'Text', 'Threads', 'Voice', 'Moderation'] as const;

function BitMatrixIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#6ab585] shrink-0" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
      <rect x="6" y="6" width="3.2" height="3.2" rx="0.8" fill="currentColor" />
      <rect x="10.4" y="6" width="3.2" height="3.2" rx="0.8" fill="currentColor" fillOpacity="0.25" />
      <rect x="14.8" y="6" width="3.2" height="3.2" rx="0.8" fill="currentColor" />
      <rect x="6" y="10.4" width="3.2" height="3.2" rx="0.8" fill="currentColor" fillOpacity="0.25" />
      <rect x="10.4" y="10.4" width="3.2" height="3.2" rx="0.8" fill="currentColor" />
      <rect x="14.8" y="10.4" width="3.2" height="3.2" rx="0.8" fill="currentColor" />
      <rect x="6" y="14.8" width="3.2" height="3.2" rx="0.8" fill="currentColor" />
      <rect x="10.4" y="14.8" width="3.2" height="3.2" rx="0.8" fill="currentColor" fillOpacity="0.25" />
      <rect x="14.8" y="14.8" width="3.2" height="3.2" rx="0.8" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

function CheckVector({ checked }: { checked: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`w-4 h-4 shrink-0 mt-0.5 transition-all ${
        checked ? 'text-[#509b6b]' : 'text-[#363c48] group-hover:text-[#525b6d]'
      }`}
      aria-hidden="true"
    >
      <rect
        x="1.25"
        y="1.25"
        width="13.5"
        height="13.5"
        rx="3.25"
        fill={checked ? 'rgba(80, 155, 107, 0.18)' : '#0b0d11'}
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {checked && (
        <path
          d="M4.5 8.2L6.9 10.6L11.6 5.4"
          stroke="#7fd19c"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function PermissionCalculator() {
  const [mask, setMask] = useState<number>(10723359);
  const [hoveredBit, setHoveredBit] = useState<number | null>(null);

  const toggle = (bit: number) => setMask((prev) => prev ^ bit);

  const selectedPerms = PERMISSION_LIST.filter((p) => (mask & p.bit) === p.bit);
  const selectedNames = selectedPerms.map((p) => p.name);
  const hasAdmin = (mask & (1 << 11)) !== 0;
  const missingViewRoom = (mask & (1 << 0)) === 0 && !hasAdmin && mask !== 0;
  const missingSendWithDependents =
    (mask & (1 << 1)) === 0 &&
    !hasAdmin &&
    ((mask & (1 << 23)) !== 0 || (mask & (1 << 5)) !== 0);

  const hexValue = `0x${mask.toString(16).toUpperCase().padStart(7, '0')}`;
  const binaryValue = mask.toString(2).padStart(28, '0');

  const codeSnippet = `import { BitField, Permission } from '@strafe-js/util';
import { permissions } from '@strafe-js/builders';

// Decimal: ${mask} | Hex: ${hexValue} | Active bits: ${selectedNames.length}/28
export const roleMask = permissions([
${selectedNames.map((n) => `  '${n}',`).join('\n')}
]);

const bitfield = new BitField(roleMask);
console.log(bitfield.has(Permission.ViewRoom)); // ${(mask & (1 << 0)) !== 0 || hasAdmin}`;

  const hoveredPerm =
    hoveredBit !== null ? PERMISSION_LIST.find((p) => p.shift === hoveredBit) : null;

  return (
    <div className="my-6 rounded-xl border border-[#2a2f39] bg-[#12151b] shadow-[0_18px_42px_-12px_rgba(0,0,0,0.7),0_1px_0_0_rgba(255,255,255,0.04)_inset] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#161a22] border-b border-[#262b35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0d1015] border border-[#2a2f39] flex items-center justify-center shadow-inner">
            <BitMatrixIcon />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
                Equinox 28-Bit Permission Register
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#509b6b]/15 text-[#7fd19c] border border-[#509b6b]/30">
                bits 0..27
              </span>
            </div>
            <p className="text-xs text-[#8f98a8] !m-0 mt-0.5">
              Click any register cell or flag row to toggle bits and inspect Equinox cascade invariants.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((preset) => {
            const isCurrent = mask === preset.mask;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setMask(preset.mask)}
                className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#509b6b]/20 border-[#509b6b] text-[#7fd19c] shadow-[0_0_12px_-3px_rgba(80,155,107,0.4)]'
                    : preset.id === 'none'
                      ? 'bg-[#0d1015] border-[#262b35] text-[#8f98a8] hover:border-[#e25555]/50 hover:text-[#f28b8b]'
                      : 'bg-[#0d1015] border-[#262b35] text-[#b4bac6] hover:border-[#363c48] hover:text-[#e6e8ec]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 bg-[#0b0d11] border-b border-[#262b35]">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#7f8797] mb-2">
          <span>MSB (1 &lt;&lt; 27: ManageThreads)</span>
          <span className="text-[#7fd19c] font-semibold">
            {hoveredPerm
              ? `Bit ${hoveredPerm.shift} (1 << ${hoveredPerm.shift} = ${hoveredPerm.bit}): ${hoveredPerm.name}`
              : `0b${binaryValue}`}
          </span>
          <span>LSB (1 &lt;&lt; 0: ViewRoom)</span>
        </div>

        <div className="grid grid-cols-14 sm:grid-cols-28 gap-1">
          {[...PERMISSION_LIST].reverse().map((p) => {
            const active = (mask & p.bit) === p.bit;
            return (
              <button
                key={p.shift}
                type="button"
                onClick={() => toggle(p.bit)}
                onMouseEnter={() => setHoveredBit(p.shift)}
                onMouseLeave={() => setHoveredBit(null)}
                title={`${p.name} (1 << ${p.shift})`}
                className={`h-9 rounded flex flex-col items-center justify-center font-mono transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#509b6b]/25 border-[#509b6b] text-[#7fd19c] shadow-[0_0_10px_-2px_rgba(80,155,107,0.45)]'
                    : 'bg-[#12161d] border-[#222731] text-[#5c6474] hover:border-[#363c48] hover:text-[#b4bac6]'
                }`}
              >
                <span className="text-[11px] font-bold leading-none">{active ? '1' : '0'}</span>
                <span className="text-[8px] opacity-70 leading-none mt-1">{p.shift}</span>
              </button>
            );
          })}
        </div>

        {(hasAdmin || missingViewRoom || missingSendWithDependents) && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono">
            {hasAdmin && (
              <div className="px-2.5 py-1 rounded bg-[#509b6b]/15 border border-[#509b6b]/35 text-[#7fd19c]">
                Equinox Stage 3: Permission.Administrator (1 &lt;&lt; 11) grants ALL_PERMISSIONS (0x0FFFFFFF) in space and room checks.
              </div>
            )}
            {missingViewRoom && (
              <div className="px-2.5 py-1 rounded bg-[#e0a526]/12 border border-[#e0a526]/35 text-[#f0be52]">
                Equinox Stage 5: ViewRoom (1 &lt;&lt; 0) is unset; room permission resolution zeroes the effective room mask to 0.
              </div>
            )}
            {missingSendWithDependents && (
              <div className="px-2.5 py-1 rounded bg-[#4b8fe2]/12 border border-[#4b8fe2]/35 text-[#85b8f8]">
                Equinox Stage 6: SendMessages (1 &lt;&lt; 1) is unset; AttachFiles and MentionEveryone are cleared in room resolution.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GROUPS.map((group) => {
          const items = PERMISSION_LIST.filter((p) => p.group === group);
          const activeInGroup = items.filter((p) => (mask & p.bit) === p.bit).length;

          return (
            <div
              key={group}
              className="rounded-lg border border-[#252a34] bg-[#0e1116] overflow-hidden flex flex-col"
            >
              <div className="px-3.5 py-2.5 bg-[#141820] border-b border-[#252a34] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cfd5e0]">
                  {group}
                </span>
                <span className="font-mono text-[11px] text-[#7fd19c]">
                  {activeInGroup}/{items.length}
                </span>
              </div>

              <div className="p-2.5 space-y-1">
                {items.map((p) => {
                  const isChecked = (mask & p.bit) === p.bit;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => toggle(p.bit)}
                      className={`w-full text-left p-2 rounded-md flex items-start gap-2.5 transition-colors cursor-pointer group border ${
                        isChecked
                          ? 'bg-[#509b6b]/[0.09] border-[#509b6b]/30'
                          : 'bg-transparent border-transparent hover:bg-[#151922]'
                      }`}
                    >
                      <CheckVector checked={isChecked} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-mono text-xs font-semibold truncate ${
                              isChecked ? 'text-[#7fd19c]' : 'text-[#e6e8ec]'
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0b0d11] text-[#7f8797] border border-[#222731] shrink-0">
                            1 &lt;&lt; {p.shift}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8f98a8] leading-snug mt-0.5">
                          {p.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-[#0e1116] border-t border-[#262b35] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141820] border border-[#252a34] flex items-center justify-between">
            <span className="text-[#8f98a8] text-[11px] uppercase tracking-wider">Decimal Mask</span>
            <span className="font-bold text-[#7fd19c] text-sm">{mask}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141820] border border-[#252a34] flex items-center justify-between">
            <span className="text-[#8f98a8] text-[11px] uppercase tracking-wider">Hexadecimal</span>
            <span className="font-bold text-[#7fd19c] text-sm">{hexValue}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-lg bg-[#141820] border border-[#252a34] flex items-center justify-between">
            <span className="text-[#8f98a8] text-[11px] uppercase tracking-wider">Enabled Flags</span>
            <span className="font-bold text-[#7fd19c] text-sm">{selectedNames.length} / 28</span>
          </div>
        </div>

        <CodeWindow title="permissions.ts" lang="ts" code={codeSnippet} showLineNumbers />
      </div>
    </div>
  );
}
