'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink, KeyRound, Link2, Shield } from 'lucide-react';
import { CodeWindow } from './CodeWindow';
import { PERMISSION_LIST } from './PermissionCalculator';

const OAUTH_SCOPES = [
  {
    name: 'bot',
    desc: 'Adds the application bot user to the selected Space with the requested permission bitmask.',
  },
  {
    name: 'identify',
    desc: 'Reads the user profile (id, username, display_name, avatar_url) via GET /users/@me.',
  },
  {
    name: 'email',
    desc: 'Includes email and email_verified on GET /users/@me.',
  },
  {
    name: 'spaces',
    desc: 'Lists the spaces the user belongs to via GET /users/@me/spaces.',
  },
  {
    name: 'spaces.join',
    desc: 'Allows a bot in the target space to add the user via PUT /spaces/:id/members/:user_id.',
  },
] as const;

type ScopeName = (typeof OAUTH_SCOPES)[number]['name'];

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

  const generatedUrl = (() => {
    const cleanOrigin = (baseUrl.trim() || 'https://app.strafe.chat')
      .replace(/\/+$/, '')
      .replace(/\/api$/, '');
    const params = new URLSearchParams();
    params.set('response_type', 'code');
    params.set('client_id', clientId.trim() || 'YOUR_CLIENT_ID');
    params.set('scope', scopes.join(' '));
    if (redirectUri.trim()) params.set('redirect_uri', redirectUri.trim());
    if (state.trim()) params.set('state', state.trim());
    if (scopes.includes('bot') && permMask > 0) {
      params.set('permissions', String(permMask));
    }
    if (spaceId.trim()) {
      params.set('space_id', spaceId.trim());
      if (disableSpaceSelect) params.set('disable_space_select', 'true');
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
    <div className="my-8 border border-[#2a2f39] rounded-2xl bg-[#15181e] shadow-xl overflow-hidden text-[#e6e8ec]">
      <div className="p-6 bg-gradient-to-r from-[#509b6b]/15 via-[#1c2028] to-[#101216] border-b border-[#2a2f39]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#509b6b] text-white shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#e6e8ec]">
              OAuth2 & Bot Install Link Generator
            </h3>
            <p className="text-xs text-[#b4bac6]">
              Configure application parameters, OAuth2 scopes, and Equinox permission masks to generate ready-to-use install URLs and SDK code.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-[#e6e8ec] mb-1">
              Application / Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="123456789012345678"
              className="w-full px-3 py-2 rounded-lg border border-[#2a2f39] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#e6e8ec] mb-1">
              Instance Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://app.strafe.chat"
              className="w-full px-3 py-2 rounded-lg border border-[#2a2f39] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#e6e8ec] mb-1">
              Preselected Space ID (Optional)
            </label>
            <input
              type="text"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              placeholder="987654321098765432"
              className="w-full px-3 py-2 rounded-lg border border-[#2a2f39] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#e6e8ec] mb-1">
              Redirect URI (Optional for bot-only)
            </label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder="https://example.com/oauth/callback"
              className="w-full px-3 py-2 rounded-lg border border-[#2a2f39] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#e6e8ec] mb-1">
              CSRF State Parameter (Optional)
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="random_csrf_token"
              className="w-full px-3 py-2 rounded-lg border border-[#2a2f39] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={disableSpaceSelect}
                onChange={(e) => setDisableSpaceSelect(e.target.checked)}
                disabled={!spaceId.trim()}
                className="rounded border-[#2a2f39] text-[#509b6b]"
              />
              <span className="font-medium text-[#e6e8ec]">
                Lock Space Picker (<code>disable_space_select=true</code>)
              </span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[#2a2f39]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6ab585] mb-3">
            OAuth2 Scopes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {OAUTH_SCOPES.map((s) => {
              const active = scopes.includes(s.name);
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => toggleScope(s.name)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-[#509b6b] bg-[#509b6b]/15'
                      : 'border-[#2a2f39] bg-[#0b0d11] hover:border-[#363c48]'
                  }`}
                >
                  <div className="font-mono font-bold text-sm text-[#6ab585] mb-1">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-[#b4bac6] leading-snug">{s.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {scopes.includes('bot') && (
          <div className="pt-4 border-t border-[#2a2f39] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6ab585] flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Bot Role Permissions (Mask: {permMask})
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPermPreset('read_post')}
                  className="px-2.5 py-1 rounded-md bg-[#1e222a] hover:bg-[#509b6b] text-[#e6e8ec] hover:text-white transition-colors cursor-pointer"
                >
                  Read & Post (7)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('everyone')}
                  className="px-2.5 py-1 rounded-md bg-[#1e222a] hover:bg-[#509b6b] text-[#e6e8ec] hover:text-white transition-colors cursor-pointer"
                >
                  Default @everyone (10723359)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('mod')}
                  className="px-2.5 py-1 rounded-md bg-[#1e222a] hover:bg-[#509b6b] text-[#e6e8ec] hover:text-white transition-colors cursor-pointer"
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('admin')}
                  className="px-2.5 py-1 rounded-md bg-[#1e222a] hover:bg-[#509b6b] text-[#e6e8ec] hover:text-white transition-colors cursor-pointer"
                >
                  Administrator (2048)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('none')}
                  className="px-2.5 py-1 rounded-md bg-[#1e222a] hover:bg-[#e25555] text-[#e6e8ec] hover:text-white transition-colors cursor-pointer"
                >
                  Clear (0)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3.5 rounded-xl bg-[#0b0d11] border border-[#2a2f39]">
              {PERMISSION_LIST.map((p) => {
                const checked = (permMask & p.bit) === p.bit;
                return (
                  <label
                    key={p.name}
                    className="flex items-center gap-2 cursor-pointer select-none py-1 px-1.5 rounded hover:bg-[#171a20]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePerm(p.bit)}
                      className="rounded border-[#2a2f39] text-[#509b6b]"
                    />
                    <span
                      className={`font-mono text-[11px] ${
                        checked ? 'text-[#6ab585] font-semibold' : 'text-[#b4bac6]'
                      }`}
                    >
                      {p.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#2a2f39] space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs text-[#6ab585] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-4 h-4" /> Generated Authorization URL
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-2.5 py-1 rounded-md bg-[#1e222a] border border-[#2a2f39] hover:border-[#509b6b] text-[#e6e8ec] text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#509b6b]" />
                      <span className="text-[#6ab585]">Copied URL</span>
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
                  className="px-2.5 py-1 rounded-md bg-[#509b6b] hover:bg-[#45875d] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0b0d11] border border-[#2a2f39] font-mono text-xs text-[#7ee787] break-all">
              {generatedUrl}
            </div>
          </div>

          <CodeWindow
            title="oauth2-link.ts"
            lang="ts"
            code={generatedCode}
            showLineNumbers
          />
        </div>
      </div>
    </div>
  );
}
