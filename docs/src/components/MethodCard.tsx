'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { CodeWindow } from './CodeWindow';

export interface ParamDef {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
  details?: string;
}

export interface MethodCardProps {
  name: string;
  signature: string;
  returnType: string;
  isAsync?: boolean;
  description: string;
  parameters?: ParamDef[];
  example?: string;
  notes?: string;
}

export function MethodCard({
  name,
  signature,
  returnType,
  isAsync = true,
  description,
  parameters = [],
  example,
  notes,
}: MethodCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'example'>('details');

  return (
    <div className="my-4 rounded-lg border border-[#2a303c] bg-[#161920] overflow-hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="w-full p-4 min-h-[48px] flex flex-wrap items-center justify-between gap-3 text-left cursor-pointer bg-[#12151b] hover:bg-[#1a1e27] transition-colors"
      >
        <div className="flex items-center gap-2.5 font-mono text-sm min-w-0">
          <span className="text-[#7fd19c] font-bold text-xs w-4 inline-block text-center" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
          <span className="font-bold text-[#7fd19c] text-sm sm:text-base">{name}</span>
          <span className="text-[#b4bac6] text-xs hidden md:inline truncate">{signature}</span>
        </div>

        <div className="flex items-center gap-2">
          {isAsync && <Badge type="async">async</Badge>}
          <Badge type="tag">: {returnType}</Badge>
        </div>
      </button>

      <div className="px-4 py-3 text-sm text-[#e6e8ec] border-t border-[#2a303c]">
        {description}
      </div>

      {isOpen && (
        <div className="border-t border-[#2a303c] bg-[#0b0d11] p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#2a303c] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-[#26613c] text-white border-[#7fd19c]'
                  : 'bg-[#161920] text-[#b4bac6] border-[#5c677a] hover:text-white'
              }`}
            >
              Parameters ({parameters.length})
            </button>
            {example && (
              <button
                type="button"
                onClick={() => setActiveTab('example')}
                className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  activeTab === 'example'
                    ? 'bg-[#26613c] text-white border-[#7fd19c]'
                    : 'bg-[#161920] text-[#b4bac6] border-[#5c677a] hover:text-white'
                }`}
              >
                Code Example
              </button>
            )}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-3">
              {parameters.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a303c] text-[#b4bac6] font-semibold">
                        <th className="py-2 px-3">Parameter</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Requirement</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a303c]">
                      {parameters.map((p) => (
                        <tr key={p.name} className="hover:bg-[#161920]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#7fd19c]">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#f0be52]">
                            {p.type}
                          </td>
                          <td className="py-2.5 px-3">
                            {p.required ? (
                              <Badge type="required">Required</Badge>
                            ) : (
                              <Badge type="optional">Optional {p.default ? `(${p.default})` : ''}</Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#e6e8ec]">
                            {p.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#b4bac6] font-mono">
                  No parameters required for {name}().
                </p>
              )}
              {notes && (
                <p className="text-xs text-[#b4bac6] bg-[#161920] border border-[#2a303c] rounded p-3">
                  {notes}
                </p>
              )}
            </div>
          )}

          {activeTab === 'example' && example && (
            <CodeWindow
              title={`${name}.ts`}
              lang="ts"
              code={example}
              showLineNumbers
            />
          )}
        </div>
      )}
    </div>
  );
}
