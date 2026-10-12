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
    <div className="my-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden transition-all duration-200 hover:border-sky-500/40">
      <div
        className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/90 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 font-mono text-sm">
          <button className="text-zinc-400 hover:text-sky-500 transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="font-bold text-sky-600 dark:text-sky-400 text-base">{name}</span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xs hidden md:inline">{signature}</span>
        </div>

        <div className="flex items-center gap-2">
          {isAsync && <Badge type="async">async</Badge>}
          <Badge type="tag">: {returnType}</Badge>
        </div>
      </div>

      <div className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800/80">
        {description}
      </div>

      {isOpen && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Parameters & Details
            </button>
            {example && (
              <button
                onClick={() => setActiveTab('example')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'example'
                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
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
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold">
                        <th className="py-2 px-3">Parameter</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                      {parameters.map((p) => (
                        <tr key={p.name} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-400">
                            {p.type}
                          </td>
                          <td className="py-2.5 px-3">
                            {p.required ? (
                              <Badge type="required">Required</Badge>
                            ) : (
                              <Badge type="optional">Optional {p.default ? `(${p.default})` : ''}</Badge>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300">
                            {p.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">This method takes no parameters.</p>
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
