'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { CodeWindow } from './CodeWindow';
import { PERMISSION_LIST } from './PermissionCalculator';

const OAUTH_SCOPES = [
  {
    name: 'bot',
    route: 'POST /oauth2/authorize',
    desc: 'Joins the bot user to the target Space and creates its managed role with the requested permission bitmask.',
  },
  {
    name: 'identify',
    route: 'GET /users/@me',
    desc: 'Reads user profile fields (id, username, display_name, avatar_url).',
  },
  {
    name: 'email',
    route: 'GET /users/@me',
    desc: 'Includes email and email_verified on the user profile response.',
  },
  {
    name: 'spaces',
    route: 'GET /users/@me/spaces',
    desc: 'Lists the spaces the authenticated user belongs to.',
  },
  {
    name: 'spaces.join',
    route: 'PUT /spaces/:id/members/:user_id',
    desc: 'Allows a bot in the target space to add the user using their OAuth2 access token.',
  },
] as const;

type ScopeName = (typeof OAUTH_SCOPES)[number]['name'];

function OAuthHandshakeSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#6ab585] shrink-0" aria-hidden="true">
      <circle cx="7.5" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="12" r="1.5" fill="currentColor" />
      <path
        d="M11.75 12H21M18 12V15.5M15 12V14.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 5.5C6.5 3.2 10.5 3.2 13 5.5"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OAuth2Generator() {
  const [baseUrl, setBaseUrl] = useState('https://app.strafe.chat');
  const [clientId, setClientId] = useState('123456789012345678');
  const [redirectUri, setRedirectUri] = useState('');
  const [state, setState] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [disableSpaceSelect, setDisableSpaceSelect] = useState(false);
  const [scopes, setScopes] = useState<ScopeName[]>(['bot']);
  const [permMask, setPermMask] = useState<number>(7);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const toggleScope = (scope: ScopeName) => {
    setScopes((prev) => {
      if (prev.includes(scope)) {
        const next = prev.filter((s) => s !== scope);
        return next.length > 0 ? next : ['identify'];
      }
      return [...prev, scope];
    });
  };

  const togglePerm = (bit: number) => setPermMask((prev) => prev ^ bit);

  const setPermPreset = (preset: 'read_post' | 'everyone' | 'mod' | 'admin' | 'none') => {
    if (preset === 'read_post') setPermMask(7);
    else if (preset === 'everyone') setPermMask(10723359);
    else if (preset === 'mod') {
      setPermMask(
        (1 << 0) |
          (1 << 1) |
          (1 << 2) |
          (1 << 3) |
          (1 << 6) |
          (1 << 9) |
          (1 << 10) |
          (1 << 23) |
          (1 << 27),
      );
    } else if (preset === 'admin') setPermMask(1 << 11);
    else setPermMask(0);
  };

  const cleanOrigin = (baseUrl.trim() || 'https://app.strafe.chat')
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');

  const queryEntries: Array<[string, string]> = [
    ['response_type', 'code'],
    ['client_id', clientId.trim() || 'YOUR_CLIENT_ID'],
    ['scope', scopes.join(' ')],
  ];
  if (redirectUri.trim()) queryEntries.push(['redirect_uri', redirectUri.trim()]);
  if (state.trim()) queryEntries.push(['state', state.trim()]);
  if (scopes.includes('bot') && permMask > 0) {
    queryEntries.push(['permissions', String(permMask)]);
  }
  if (spaceId.trim()) {
    queryEntries.push(['space_id', spaceId.trim()]);
    if (disableSpaceSelect) queryEntries.push(['disable_space_select', 'true']);
  }

  const generatedUrl = (() => {
    const params = new URLSearchParams();
    for (const [k, v] of queryEntries) {
      params.set(k, v);
    }
    return `${cleanOrigin}/oauth2/authorize?${params.toString()}`;
  })();

  const selectedPerms = PERMISSION_LIST.filter((p) => (permMask & p.bit) === p.bit).map(
    (p) => p.name,
  );

  const isBotInviteOnly = scopes.length === 1 && scopes[0] === 'bot';

  const generatedCode = isBotInviteOnly
    ? `import { generateBotInviteUrl } from '@strafe-js/builders';

const inviteUrl = generateBotInviteUrl({
  clientId: '${clientId.trim() || 'YOUR_CLIENT_ID'}',${
    baseUrl.trim() && baseUrl.trim() !== 'https://app.strafe.chat'
      ? `\n  baseUrl: '${baseUrl.trim()}',`
      : ''
  }${
    selectedPerms.length > 0
      ? `\n  permissions: [\n${selectedPerms.map((n) => `    '${n}',`).join('\n')}\n  ],`
      : ''
  }${spaceId.trim() ? `\n  spaceId: '${spaceId.trim()}',` : ''}${
    spaceId.trim() && disableSpaceSelect ? `\n  disableSpaceSelect: true,` : ''
  }${redirectUri.trim() ? `\n  redirectUri: '${redirectUri.trim()}',` : ''}${
    state.trim() ? `\n  state: '${state.trim()}',` : ''
  }
});`
    : `import { generateOAuth2Url } from '@strafe-js/builders';

const authorizeUrl = generateOAuth2Url({
  clientId: '${clientId.trim() || 'YOUR_CLIENT_ID'}',
  scopes: [${scopes.map((s) => `'${s}'`).join(', ')}],${
    baseUrl.trim() && baseUrl.trim() !== 'https://app.strafe.chat'
      ? `\n  baseUrl: '${baseUrl.trim()}',`
      : ''
  }${redirectUri.trim() ? `\n  redirectUri: '${redirectUri.trim()}',` : ''}${
    state.trim() ? `\n  state: '${state.trim()}',` : ''
  }${
    scopes.includes('bot') && selectedPerms.length > 0
      ? `\n  permissions: [${selectedPerms.map((n) => `'${n}'`).join(', ')}],`
      : ''
  }${spaceId.trim() ? `\n  spaceId: '${spaceId.trim()}',` : ''}${
    spaceId.trim() && disableSpaceSelect ? `\n  disableSpaceSelect: true,` : ''
  }
});`;

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-[#2a2f39] bg-[#12151b] shadow-[0_18px_42px_-12px_rgba(0,0,0,0.7),0_1px_0_0_rgba(255,255,255,0.04)_inset] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#161a22] border-b border-[#262b35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0d1015] border border-[#2a2f39] flex items-center justify-center shadow-inner">
            <OAuthHandshakeSvg />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
                OAuth2 & Bot Installation URL Builder
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#509b6b]/15 text-[#7fd19c] border border-[#509b6b]/30">
                {isBotInviteOnly ? 'generateBotInviteUrl()' : 'generateOAuth2Url()'}
              </span>
            </div>
            <p className="text-xs text-[#8f98a8] !m-0 mt-0.5">
              Construct RFC 6749 authorization links for /oauth2/authorize with scope and permission bitmask encoding.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1.5">
              client_id (Snowflake)
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="123456789012345678"
              className="w-full px-3 py-2 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1.5">
              Instance Origin
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://app.strafe.chat"
              className="w-full px-3 py-2 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1.5">
              space_id (Optional)
            </label>
            <input
              type="text"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              placeholder="987654321098765432"
              className="w-full px-3 py-2 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1.5">
              redirect_uri (Optional for bot scope)
            </label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder="https://example.com/oauth/callback"
              className="w-full px-3 py-2 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1.5">
              state (CSRF Token)
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="csrf_nonce_9f8a7b"
              className="w-full px-3 py-2 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={!spaceId.trim()}
              onClick={() => setDisableSpaceSelect((v) => !v)}
              className={`w-full px-3 py-2 rounded-lg border text-left font-mono text-xs flex items-center justify-between transition-colors ${
                !spaceId.trim()
                  ? 'border-[#1f232c] bg-[#0b0d11]/50 text-[#555d6d] cursor-not-allowed'
                  : disableSpaceSelect
                    ? 'border-[#509b6b] bg-[#509b6b]/15 text-[#7fd19c] cursor-pointer'
                    : 'border-[#252a34] bg-[#0b0d11] text-[#b4bac6] hover:border-[#363c48] cursor-pointer'
              }`}
            >
              <span>disable_space_select</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141820] border border-[#252a34]">
                {spaceId.trim() && disableSpaceSelect ? 'true' : 'false'}
              </span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#252a34]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8f98a8]">
              OAuth2 Scopes ({scopes.join(' ')})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {OAUTH_SCOPES.map((s) => {
              const active = scopes.includes(s.name);
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => toggleScope(s.name)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'border-[#509b6b] bg-[#509b6b]/12 shadow-[0_0_16px_-6px_rgba(80,155,107,0.35)]'
                      : 'border-[#252a34] bg-[#0b0d11] hover:border-[#363c48]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#7fd19c]">{s.name}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          active ? 'bg-[#509b6b] shadow-[0_0_6px_#509b6b]' : 'bg-[#2a2f39]'
                        }`}
                      />
                    </div>
                    <div className="text-[11px] text-[#8f98a8] leading-snug">{s.desc}</div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#1e232d] font-mono text-[10px] text-[#6b7385] truncate">
                    {s.route}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {scopes.includes('bot') && (
          <div className="pt-4 border-t border-[#252a34] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8f98a8]">
                  Bot Role Bitmask
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-[#0b0d11] border border-[#252a34] text-[#7fd19c]">
                  permissions={permMask} (0x{permMask.toString(16).toUpperCase()})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setPermPreset('read_post')}
                  className="px-2 py-1 rounded bg-[#0d1015] border border-[#252a34] hover:border-[#509b6b] text-[#b4bac6] hover:text-[#7fd19c] transition-colors cursor-pointer"
                >
                  Read & Post (7)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('everyone')}
                  className="px-2 py-1 rounded bg-[#0d1015] border border-[#252a34] hover:border-[#509b6b] text-[#b4bac6] hover:text-[#7fd19c] transition-colors cursor-pointer"
                >
                  @everyone (10723359)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('mod')}
                  className="px-2 py-1 rounded bg-[#0d1015] border border-[#252a34] hover:border-[#509b6b] text-[#b4bac6] hover:text-[#7fd19c] transition-colors cursor-pointer"
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('admin')}
                  className="px-2 py-1 rounded bg-[#0d1015] border border-[#252a34] hover:border-[#509b6b] text-[#b4bac6] hover:text-[#7fd19c] transition-colors cursor-pointer"
                >
                  Admin (2048)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('none')}
                  className="px-2 py-1 rounded bg-[#0d1015] border border-[#252a34] hover:border-[#e25555]/60 text-[#8f98a8] hover:text-[#f28b8b] transition-colors cursor-pointer"
                >
                  Clear (0)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 p-3 rounded-lg bg-[#0b0d11] border border-[#252a34]">
              {PERMISSION_LIST.map((p) => {
                const checked = (permMask & p.bit) === p.bit;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => togglePerm(p.bit)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-left font-mono text-[11px] transition-colors cursor-pointer border ${
                      checked
                        ? 'bg-[#509b6b]/15 border-[#509b6b]/40 text-[#7fd19c] font-semibold'
                        : 'bg-transparent border-transparent text-[#8f98a8] hover:bg-[#141820] hover:text-[#cfd5e0]'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[9px] opacity-65 shrink-0">1&lt;&lt;{p.shift}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#252a34] space-y-4">
          <div className="rounded-lg border border-[#252a34] bg-[#0b0d11] overflow-hidden">
            <div className="px-3.5 py-2 bg-[#141820] border-b border-[#252a34] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-[#509b6b]/20 text-[#7fd19c] font-bold">
                  GET
                </span>
                <span className="text-[#cfd5e0] font-semibold">/oauth2/authorize</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-2.5 py-1 rounded bg-[#181c24] border border-[#2a2f39] hover:border-[#509b6b] text-[#cfd5e0] text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#509b6b]" />
                      <span className="text-[#7fd19c]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-[#509b6b] hover:bg-[#45875d] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-3 font-mono text-xs text-[#7fd19c] break-all select-all">
              {generatedUrl}
            </div>

            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              {queryEntries.map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#141820] border border-[#222731] font-mono text-[10px]"
                >
                  <span className="text-[#8f98a8]">{k}=</span>
                  <span className="text-[#cfd5e0]">{v}</span>
                </span>
              ))}
            </div>
          </div>

          <CodeWindow title="oauth2-link.ts" lang="ts" code={generatedCode} showLineNumbers />
        </div>
      </div>
    </div>
  );
}
