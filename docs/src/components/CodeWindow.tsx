'use client';

import React, { useState } from 'react';
import { Check, Copy, FileCode2, Terminal } from 'lucide-react';

export interface CodeWindowProps {
  code: string;
  title?: string;
  lang?: 'ts' | 'tsx' | 'js' | 'json' | 'bash' | 'sh' | 'ini';
  showLineNumbers?: boolean;
  className?: string;
}

interface TokenSpan {
  text: string;
  color?: string;
  italic?: boolean;
}

const TS_KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'const',
  'let',
  'var',
  'function',
  'async',
  'await',
  'return',
  'if',
  'else',
  'for',
  'of',
  'in',
  'new',
  'true',
  'false',
  'null',
  'undefined',
  'type',
  'interface',
  'class',
  'extends',
  'implements',
  'try',
  'catch',
  'finally',
  'throw',
  'switch',
  'case',
  'break',
]);

const BASH_CMDS = new Set([
  'npm',
  'npx',
  'pnpm',
  'yarn',
  'bun',
  'cd',
  'git',
  'node',
  'curl',
  'install',
  'run',
  'create',
  'dev',
  'build',
  'test',
  'add',
]);

function tokenizeLine(line: string, lang: string): TokenSpan[] {
  if (!line) return [{ text: '' }];

  if (lang === 'bash' || lang === 'sh') {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) {
      return [{ text: line, color: '#6b7385', italic: true }];
    }
    const parts = line.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (/^\s+$/.test(part)) return { text: part };
      if (idx === 0 && (part === '$' || part === '>')) {
        return { text: part, color: '#509b6b' };
      }
      if (BASH_CMDS.has(part)) {
        return { text: part, color: '#79c0ff' };
      }
      if (part.startsWith('-')) {
        return { text: part, color: '#ffa657' };
      }
      if (part.startsWith('@strafe-js/') || part.includes('strafebot')) {
        return { text: part, color: '#7ee787' };
      }
      return { text: part, color: '#e6edf3' };
    });
  }

  if (lang === 'ini') {
    if (line.trimStart().startsWith('#')) {
      return [{ text: line, color: '#6b7385', italic: true }];
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1) {
      return [
        { text: line.slice(0, eqIdx), color: '#79c0ff' },
        { text: '=', color: '#ff7b72' },
        { text: line.slice(eqIdx + 1), color: '#a5d6ff' },
      ];
    }
    return [{ text: line, color: '#e6edf3' }];
  }

  if (lang === 'json') {
    const spans: TokenSpan[] = [];
    const regex = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)|([{}[\],:])|(\s+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        spans.push({ text: line.slice(lastIndex, match.index), color: '#e6edf3' });
      }
      if (match[1]) {
        if (match[2]) {
          spans.push({ text: match[1], color: '#7ee787' });
          spans.push({ text: match[2], color: '#8b949e' });
        } else {
          spans.push({ text: match[1], color: '#a5d6ff' });
        }
      } else if (match[3]) {
        spans.push({ text: match[3], color: '#79c0ff' });
      } else if (match[4]) {
        spans.push({ text: match[4], color: '#ffa657' });
      } else if (match[5]) {
        spans.push({ text: match[5], color: '#8b949e' });
      } else if (match[6]) {
        spans.push({ text: match[6] });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      spans.push({ text: line.slice(lastIndex), color: '#e6edf3' });
    }
    return spans;
  }

  // TypeScript / JavaScript tokenizer
  const commentIndex = (() => {
    let inSingle = false;
    let inDouble = false;
    let inTick = false;
    for (let i = 0; i < line.length - 1; i++) {
      const ch = line[i];
      if (ch === '\\') {
        i++;
        continue;
      }
      if (!inDouble && !inTick && ch === "'") inSingle = !inSingle;
      else if (!inSingle && !inTick && ch === '"') inDouble = !inDouble;
      else if (!inSingle && !inDouble && ch === '`') inTick = !inTick;
      else if (!inSingle && !inDouble && !inTick && ch === '/' && line[i + 1] === '/') {
        return i;
      }
    }
    return -1;
  })();

  const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  const commentPart = commentIndex >= 0 ? line.slice(commentIndex) : '';

  const spans: TokenSpan[] = [];
  const tokenRegex =
    /('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b|\b([A-Za-z_$][A-Za-z0-9_$]*)\b(\s*\()?|([{}()[\].,:;+-/*=&|<>!?]+)|(\s+)/g;

  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(codePart)) !== null) {
    if (m.index > lastIdx) {
      spans.push({ text: codePart.slice(lastIdx, m.index), color: '#e6edf3' });
    }
    if (m[1]) {
      spans.push({ text: m[1], color: '#a5d6ff' });
    } else if (m[2]) {
      spans.push({ text: m[2], color: '#ffa657' });
    } else if (m[3]) {
      const word = m[3];
      const callSuffix = m[4] || '';
      if (TS_KEYWORDS.has(word)) {
        spans.push({ text: word, color: '#ff7b72' });
      } else if (/^[A-Z]/.test(word)) {
        spans.push({ text: word, color: '#ffa657' });
      } else if (callSuffix) {
        spans.push({ text: word, color: '#d2a8ff' });
      } else {
        spans.push({ text: word, color: '#e6edf3' });
      }
      if (callSuffix) {
        spans.push({ text: callSuffix, color: '#8b949e' });
      }
    } else if (m[5]) {
      spans.push({ text: m[5], color: '#8b949e' });
    } else if (m[6]) {
      spans.push({ text: m[6] });
    }
    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < codePart.length) {
    spans.push({ text: codePart.slice(lastIdx), color: '#e6edf3' });
  }
  if (commentPart) {
    spans.push({ text: commentPart, color: '#6b7385', italic: true });
  }

  return spans;
}

