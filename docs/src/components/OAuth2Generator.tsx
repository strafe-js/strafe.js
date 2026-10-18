'use client';

import React, { useState } from 'react';
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

export function OAuth2Generator() {
  const [baseUrl, setBaseUrl] = useState('https://app.strafe.chat');
  const [clientId, setClientId] = useState('');
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

  const resolvedClientId = clientId.trim() || 'YOUR_CLIENT_ID';

  const queryEntries: Array<[string, string]> = [
    ['response_type', 'code'],
    ['client_id', resolvedClientId],
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
  const requiresRedirectUriWarning = !isBotInviteOnly && !redirectUri.trim();

  const generatedCode = isBotInviteOnly
    ? `import { generateBotInviteUrl } from '@strafe-js/builders';

const inviteUrl = generateBotInviteUrl({
  clientId: '${resolvedClientId}',${
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
  clientId: '${resolvedClientId}',
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
    <div className="my-6 rounded-lg border border-[#2a303c] bg-[#161920] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#12151b] border-b border-[#2a303c] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
              OAuth2 &amp; Bot Installation URL Builder
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#0b0d11] text-[#7fd19c] border border-[#5c677a]">
              {isBotInviteOnly ? 'generateBotInviteUrl()' : 'generateOAuth2Url()'}
            </span>
          </div>
          <p className="text-xs text-[#b4bac6] !m-0 mt-1">
            Construct RFC 6749 authorization links for /oauth2/authorize with scope and permission bitmask encoding.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div>
            <label htmlFor="oauth-client-id" className="block font-mono text-xs text-[#b4bac6] mb-1.5">
              client_id (Application Snowflake ID)
            </label>
            <input
              id="oauth-client-id"
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="YOUR_APPLICATION_CLIENT_ID"
              className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
            />
          </div>
          <div>
            <label htmlFor="oauth-base-url" className="block font-mono text-xs text-[#b4bac6] mb-1.5">
              Instance Origin
            </label>
            <input
              id="oauth-base-url"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://app.strafe.chat"
              className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
            />
          </div>
          <div>
            <label htmlFor="oauth-space-id" className="block font-mono text-xs text-[#b4bac6] mb-1.5">
              space_id (Optional preselected space)
            </label>
            <input
              id="oauth-space-id"
              type="text"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              placeholder="OPTIONAL_SPACE_SNOWFLAKE_ID"
              className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
            />
          </div>
          <div>
            <label htmlFor="oauth-redirect-uri" className="block font-mono text-xs text-[#b4bac6] mb-1.5">
              redirect_uri (Required for non-bot scopes)
            </label>
            <input
              id="oauth-redirect-uri"
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder="https://your-app.example/oauth/callback"
              className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
            />
          </div>
          <div>
            <label htmlFor="oauth-state" className="block font-mono text-xs text-[#b4bac6] mb-1.5">
              state (CSRF Token)
            </label>
            <input
              id="oauth-state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="YOUR_CSRF_STATE_TOKEN"
              className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={!spaceId.trim()}
              aria-pressed={Boolean(spaceId.trim() && disableSpaceSelect)}
              onClick={() => setDisableSpaceSelect((v) => !v)}
              className={`w-full px-3 py-2 min-h-[40px] rounded border text-left font-mono text-xs flex items-center justify-between transition-colors ${
                !spaceId.trim()
                  ? 'border-[#2a303c] bg-[#0b0d11] text-[#949eb0] cursor-not-allowed'
                  : disableSpaceSelect
                    ? 'border-[#7fd19c] bg-[#26613c] text-white cursor-pointer'
                    : 'border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] hover:border-[#7fd19c] cursor-pointer'
              }`}
            >
              <span>disable_space_select</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#161920] border border-[#5c677a]">
                {spaceId.trim() && disableSpaceSelect ? 'true' : 'false'}
              </span>
            </button>
          </div>
        </div>

        {!clientId.trim() && (
          <div className="px-3 py-2 rounded bg-[#0b0d11] border border-[#5c677a] font-mono text-xs text-[#b4bac6]">
            [PLACEHOLDER CLIENT_ID] Using placeholder &quot;YOUR_CLIENT_ID&quot; in generated URL. Enter your application Snowflake ID above for a production link.
          </div>
        )}

        {requiresRedirectUriWarning && (
          <div className="px-3 py-2 rounded bg-[#f0be52]/15 border border-[#f0be52] font-mono text-xs text-[#f0be52]">
            [REDIRECT_URI REQUIRED] Non-bot OAuth2 scopes ({scopes.filter((s) => s !== 'bot').join(', ')}) require a registered redirect_uri for authorization code exchange.
          </div>
        )}

        <div className="pt-4 border-t border-[#2a303c]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold text-[#e6e8ec]">
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
                  aria-pressed={active}
                  onClick={() => toggleScope(s.name)}
                  className={`p-3 min-h-[44px] rounded border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'border-[#7fd19c] bg-[#26613c]/25'
                      : 'border-[#5c677a] bg-[#0b0d11] hover:border-[#7fd19c]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#7fd19c]">{s.name}</span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                          active
                            ? 'bg-[#26613c] border-[#7fd19c] text-white'
                            : 'bg-[#161920] border-[#5c677a] text-[#b4bac6]'
                        }`}
                      >
                        {active ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="text-xs text-[#b4bac6] leading-snug">{s.desc}</div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#2a303c] font-mono text-[11px] text-[#949eb0] truncate">
                    {s.route}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {scopes.includes('bot') && (
          <div className="pt-4 border-t border-[#2a303c] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#e6e8ec]">
                  Bot Role Bitmask
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-[#0b0d11] border border-[#5c677a] text-[#7fd19c]">
                  permissions={permMask} (0x{permMask.toString(16).toUpperCase()})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setPermPreset('read_post')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#0b0d11] border border-[#5c677a] hover:border-[#7fd19c] text-[#e6e8ec] transition-colors cursor-pointer"
                >
                  Read &amp; Post (7)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('everyone')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#0b0d11] border border-[#5c677a] hover:border-[#7fd19c] text-[#e6e8ec] transition-colors cursor-pointer"
                >
                  @everyone (10723359)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('mod')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#0b0d11] border border-[#5c677a] hover:border-[#7fd19c] text-[#e6e8ec] transition-colors cursor-pointer"
                >
                  Moderator
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('admin')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#0b0d11] border border-[#5c677a] hover:border-[#7fd19c] text-[#e6e8ec] transition-colors cursor-pointer"
                >
                  Admin (2048)
                </button>
                <button
                  type="button"
                  onClick={() => setPermPreset('none')}
                  className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#0b0d11] border border-[#5c677a] hover:border-[#f28b8b] text-[#b4bac6] hover:text-[#f28b8b] transition-colors cursor-pointer"
                >
                  Clear (0)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 p-3 rounded bg-[#0b0d11] border border-[#2a303c]">
              {PERMISSION_LIST.map((p) => {
                const checked = (permMask & p.bit) === p.bit;
                return (
                  <button
                    key={p.name}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => togglePerm(p.bit)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 min-h-[40px] rounded text-left font-mono text-xs transition-colors cursor-pointer border ${
                      checked
                        ? 'bg-[#26613c] border-[#7fd19c] text-white font-semibold'
                        : 'bg-[#161920] border-[#2a303c] text-[#b4bac6] hover:border-[#5c677a] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] text-[#cfd5e0] shrink-0">1&lt;&lt;{p.shift}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#2a303c] space-y-4">
          <div className="rounded border border-[#2a303c] bg-[#0b0d11] overflow-hidden">
            <div className="px-3.5 py-2 bg-[#12151b] border-b border-[#2a303c] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-1.5 py-0.5 rounded bg-[#26613c] text-white border border-[#7fd19c] font-bold">
                  GET
                </span>
                <span className="text-[#e6e8ec] font-semibold">/oauth2/authorize</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-3 py-1.5 min-h-[36px] rounded bg-[#161920] border border-[#5c677a] hover:border-[#7fd19c] text-[#e6e8ec] font-mono text-xs cursor-pointer transition-colors"
                >
                  {copiedUrl ? 'Copied URL' : 'Copy URL'}
                </button>
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 min-h-[36px] rounded bg-[#26613c] hover:bg-[#1f5433] border border-[#7fd19c] text-white font-mono text-xs font-semibold inline-flex items-center transition-colors"
                >
                  Open URL
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#161920] border border-[#2a303c] font-mono text-xs"
                >
                  <span className="text-[#b4bac6]">{k}=</span>
                  <span className="text-[#e6e8ec]">{v}</span>
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
