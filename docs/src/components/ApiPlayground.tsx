'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CodeWindow } from './CodeWindow';

type RestEndpointKey =
  | 'getMe'
  | 'getSpaceRooms'
  | 'createMessage'
  | 'listMessages'
  | 'addReaction'
  | 'kickMember';
type WsFrameKey = 'ready' | 'pingPong' | 'subscribe' | 'messageCreate';

const REST_ENDPOINTS: Record<
  RestEndpointKey,
  {
    verb: 'POST' | 'GET' | 'PUT' | 'DELETE';
    route: string;
    status: string;
    label: string;
  }
> = {
  getMe: {
    verb: 'GET',
    route: '/users/@me',
    status: '200 OK',
    label: 'getMe()',
  },
  getSpaceRooms: {
    verb: 'GET',
    route: '/spaces/:spaceId/rooms',
    status: '200 OK',
    label: 'getSpaceRooms(spaceId)',
  },
  createMessage: {
    verb: 'POST',
    route: '/rooms/:roomId/messages',
    status: '201 Created',
    label: 'createMessage(roomId, body)',
  },
  listMessages: {
    verb: 'GET',
    route: '/rooms/:roomId/messages?limit=25',
    status: '200 OK',
    label: 'listMessages(roomId, query)',
  },
  addReaction: {
    verb: 'PUT',
    route: '/rooms/:roomId/messages/:messageId/reactions/:emoji',
    status: '204 No Content',
    label: 'addReaction(roomId, messageId, emoji)',
  },
  kickMember: {
    verb: 'DELETE',
    route: '/spaces/:spaceId/members/:userId',
    status: '204 No Content',
    label: 'kickMember(spaceId, userId)',
  },
};

const WS_FRAMES: Record<
  WsFrameKey,
  {
    op: number;
    name: string;
    direction: 'Server -> Client' | 'Client -> Server';
    label: string;
  }
> = {
  messageCreate: {
    op: 3,
    name: 'Event (MESSAGE_CREATE)',
    direction: 'Server -> Client',
    label: 'op: 3 Event (MESSAGE_CREATE)',
  },
  ready: {
    op: 4,
    name: 'Ready (READY)',
    direction: 'Server -> Client',
    label: 'op: 4 Ready (Session Hydrated)',
  },
  subscribe: {
    op: 1,
    name: 'Subscribe',
    direction: 'Client -> Server',
    label: 'op: 1 Subscribe (rooms / spaces)',
  },
  pingPong: {
    op: 7,
    name: 'Pong',
    direction: 'Server -> Client',
    label: 'op: 6 Ping / op: 7 Pong',
  },
};

const VERB_COLORS: Record<string, string> = {
  GET: 'bg-[#4b8fe2]/20 text-[#85b8f8] border-[#4b8fe2]/35',
  POST: 'bg-[#509b6b]/20 text-[#7fd19c] border-[#509b6b]/35',
  PUT: 'bg-[#e0a526]/20 text-[#f0be52] border-[#e0a526]/35',
  DELETE: 'bg-[#e25555]/20 text-[#f28b8b] border-[#e25555]/35',
};

function ProtocolWaveSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#6ab585] shrink-0" aria-hidden="true">
      <path
        d="M3 12H6.5L9 6.5L12.5 17.5L15.5 9.5L17.5 12H21"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="12" r="1.5" fill="currentColor" />
      <circle cx="21" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ZeroStorageLockSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-[#7fd19c] shrink-0 mt-0.5" aria-hidden="true">
      <rect x="3.5" y="8.5" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 8.5V6C6.5 4.067 8.067 2.5 10 2.5C11.933 2.5 13.5 4.067 13.5 6V8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="13" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function ApiPlayground() {
  const [activeTab, setActiveTab] = useState<'rest' | 'ws'>('rest');
  const [mode, setMode] = useState<'mock' | 'live'>('mock');
  const [method, setMethod] = useState<RestEndpointKey>('getMe');
  const [wsFrame, setWsFrame] = useState<WsFrameKey>('ready');

  const [apiBase, setApiBase] = useState('https://app.strafe.chat/api');
  const [gatewayUrl, setGatewayUrl] = useState('wss://app.strafe.chat/gateway/events');
  const [authScheme, setAuthScheme] = useState<'Bot' | 'Bearer'>('Bot');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const [roomId, setRoomId] = useState('109876543210987654');
  const [spaceId, setSpaceId] = useState('987654321098765432');
  const [userId, setUserId] = useState('123456789012345678');
  const [messageId, setMessageId] = useState('112233445566778899');
  const [plaintext, setPlaintext] = useState('Hello from @strafe-js/rest');
  const [emoji, setEmoji] = useState('custom:778899001122334455');

  const [isLoading, setIsLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastMeta, setLastMeta] = useState<{
    source: 'simulated' | 'live';
    statusLabel: string;
    latencyMs?: number;
  } | null>(null);
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Playground unmounted');
        wsRef.current = null;
      }
    };
  }, []);

  const getCodeSnippet = () => {
    if (activeTab === 'ws') {
      if (wsFrame === 'subscribe') {
        return `import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: '${gatewayUrl}',
  token: process.env.BOT_TOKEN!,
});

gateway.on('ready', () => {
  gateway.subscribe({
    spaces: ['${spaceId}'],
    rooms: ['${roomId}'],
  });
});

gateway.connect();`;
      }
      if (wsFrame === 'pingPong') {
        return `import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: '${gatewayUrl}',
  token: process.env.BOT_TOKEN!,
  heartbeatInterval: 45_000,
});

gateway.on('pong', () => {
  console.log('Received op: 7 Pong frame from Stargate');
});

gateway.ping();`;
      }
      return `import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: '${gatewayUrl}',
  token: process.env.BOT_TOKEN!,
});

gateway.on('${wsFrame}', (payload, envelope) => {
  console.log('Dispatched event:', payload, envelope);
});

gateway.connect();`;
    }

    switch (method) {
      case 'getMe':
        return `import { REST } from '@strafe-js/rest';

const rest = new REST({
  baseUrl: '${apiBase}',
  token: process.env.BOT_TOKEN,
  authScheme: '${authScheme}',
});

const me = await rest.getMe();
console.log(me.id, me.username);`;
      case 'getSpaceRooms':
        return `const rooms = await client.rest.getSpaceRooms('${spaceId}');
const plainRooms = rooms.filter((r) => !r.e2ee_enabled);`;
      case 'createMessage':
        return `const message = await client.rest.createMessage('${roomId}', {
  plaintext: '${plaintext}',
});`;
      case 'kickMember':
        return `await client.rest.kickMember('${spaceId}', '${userId}');`;
      case 'listMessages':
        return `const messages = await client.rest.listMessages('${roomId}', {
  limit: 25,
});`;
      case 'addReaction':
        return `await client.rest.addReaction('${roomId}', '${messageId}', '${emoji}');`;
    }
  };

  const buildPayloadPreview = (): Record<string, unknown> => {
    if (activeTab === 'ws') {
      switch (wsFrame) {
        case 'messageCreate':
          return {
            op: 3,
            d: {
              t: 'MESSAGE_CREATE',
              space_id: spaceId,
              room_id: roomId,
              d: {
                id: messageId,
                room_id: roomId,
                space_id: spaceId,
                sender_id: userId,
                plaintext,
                attachments: [],
                created_at: '2026-10-18T12:00:00.000Z',
              },
            },
          };
        case 'ready':
          return {
            op: 4,
            d: {
              user: {
                id: '998877665544332211',
                username: 'strafe-bot',
                is_bot: true,
              },
              spaces: [{ id: spaceId, name: 'Strafe Developers', owner_id: userId }],
              rooms: [{ id: roomId, space_id: spaceId, name: 'general', type: 3 }],
            },
          };
        case 'subscribe':
          return {
            op: 1,
            d: {
              spaces: [spaceId],
              rooms: [roomId],
            },
          };
        case 'pingPong':
          return {
            sent: { op: 6 },
            received: { op: 7 },
          };
      }
    }

    switch (method) {
      case 'getMe':
        return {
          status: 200,
          route: 'GET /users/@me',
          body: {
            id: '998877665544332211',
            username: 'strafe-bot',
            display_name: 'Strafe Helper',
            is_bot: true,
          },
        };
      case 'getSpaceRooms':
        return {
          status: 200,
          route: `GET /spaces/${spaceId}/rooms`,
          body: [
            {
              id: roomId,
              space_id: spaceId,
              name: 'general',
              type: 3,
              e2ee_enabled: false,
            },
          ],
        };
      case 'createMessage':
        return {
          status: 200,
          route: `POST /rooms/${roomId}/messages`,
          body: {
            id: messageId,
            room_id: roomId,
            sender_id: '998877665544332211',
            plaintext,
            mentions: [],
            role_mentions: [],
            mention_everyone: false,
            created_at: '2026-10-18T12:00:00.000Z',
          },
        };
      case 'listMessages':
        return {
          status: 200,
          route: `GET /rooms/${roomId}/messages?limit=25`,
          body: [
            {
              id: messageId,
              room_id: roomId,
              sender_id: userId,
              plaintext,
              created_at: '2026-10-18T12:00:00.000Z',
            },
          ],
        };
      case 'addReaction':
        return {
          status: 204,
          route: `PUT /rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
          body: null,
        };
      case 'kickMember':
        return {
          status: 204,
          route: `DELETE /spaces/${spaceId}/members/${userId}`,
          body: null,
        };
    }
  };

  const executeLiveRest = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setLastMeta({ source: 'live', statusLabel: 'Missing Token' });
      setResponse({
        error: 'Provide a Bot or Bearer token in the Live Credentials panel before sending a live request.',
      });
      return;
    }

    const base = apiBase.trim().replace(/\/+$/, '');
    let path = '/users/@me';
    let verb: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';
    let bodyObj: Record<string, unknown> | undefined;

    if (method === 'getMe') {
      verb = 'GET';
      path = '/users/@me';
    } else if (method === 'getSpaceRooms') {
      verb = 'GET';
      path = `/spaces/${encodeURIComponent(spaceId.trim())}/rooms`;
    } else if (method === 'createMessage') {
      verb = 'POST';
      path = `/rooms/${encodeURIComponent(roomId.trim())}/messages`;
      bodyObj = { plaintext };
    } else if (method === 'listMessages') {
      verb = 'GET';
      path = `/rooms/${encodeURIComponent(roomId.trim())}/messages?limit=25`;
    } else if (method === 'addReaction') {
      verb = 'PUT';
      path = `/rooms/${encodeURIComponent(roomId.trim())}/messages/${encodeURIComponent(
        messageId.trim(),
      )}/reactions/${encodeURIComponent(emoji.trim())}`;
    } else if (method === 'kickMember') {
      verb = 'DELETE';
      path = `/spaces/${encodeURIComponent(spaceId.trim())}/members/${encodeURIComponent(
        userId.trim(),
      )}`;
    }

    const headers: Record<string, string> = {
      Authorization: `${authScheme} ${cleanToken}`,
    };
    if (bodyObj !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    setIsLoading(true);
    const start = performance.now();

    try {
      const relayRes = await fetch('/_playground-relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rest',
          url: `${base}${path}`,
          method: verb,
          authHeader: `${authScheme} ${cleanToken}`,
          payload: bodyObj,
        }),
      });

      if (relayRes.ok) {
        const relayData = (await relayRes.json()) as Record<string, unknown>;
        const latencyMs =
          typeof relayData.latency_ms === 'number'
            ? relayData.latency_ms
            : Math.round(performance.now() - start);
        const statusNum = typeof relayData.status === 'number' ? relayData.status : 0;
        const statusText = typeof relayData.statusText === 'string' ? relayData.statusText : '';
        setLastMeta({
          source: 'live',
          statusLabel: statusNum ? `${statusNum} ${statusText}`.trim() : 'Network Error',
          latencyMs,
        });
        setResponse(relayData);
        return;
      }

      const res = await fetch(`${base}${path}`, {
        method: verb,
        headers,
        body: bodyObj ? JSON.stringify(bodyObj) : undefined,
      });
      const latencyMs = Math.round(performance.now() - start);

      let parsedBody: unknown = null;
      if (res.status !== 204) {
        const text = await res.text();
        try {
          parsedBody = text ? JSON.parse(text) : null;
        } catch {
          parsedBody = text;
        }
      }

      setLastMeta({
        source: 'live',
        statusLabel: `${res.status} ${res.statusText || ''}`.trim(),
        latencyMs,
      });
      setResponse({
        live: true,
        status: res.status,
        ok: res.ok,
        latency_ms: latencyMs,
        request: `${verb} ${base}${path}`,
        body: parsedBody,
      });
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      setLastMeta({
        source: 'live',
        statusLabel: 'Network / CORS Error',
        latencyMs,
      });
      setResponse({
        live: true,
        error: err instanceof Error ? err.message : String(err),
        request: `${verb} ${base}${path}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeLiveGateway = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setLastMeta({ source: 'live', statusLabel: 'Missing Token' });
      setResponse({
        error: 'Provide a Bot or Bearer token before opening a live WebSocket connection.',
      });
      return;
    }

    setIsLoading(true);
    const start = performance.now();

    try {
      const relayRes = await fetch('/_playground-relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ws',
          gatewayUrl: gatewayUrl.trim(),
          authHeader: `${authScheme} ${cleanToken}`,
          wsFrame,
          spaceId: spaceId.trim(),
          roomId: roomId.trim(),
        }),
      });

      if (relayRes.ok) {
        const relayData = (await relayRes.json()) as Record<string, unknown>;
        const latencyMs =
          typeof relayData.latency_ms === 'number'
            ? relayData.latency_ms
            : Math.round(performance.now() - start);
        const statusLabel =
          typeof relayData.statusLabel === 'string' ? relayData.statusLabel : 'WS Completed';
        setLastMeta({
          source: 'live',
          statusLabel,
          latencyMs,
        });
        setResponse(relayData);
        setIsLoading(false);
        return;
      }
    } catch {
      // Fallback to direct browser WebSocket when static export is hosted without Node relay
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Closed by user');
      wsRef.current = null;
      setWsConnected(false);
      setIsLoading(false);
      setLastMeta({ source: 'live', statusLabel: 'Disconnected (1000)' });
      return;
    }

    try {
      const targetUrl = new URL(gatewayUrl.trim());
      targetUrl.searchParams.set('token', cleanToken);
      const sock = new WebSocket(targetUrl.toString());
      wsRef.current = sock;

      sock.onopen = () => {
        setIsLoading(false);
        setWsConnected(true);
        setLastMeta({ source: 'live', statusLabel: 'WS Connected' });
        if (wsFrame === 'subscribe') {
          sock.send(
            JSON.stringify({
              op: 1,
              d: { space_id: spaceId.trim() },
            }),
          );
        } else if (wsFrame === 'pingPong') {
          sock.send(JSON.stringify({ op: 6 }));
        }
      };

      sock.onmessage = (ev) => {
        try {
          const frame = JSON.parse(String(ev.data)) as Record<string, unknown>;
          setLastMeta({
            source: 'live',
            statusLabel: `Received op: ${String(frame.op ?? '?')}`,
          });
          setResponse(frame);
        } catch {
          setResponse({ raw: String(ev.data) });
        }
      };

      sock.onerror = () => {
        setIsLoading(false);
        setWsConnected(false);
        setLastMeta({ source: 'live', statusLabel: 'WS Handshake Rejected' });
        setResponse({
          live: true,
          error: 'Browser WebSocket handshake failed on static host.',
          note: 'Stargate accepts Bot tokens exclusively via the HTTP Authorization: Bot <token> upgrade header. Run the docs server locally (npm run docs:dev) or execute the snippet in Node.js with @strafe-js/ws.',
        });
      };

      sock.onclose = (ev) => {
        setIsLoading(false);
        setWsConnected(false);
        wsRef.current = null;
        setLastMeta((prev) =>
          prev?.statusLabel === 'WS Handshake Rejected'
            ? prev
            : { source: 'live', statusLabel: `Closed (${ev.code})` },
        );
      };
    } catch (err) {
      setIsLoading(false);
      setResponse({
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleRun = () => {
    if (mode === 'mock') {
      const preview = buildPayloadPreview();
      setLastMeta({
        source: 'simulated',
        statusLabel:
          activeTab === 'rest'
            ? REST_ENDPOINTS[method].status
            : `op: ${WS_FRAMES[wsFrame].op}`,
      });
      setResponse(preview);
      return;
    }

    if (activeTab === 'rest') {
      void executeLiveRest();
    } else {
      void executeLiveGateway();
    }
  };

  const currentRest = REST_ENDPOINTS[method];
  const currentWs = WS_FRAMES[wsFrame];
  const activePayload = response ?? buildPayloadPreview();

  return (
    <div className="my-6 rounded-xl border border-[#2a2f39] bg-[#12151b] shadow-[0_18px_42px_-12px_rgba(0,0,0,0.7),0_1px_0_0_rgba(255,255,255,0.04)_inset] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#161a22] border-b border-[#262b35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0d1015] border border-[#2a2f39] flex items-center justify-center shadow-inner">
            <ProtocolWaveSvg />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
              REST API & Stargate Frame Inspector
            </h3>
            <p className="text-xs text-[#8f98a8] !m-0 mt-0.5">
              Inspect simulated payloads or execute live requests with your own Bot or Bearer token.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0b0d11] border border-[#252a34]">
            <button
              type="button"
              onClick={() => setMode('mock')}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'mock'
                  ? 'bg-[#222834] text-[#e6e8ec]'
                  : 'text-[#8f98a8] hover:text-[#e6e8ec]'
              }`}
            >
              Simulated
            </button>
            <button
              type="button"
              onClick={() => setMode('live')}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                mode === 'live'
                  ? 'bg-[#509b6b]/25 border border-[#509b6b]/50 text-[#7fd19c]'
                  : 'text-[#8f98a8] hover:text-[#7fd19c]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  mode === 'live' ? 'bg-[#7fd19c] shadow-[0_0_6px_#7fd19c]' : 'bg-[#5c6474]'
                }`}
              />
              Use Own Token (Live)
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0b0d11] border border-[#252a34]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('rest');
                setResponse(null);
              }}
              className={`px-3 py-1 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'rest'
                  ? 'bg-[#509b6b] text-white'
                  : 'text-[#8f98a8] hover:text-[#e6e8ec]'
              }`}
            >
              @strafe-js/rest
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ws');
                setResponse(null);
              }}
              className={`px-3 py-1 rounded-md font-mono text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'ws'
                  ? 'bg-[#509b6b] text-white'
                  : 'text-[#8f98a8] hover:text-[#e6e8ec]'
              }`}
            >
              @strafe-js/ws
            </button>
          </div>
        </div>
      </div>

      {mode === 'live' && (
        <div className="px-5 py-4 bg-[#0e1218] border-b border-[#262b35] space-y-3.5 text-xs">
          <div className="p-3 rounded-lg bg-[#509b6b]/[0.08] border border-[#509b6b]/30 flex items-start gap-2.5">
            <ZeroStorageLockSvg />
            <div className="space-y-0.5 text-[11px] leading-relaxed text-[#cfd5e0]">
              <div className="font-bold text-[#7fd19c]">
                Zero Storage & Direct Client Execution Guarantee
              </div>
              <p className="!m-0 text-[#9ba5b6]">
                We do not store, log, proxy, or transmit your token to any third-party server. The token resides strictly in volatile browser memory (React state) for this tab, is never written to <code className="text-[#7fd19c]">localStorage</code>, <code className="text-[#7fd19c]">sessionStorage</code>, or cookies, and is wiped immediately when you clear the field or close the tab.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1">
                {activeTab === 'rest' ? 'REST Base URL' : 'Stargate WS URL'}
              </label>
              <input
                type="text"
                value={activeTab === 'rest' ? apiBase : gatewayUrl}
                onChange={(e) =>
                  activeTab === 'rest'
                    ? setApiBase(e.target.value)
                    : setGatewayUrl(e.target.value)
                }
                className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1">
                Auth Scheme
              </label>
              <select
                value={authScheme}
                onChange={(e) => setAuthScheme(e.target.value as 'Bot' | 'Bearer')}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#7fd19c] font-mono text-xs focus:border-[#509b6b] outline-none"
              >
                <option value="Bot">Bot</option>
                <option value="Bearer">Bearer</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1">
                Authorization Token (Volatile In-Memory Only)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste Bot or OAuth2 Bearer token..."
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#252a34] bg-[#141820] hover:border-[#363c48] text-[#b4bac6] font-mono text-[11px] cursor-pointer"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
                {token && (
                  <button
                    type="button"
                    onClick={() => setToken('')}
                    className="px-2.5 py-1.5 rounded-lg border border-[#e25555]/40 bg-[#e25555]/10 text-[#f28b8b] font-mono text-[11px] cursor-pointer"
                  >
                    Wipe
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-3 bg-[#0b0d11] border-b border-[#262b35] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {activeTab === 'rest' ? (
          <>
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  VERB_COLORS[currentRest.verb]
                }`}
              >
                {currentRest.verb}
              </span>
              <span className="text-[#cfd5e0]">{currentRest.route}</span>
            </div>
            <div className="flex items-center gap-2">
              {lastMeta?.latencyMs !== undefined && (
                <span className="px-2 py-0.5 rounded bg-[#141820] border border-[#252a34] text-[#8f98a8] text-[11px]">
                  {lastMeta.latencyMs} ms
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-[#141820] border border-[#252a34] text-[#7fd19c] text-[11px]">
                {lastMeta ? lastMeta.statusLabel : `HTTP ${currentRest.status}`}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#509b6b]/20 text-[#7fd19c] border border-[#509b6b]/35">
                OP {currentWs.op}
              </span>
              <span className="text-[#cfd5e0]">{currentWs.name}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#141820] border border-[#252a34] text-[#8f98a8] text-[11px]">
              {lastMeta ? lastMeta.statusLabel : currentWs.direction}
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#262b35]">
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#8f98a8] mb-1.5">
              {activeTab === 'rest' ? 'Select REST Method' : 'Select Gateway Frame'}
            </label>
            {activeTab === 'rest' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(REST_ENDPOINTS) as RestEndpointKey[]).map((key) => {
                  const item = REST_ENDPOINTS[key];
                  const selected = method === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMethod(key);
                        setResponse(null);
                        setLastMeta(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left font-mono transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#509b6b] bg-[#509b6b]/12 text-[#7fd19c]'
                          : 'border-[#252a34] bg-[#0b0d11] text-[#b4bac6] hover:border-[#363c48]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs">{key}()</span>
                        <span className="text-[10px] opacity-80">{item.verb}</span>
                      </div>
                      <div className="text-[10px] text-[#7f8797] truncate">{item.route}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(WS_FRAMES) as WsFrameKey[]).map((key) => {
                  const item = WS_FRAMES[key];
                  const selected = wsFrame === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setWsFrame(key);
                        setResponse(null);
                        setLastMeta(null);
                      }}
                      className={`p-2.5 rounded-lg border text-left font-mono transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#509b6b] bg-[#509b6b]/12 text-[#7fd19c]'
                          : 'border-[#252a34] bg-[#0b0d11] text-[#b4bac6] hover:border-[#363c48]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs">{item.name}</span>
                        <span className="text-[10px] opacity-80">op: {item.op}</span>
                      </div>
                      <div className="text-[10px] text-[#7f8797] truncate">{item.direction}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#252a34] space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[#8f98a8]">
              Request / Frame Parameters
            </div>

            {activeTab === 'rest' ? (
              <div className="space-y-3">
                {method === 'getMe' && (
                  <div className="p-2.5 rounded-lg bg-[#0b0d11] border border-[#252a34] font-mono text-[11px] text-[#8f98a8]">
                    GET /users/@me requires no path parameters; it inspects the authenticated Bot or Bearer token header.
                  </div>
                )}
                {method === 'getSpaceRooms' && (
                  <div>
                    <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                      spaceId (Snowflake)
                    </label>
                    <input
                      type="text"
                      value={spaceId}
                      onChange={(e) => setSpaceId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                )}
                {(method === 'createMessage' ||
                  method === 'listMessages' ||
                  method === 'addReaction') && (
                  <div>
                    <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                      roomId (Snowflake, must have e2ee_enabled: false for bots)
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                )}
                {method === 'createMessage' && (
                  <div>
                    <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                      body.plaintext
                    </label>
                    <input
                      type="text"
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                )}
                {method === 'kickMember' && (
                  <>
                    <div>
                      <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                        spaceId (Snowflake)
                      </label>
                      <input
                        type="text"
                        value={spaceId}
                        onChange={(e) => setSpaceId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                        userId (Snowflake)
                      </label>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                      />
                    </div>
                  </>
                )}
                {method === 'addReaction' && (
                  <>
                    <div>
                      <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                        messageId (Snowflake)
                      </label>
                      <input
                        type="text"
                        value={messageId}
                        onChange={(e) => setMessageId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                        emoji (Unicode or custom:id)
                      </label>
                      <input
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                    space_id (Snowflake)
                  </label>
                  <input
                    type="text"
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                    room_id (Snowflake)
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#252a34] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#509b6b] outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={handleRun}
              className={`w-full py-2 px-4 rounded-lg font-mono font-semibold text-xs transition-colors cursor-pointer ${
                mode === 'live' && activeTab === 'ws' && wsConnected
                  ? 'bg-[#e25555] hover:bg-[#c94545] text-white'
                  : 'bg-[#509b6b] hover:bg-[#45875d] text-white'
              }`}
            >
              {isLoading
                ? 'Executing Request...'
                : mode === 'mock'
                  ? 'Generate Simulated Snapshot'
                  : activeTab === 'rest'
                    ? `Send Live ${currentRest.verb} Request`
                    : wsConnected
                      ? 'Disconnect Live WebSocket'
                      : 'Connect & Send Live WS Frame'}
            </button>
          </div>
        </div>

        <div className="p-5 bg-[#0e1116] flex flex-col justify-between space-y-4">
          <CodeWindow
            title={activeTab === 'rest' ? `rest.${method}.ts` : `gateway.${wsFrame}.ts`}
            lang="ts"
            code={getCodeSnippet()}
          />
          <CodeWindow
            title={
              mode === 'live'
                ? `Live Output (${lastMeta?.statusLabel || 'Ready'})`
                : activeTab === 'rest'
                  ? `HTTP Response (${currentRest.status})`
                  : `Stargate Frame (op: ${currentWs.op})`
            }
            lang="json"
            code={JSON.stringify(activePayload, null, 2)}
          />
        </div>
      </div>
    </div>
  );
}
