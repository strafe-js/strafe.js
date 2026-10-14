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
    <div className="my-6 rounded-xl border border-[#262b33] bg-[#15181d] overflow-hidden shadow-sm">
      {title && (
        <div className="px-4 py-3 bg-[#101317] border-b border-[#262b33] font-semibold text-sm text-[#f3f5f7] flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-normal text-[#9ba5b4]">{properties.length} properties</span>
        </div>
      )}

      <div className="divide-y divide-[#262b33]/70 text-xs">
        {properties.map((prop) => {
          const isExp = !!expanded[prop.name];

          return (
            <div key={prop.name} className="transition-colors hover:bg-[#101317]/60">
              <div
                className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => toggle(prop.name)}
              >
                <div className="flex items-center gap-2.5 font-mono">
                  <button className="text-[#9ba5b4]">
                    {isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <span className="font-bold text-[#6db888] text-sm">{prop.name}</span>
                  <span className="text-[#9ba5b4] font-normal">:</span>
                  <span className="text-amber-400 font-medium">{prop.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  {prop.readonly && <Badge type="readonly">Readonly</Badge>}
                  {prop.optional && <Badge type="optional">Optional</Badge>}
                </div>
              </div>

              <div className="px-3.5 pb-2.5 text-[#d4dbe3]">
                {prop.description}
              </div>

              {isExp && (prop.example || prop.details) && (
                <div className="mx-3.5 mb-3.5 p-3 rounded-lg bg-[#0d0f12] border border-[#262b33] space-y-2">
                  {prop.details && <p className="text-xs text-[#9ba5b4]">{prop.details}</p>}
                  {prop.example && (
                    <div>
                      <span className="font-semibold text-[#6db888] text-[11px] block uppercase mb-1">Example</span>
                      <pre className="p-2.5 rounded-md bg-[#15181d] text-[#6db888] font-mono text-[11px] overflow-x-auto">
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
