'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface PropertyItem {
  name: string;
  type: string;
  readonly?: boolean;
  optional?: boolean;
  description: string;
  example?: string;
  details?: string;
}

export interface PropertyTableProps {
  title?: string;
  properties: PropertyItem[];
}

export function PropertyTable({ title = 'Properties Overview', properties }: PropertyTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="my-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm">
      {title && (
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-sm text-zinc-700 dark:text-zinc-200 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-normal text-zinc-400">{properties.length} properties</span>
        </div>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
        {properties.map((prop) => {
          const isExp = !!expanded[prop.name];

          return (
            <div key={prop.name} className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
              <div
                className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => toggle(prop.name)}
              >
                <div className="flex items-center gap-2.5 font-mono">
                  <button className="text-zinc-400">
                    {isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">{prop.name}</span>
                  <span className="text-zinc-400 font-normal">:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">{prop.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  {prop.readonly && <Badge type="readonly">Readonly</Badge>}
                  {prop.optional && <Badge type="optional">Optional</Badge>}
                </div>
              </div>

              <div className="px-3.5 pb-2 text-zinc-600 dark:text-zinc-300">
                {prop.description}
              </div>

              {isExp && (
                <div className="mx-3.5 mb-3.5 p-3 rounded-lg bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                  {prop.example && (
                    <div>
                      <span className="font-semibold text-zinc-500 text-[11px] block uppercase mb-1">Example</span>
                      <pre className="p-2.5 rounded-md bg-zinc-900 text-sky-300 font-mono text-[11px] overflow-x-auto">
                        <code>{prop.example}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
