'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'example'>('details');

  const copyExample = () => {
    if (!example) return;
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-[#262b33] bg-[#15181d] shadow-sm overflow-hidden transition-all duration-200 hover:border-[#509b6b]/50">
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
            <div className="relative group">
              <button
                onClick={copyExample}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-1 z-10"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{example}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