const LANG_LABELS: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  json: 'JSON',
  bash: 'Terminal',
  sh: 'Shell',
  ini: 'ENV',
};

export function CodeWindow({
  code,
  title,
  lang = 'ts',
  showLineNumbers = true,
  className = '',
}: CodeWindowProps) {
  const [copied, setCopied] = useState(false);

  const normalized = code.replace(/\n$/, '');
  const lines = normalized.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(normalized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTerminal = lang === 'bash' || lang === 'sh';

  return (
    <div
      className={`rounded-xl border border-[#2a2f39] bg-[#0b0d11] shadow-[0_14px_34px_-8px_rgba(0,0,0,0.65),0_0_0_1px_rgba(80,155,107,0.06)_inset] overflow-hidden transition-all duration-200 hover:border-[#509b6b]/55 hover:shadow-[0_18px_40px_-8px_rgba(0,0,0,0.75),0_0_24px_-6px_rgba(80,155,107,0.22)] ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#12161d] border-b border-[#252a34] select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e25555]/75" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e0a526]/75" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#509b6b]/85" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#cfd5e0] truncate">
            {isTerminal ? (
              <Terminal className="w-3.5 h-3.5 text-[#509b6b] shrink-0" />
            ) : (
              <FileCode2 className="w-3.5 h-3.5 text-[#509b6b] shrink-0" />
            )}
            <span className="truncate font-semibold">
              {title || LANG_LABELS[lang] || lang.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#1b2029] text-[#8f98a8] border border-[#2a2f39]">
            {LANG_LABELS[lang] || lang}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#181c24] border border-[#2a2f39] text-[#b4bac6] hover:text-[#6ab585] hover:border-[#509b6b] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#509b6b]" />
                <span className="text-[#6ab585]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto strafe-code-scroll py-3.5 px-2">
        <pre className="!m-0 !p-0 !bg-transparent font-mono text-[13px] leading-[1.68]">
          <code className="grid min-w-full">
            {lines.map((line, i) => {
              const tokens = tokenizeLine(line, lang);
              return (
                <span
                  key={i}
                  className="flex items-baseline px-3 py-0.5 rounded-sm hover:bg-[#509b6b]/[0.06] transition-colors"
                >
                  {showLineNumbers && (
                    <span className="select-none w-7 pr-3 text-right text-[11px] text-[#4d5565] font-mono shrink-0">
                      {i + 1}
                    </span>
                  )}
                  <span className="whitespace-pre">
                    {tokens.map((tok, j) => (
                      <span
                        key={j}
                        style={{
                          color: tok.color,
                          fontStyle: tok.italic ? 'italic' : undefined,
                        }}
                      >
                        {tok.text}
                      </span>
                    ))}
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
