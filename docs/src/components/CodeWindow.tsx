'use client';

import React, { useState } from 'react';

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
      return [{ text: line, color: '#949eb0', italic: true }];
    }
    const parts = line.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (/^\s+$/.test(part)) return { text: part };
      if (idx === 0 && (part === '$' || part === '>')) {
        return { text: part, color: '#7fd19c' };
      }
      if (BASH_CMDS.has(part)) {
        return { text: part, color: '#79c0ff' };
      }
      if (part.startsWith('-')) {
        return { text: part, color: '#ffa657' };
      }
      if (part.startsWith('@strafe-js/') || part.includes('strafebot')) {
        return { text: part, color: '#7fd19c' };
      }
      return { text: part, color: '#e6edf3' };
    });
  }

  if (lang === 'ini') {
    if (line.trimStart().startsWith('#')) {
      return [{ text: line, color: '#949eb0', italic: true }];
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
          spans.push({ text: match[1], color: '#7fd19c' });
          spans.push({ text: match[2], color: '#949eb0' });
        } else {
          spans.push({ text: match[1], color: '#a5d6ff' });
        }
      } else if (match[3]) {
        spans.push({ text: match[3], color: '#79c0ff' });
      } else if (match[4]) {
        spans.push({ text: match[4], color: '#ffa657' });
      } else if (match[5]) {
        spans.push({ text: match[5], color: '#949eb0' });
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
        spans.push({ text: callSuffix, color: '#949eb0' });
      }
    } else if (m[5]) {
      spans.push({ text: m[5], color: '#949eb0' });
    } else if (m[6]) {
      spans.push({ text: m[6] });
    }
    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < codePart.length) {
    spans.push({ text: codePart.slice(lastIdx), color: '#e6edf3' });
  }
  if (commentPart) {
    spans.push({ text: commentPart, color: '#949eb0', italic: true });
  }

  return spans;
}

const LANG_LABELS: Record<string, string> = {
  ts: 'example.ts',
  tsx: 'component.tsx',
  js: 'example.js',
  json: 'payload.json',
  bash: 'shell',
  sh: 'shell',
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
      className={`shiki not-prose my-4 rounded-lg relative border border-[#2a303c] bg-[#0b0d11] overflow-hidden text-sm ${className}`}
    >
      <div className="flex text-[#b4bac6] items-center justify-between gap-2 min-h-[44px] border-b border-[#2a303c] bg-[#141820] px-4 py-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] uppercase px-1.5 py-0.5 rounded bg-[#0b0d11] border border-[#5c677a] text-[#7fd19c]">
            {lang}
          </span>
          <figcaption className="truncate font-mono text-xs text-[#e6e8ec]">
            {title || LANG_LABELS[lang] || lang}
          </figcaption>
        </div>
        <button
          type="button"
          aria-label="Copy code snippet"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded px-2.5 py-1 min-h-[32px] font-mono text-xs font-medium bg-[#161920] border border-[#5c677a] text-[#e6e8ec] hover:border-[#7fd19c] hover:text-[#7fd19c] transition-colors cursor-pointer"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div
        role="region"
        aria-label={title || LANG_LABELS[lang] || 'Code snippet'}
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
