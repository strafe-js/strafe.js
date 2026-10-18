'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { CodeWindow } from './CodeWindow';

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

export function PropertyTable({ title = 'Properties Reference', properties }: PropertyTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="my-6 rounded-lg border border-[#2a303c] bg-[#161920] overflow-hidden">
      {title && (
        <div className="px-4 py-3 bg-[#12151b] border-b border-[#2a303c] font-semibold text-sm text-[#e6e8ec] flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-mono text-[#949eb0]">{properties.length} fields</span>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="p-4 text-xs font-mono text-[#b4bac6]">
          No properties defined for this interface.
        </div>
      ) : (
        <div className="divide-y divide-[#2a303c] text-xs">
          {properties.map((prop) => {
            const isExp = !!expanded[prop.name];
            const hasExtra = Boolean(prop.example || prop.details);

            return (
              <div key={prop.name} className="transition-colors hover:bg-[#1a1e27]">
                {hasExtra ? (
                  <button
                    type="button"
                    aria-expanded={isExp}
                    onClick={() => toggle(prop.name)}
                    className="w-full p-3.5 min-h-[44px] flex flex-wrap items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#7fd19c] font-bold w-4 text-center" aria-hidden="true">
                        {isExp ? '−' : '+'}
                      </span>
                      <span className="font-bold text-[#7fd19c] text-sm">{prop.name}</span>
                      <span className="text-[#949eb0]">:</span>
                      <span className="text-[#f0be52] font-medium">{prop.type}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {prop.readonly && <Badge type="readonly">Readonly</Badge>}
                      {prop.optional && <Badge type="optional">Optional</Badge>}
                    </div>
                  </button>
                ) : (
                  <div className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#949eb0] w-4 text-center" aria-hidden="true">
                        •
                      </span>
                      <span className="font-bold text-[#7fd19c] text-sm">{prop.name}</span>
                      <span className="text-[#949eb0]">:</span>
                      <span className="text-[#f0be52] font-medium">{prop.type}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {prop.readonly && <Badge type="readonly">Readonly</Badge>}
                      {prop.optional && <Badge type="optional">Optional</Badge>}
                    </div>
                  </div>
                )}

                <div className="px-3.5 pb-3 text-[#e6e8ec] leading-relaxed">
                  {prop.description}
                </div>

                {isExp && hasExtra && (
                  <div className="mx-3.5 mb-3.5 p-3 rounded bg-[#0b0d11] border border-[#2a303c] space-y-2">
                    {prop.details && <p className="text-xs text-[#b4bac6]">{prop.details}</p>}
                    {prop.example && (
                      <CodeWindow
                        title={prop.name}
                        lang="ts"
                        code={prop.example}
                        showLineNumbers={false}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
