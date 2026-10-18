'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { CodeWindow } from './CodeWindow';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
    <div className="my-4 rounded-xl border border-[#2a2f39] bg-[#15181d] shadow-[0_10px_28px_-8px_rgba(0,0,0,0.55),0_1px_0_0_rgba(255,255,255,0.03)_inset] overflow-hidden transition-all duration-200 hover:border-[#509b6b]/60 hover:shadow-[0_14px_34px_-8px_rgba(0,0,0,0.68),0_0_20px_-6px_rgba(80,155,107,0.22)]">
      <div
        className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer bg-[#101317] select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 font-mono text-sm">
          <button className="text-[#9ba5b4] hover:text-[#509b6b] transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="font-bold text-[#6db888] text-base">{name}</span>
          <span className="text-[#9ba5b4] text-xs hidden md:inline">{signature}</span>
        </div>

        <div className="flex items-center gap-2">
          {isAsync && <Badge type="async">async</Badge>}
          <Badge type="tag">: {returnType}</Badge>
        </div>
      </div>

      <div className="px-4 py-3 text-sm text-[#d4dbe3] border-t border-[#262b33]/80">
        {description}
      </div>

      {isOpen && (
        <div className="border-t border-[#262b33] bg-[#0d0f12] p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#262b33] pb-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-[#509b6b]/15 text-[#6db888] font-semibold'
                  : 'text-[#9ba5b4] hover:text-[#f3f5f7]'
              }`}
            >
              Parameters & Details
            </button>
            {example && (
              <button
                onClick={() => setActiveTab('example')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'example'
                    ? 'bg-[#509b6b]/15 text-[#6db888] font-semibold'
                    : 'text-[#9ba5b4] hover:text-[#f3f5f7]'
                }`}
              >
                Usage Example
              </button>
            )}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-3">
              {parameters.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#262b33] text-[#9ba5b4] font-semibold">
                        <th className="py-2 px-3">Parameter</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262b33]/50">
                      {parameters.map((p) => (
                        <tr key={p.name} className="hover:bg-[#15181d]">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#6db888]">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-400">
                            {p.type}
                          </td>
                          <td className="py-2.5 px-3">
                            {p.required ? (
                              <Badge type="required">Required</Badge>
                            ) : (
                              <Badge type="optional">Optional {p.default ? `(${p.default})` : ''}</Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#d4dbe3]">
                            {p.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#9ba5b4] italic">This method takes no parameters.</p>
              )}
              {notes && (
                <p className="text-xs text-[#9ba5b4] bg-[#15181d] border border-[#262b33] rounded-lg p-3">
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
