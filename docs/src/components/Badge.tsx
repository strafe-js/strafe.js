'use client';

import React from 'react';

interface BadgeProps {
  type?: 'required' | 'optional' | 'readonly' | 'async' | 'event' | 'rest' | 'default' | 'tag';
  children: React.ReactNode;
}

export function Badge({ type = 'default', children }: BadgeProps) {
  const styles: Record<string, string> = {
    required: 'bg-[#f28b8b]/15 text-[#f28b8b] border-[#f28b8b]/40',
    optional: 'bg-[#161920] text-[#b4bac6] border-[#5c677a]',
    readonly: 'bg-[#f0be52]/15 text-[#f0be52] border-[#f0be52]/40',
    async: 'bg-[#26613c]/30 text-[#7fd19c] border-[#7fd19c]/50',
    event: 'bg-[#26613c]/30 text-[#7fd19c] border-[#7fd19c]/50',
    rest: 'bg-[#161920] text-[#e6e8ec] border-[#5c677a]',
    tag: 'bg-[#0b0d11] text-[#7fd19c] border-[#5c677a]',
    default: 'bg-[#161920] text-[#b4bac6] border-[#5c677a]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-medium border ${
        styles[type] || styles.default
      }`}
    >
      {children}
    </span>
  );
}
