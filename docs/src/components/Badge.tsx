'use client';

import React from 'react';

interface BadgeProps {
  type?: 'required' | 'optional' | 'readonly' | 'async' | 'event' | 'rest' | 'default' | 'tag';
  children: React.ReactNode;
}

export function Badge({ type = 'default', children }: BadgeProps) {
  const styles: Record<string, string> = {
    required: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    optional: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
    readonly: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    async: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    event: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rest: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    tag: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    default: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
        styles[type] || styles.default
      }`}
    >
      {children}
    </span>
  );
}
