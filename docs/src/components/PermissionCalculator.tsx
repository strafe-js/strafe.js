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

export function PermissionCalculator() {
  const [mask, setMask] = useState<number>(10723359);
  const [focusedBit, setFocusedBit] = useState<number | null>(null);

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

export const roleMask = permissions([
${selectedNames.map((n) => `  '${n}',`).join('\n')}
]);

const bitfield = new BitField(roleMask);
console.log(bitfield.has(Permission.ViewRoom));`;

  const inspectedPerm =
    focusedBit !== null ? PERMISSION_LIST.find((p) => p.shift === focusedBit) : null;

  return (
    <div className="my-6 rounded-lg border border-[#2a303c] bg-[#161920] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#12151b] border-b border-[#2a303c] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
              Equinox 28-Bit Permission Register
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#0b0d11] text-[#7fd19c] border border-[#5c677a]">
              bits 0..27
            </span>
          </div>
          <p className="text-xs text-[#b4bac6] !m-0 mt-1">
            Toggle any register bit or permission flag row to compute the bitmask and inspect Equinox cascade rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((preset) => {
            const isCurrent = mask === preset.mask;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => setMask(preset.mask)}
                className={`px-3 py-1.5 min-h-[38px] rounded font-mono text-xs font-medium border transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#26613c] border-[#7fd19c] text-white'
                    : preset.id === 'none'
                      ? 'bg-[#0b0d11] border-[#5c677a] text-[#b4bac6] hover:border-[#f28b8b] hover:text-[#f28b8b]'
                      : 'bg-[#0b0d11] border-[#5c677a] text-[#e6e8ec] hover:border-[#7fd19c]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 bg-[#0b0d11] border-b border-[#2a303c]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#b4bac6] mb-3">
          <span>MSB (1 &lt;&lt; 27: ManageThreads)</span>
          <span className="text-[#7fd19c] font-semibold">
            {inspectedPerm
              ? `Bit ${inspectedPerm.shift} (1 << ${inspectedPerm.shift} = ${inspectedPerm.bit}): ${inspectedPerm.name}`
              : `0b${binaryValue}`}
          </span>
          <span>LSB (1 &lt;&lt; 0: ViewRoom)</span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-1">
          {[...PERMISSION_LIST].reverse().map((p) => {
            const active = (mask & p.bit) === p.bit;
            return (
              <button
                key={p.shift}
                type="button"
                aria-pressed={active}
                aria-label={`Bit ${p.shift}: ${p.name} (${active ? 'enabled' : 'disabled'})`}
                onClick={() => toggle(p.bit)}
                onMouseEnter={() => setFocusedBit(p.shift)}
                onMouseLeave={() => setFocusedBit(null)}
                onFocus={() => setFocusedBit(p.shift)}
                onBlur={() => setFocusedBit(null)}
                title={`${p.name} (1 << ${p.shift})`}
                className={`min-h-[44px] rounded flex flex-col items-center justify-center font-mono transition-colors cursor-pointer border ${
                  active
                    ? 'bg-[#26613c] border-[#7fd19c] text-white'
                    : 'bg-[#161920] border-[#5c677a] text-[#b4bac6] hover:border-[#7fd19c] hover:text-white'
                }`}
              >
                <span className="text-xs font-bold leading-none">{active ? '1' : '0'}</span>
                <span className="text-[10px] leading-none mt-1 text-[#cfd5e0]">{p.shift}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 space-y-2 text-xs font-mono">
          {mask === 0 && (
            <div className="px-3 py-2 rounded bg-[#161920] border border-[#5c677a] text-[#b4bac6]">
              [EMPTY MASK] No permissions selected (mask = 0). Select a preset above or toggle individual flags below.
            </div>
          )}
          {hasAdmin && (
            <div className="px-3 py-2 rounded bg-[#26613c]/30 border border-[#7fd19c] text-[#7fd19c]">
              [STAGE 3 SHORT-CIRCUIT] Permission.Administrator (1 &lt;&lt; 11) grants ALL_PERMISSIONS (0x0FFFFFFF) in space and room checks.
            </div>
          )}
          {missingViewRoom && (
            <div className="px-3 py-2 rounded bg-[#f0be52]/15 border border-[#f0be52] text-[#f0be52]">
              [STAGE 5 IMPLICIT DENIAL] ViewRoom (1 &lt;&lt; 0) is unset; room permission resolution zeroes the effective room mask to 0.
            </div>
          )}
          {missingSendWithDependents && (
            <div className="px-3 py-2 rounded bg-[#f0be52]/15 border border-[#f0be52] text-[#f0be52]">
              [STAGE 6 CASCADE] SendMessages (1 &lt;&lt; 1) is unset; AttachFiles and MentionEveryone are cleared during room resolution.
            </div>
          )}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GROUPS.map((group) => {
          const items = PERMISSION_LIST.filter((p) => p.group === group);
          const activeInGroup = items.filter((p) => (mask & p.bit) === p.bit).length;

          return (
            <div
              key={group}
              className="rounded-lg border border-[#2a303c] bg-[#0b0d11] overflow-hidden flex flex-col"
            >
              <div className="px-3.5 py-2.5 bg-[#12151b] border-b border-[#2a303c] flex items-center justify-between">
                <span className="text-xs font-bold text-[#e6e8ec]">
                  {group}
                </span>
                <span className="font-mono text-xs text-[#7fd19c]">
                  {activeInGroup}/{items.length} enabled
                </span>
              </div>

              <div className="p-2.5 space-y-1.5">
                {items.map((p) => {
                  const isChecked = (mask & p.bit) === p.bit;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      aria-pressed={isChecked}
                      onClick={() => toggle(p.bit)}
                      className={`w-full text-left p-2.5 min-h-[44px] rounded flex items-start gap-2.5 transition-colors cursor-pointer border ${
                        isChecked
                          ? 'bg-[#26613c]/25 border-[#7fd19c]'
                          : 'bg-[#161920] border-[#2a303c] hover:border-[#5c677a]'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                          isChecked
                            ? 'bg-[#26613c] border-[#7fd19c] text-white'
                            : 'bg-[#0b0d11] border-[#5c677a] text-[#b4bac6]'
                        }`}
                      >
                        {isChecked ? 'ON' : 'OFF'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-mono text-xs font-semibold truncate ${
                              isChecked ? 'text-[#7fd19c]' : 'text-[#e6e8ec]'
                            }`}
                          >
                            {p.name}
                          </span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#0b0d11] text-[#b4bac6] border border-[#2a303c] shrink-0">
                            1 &lt;&lt; {p.shift}
                          </span>
                        </div>
                        <div className="text-xs text-[#b4bac6] leading-snug mt-1">
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

      <div className="p-5 bg-[#0b0d11] border-t border-[#2a303c] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="px-3.5 py-2.5 rounded bg-[#161920] border border-[#2a303c] flex items-center justify-between">
            <span className="text-[#b4bac6]">Decimal Mask</span>
            <span className="font-bold text-[#7fd19c] text-sm">{mask}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded bg-[#161920] border border-[#2a303c] flex items-center justify-between">
            <span className="text-[#b4bac6]">Hexadecimal</span>
            <span className="font-bold text-[#7fd19c] text-sm">{hexValue}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded bg-[#161920] border border-[#2a303c] flex items-center justify-between">
            <span className="text-[#b4bac6]">Enabled Flags</span>
            <span className="font-bold text-[#7fd19c] text-sm">{selectedNames.length} / 28</span>
          </div>
        </div>

        <CodeWindow title="permissions.ts" lang="ts" code={codeSnippet} showLineNumbers />
      </div>
    </div>
  );
}
