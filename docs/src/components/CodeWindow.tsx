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

function LangIcon({ lang }: { lang: string }) {
  if (lang === 'bash' || lang === 'sh') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" x2="20" y1="19" y2="19" />
      </svg>
    );
  }
  if (lang === 'json') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
        <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
      <path d="M3 3h18v18H3V3Zm10.71 14.86c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8ZM13 11.25H8v1.5h1.5V19h1.75v-6.25H13v-1.5Z" />
    </svg>
  );
}

const LANG_LABELS: Record<string, string> = {
  ts: 'example.ts',
  tsx: 'component.tsx',
  js: 'example.js',
  json: 'payload.json',
  bash: 'Terminal',
  sh: 'Terminal',
  ini: '.env',
};

export function CodeWindow({
  code,
  title,
  lang = 'ts',
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

  return (
    <figure
      className={`shiki not-prose my-4 rounded-xl relative border shadow-sm overflow-hidden text-sm ${className}`}
    >
      <div className="flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4">
        <div className="text-fd-muted-foreground [&_svg]:size-3.5">
          <LangIcon lang={lang} />
        </div>
        <figcaption className="flex-1 truncate">
          {title || LANG_LABELS[lang] || lang}
        </figcaption>
        <div className="empty:hidden">
          <button
            type="button"
            aria-label="Copy Text"
            onClick={handleCopy}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-xs font-medium transition-colors duration-100 cursor-pointer [&_svg]:size-3.5"
          >
            {copied ? <Check /> : <Copy />}
          </button>
        </div>
      </div>

      <div
        role="region"
        tabIndex={0}
        className="text-[0.8125rem] overflow-auto max-h-[600px] strafe-code-scroll"
      >
        <pre className="min-w-full w-max *:flex *:flex-col">
          <code>
            {lines.map((line, i) => {
              const tokens = tokenizeLine(line, lang);
              return (
                <span key={i} className="line">
                  {line.length === 0 ? (
                    ' '
                  ) : (
                    tokens.map((tok, j) => (
                      <span
                        key={j}
                        style={{
                          color: tok.color,
                          fontStyle: tok.italic ? 'italic' : undefined,
                        }}
                      >
                        {tok.text}
                      </span>
                    ))
                  )}
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </figure>
  );
}
