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
  GET: 'bg-[#161920] text-[#7fd19c] border-[#7fd19c]',
  POST: 'bg-[#26613c] text-white border-[#7fd19c]',
  PUT: 'bg-[#f0be52]/15 text-[#f0be52] border-[#f0be52]',
  DELETE: 'bg-[#f28b8b]/15 text-[#f28b8b] border-[#f28b8b]',
};

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
    isError?: boolean;
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
  gateway.subscribe('${spaceId}');
});

gateway.connect();`;
      }
      if (wsFrame === 'pingPong') {
        return `import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: '${gatewayUrl}',
  token: process.env.BOT_TOKEN!,
  heartbeatIntervalMs: 45_000,
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
            _note: '[SIMULATED PAYLOAD PREVIEW]',
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
            _note: '[SIMULATED PAYLOAD PREVIEW]',
            op: 4,
            d: {
              user: {
                id: '998877665544332211',
                username: 'strafe-bot',
                bot: true,
              },
              spaces: [{ id: spaceId, name: 'Example Space', owner_id: userId }],
              rooms: [{ id: roomId, space_id: spaceId, name: 'general', type: 3 }],
            },
          };
        case 'subscribe':
          return {
            _note: '[SIMULATED PAYLOAD PREVIEW]',
            op: 1,
            d: {
              space_id: spaceId,
            },
          };
        case 'pingPong':
          return {
            _note: '[SIMULATED PAYLOAD PREVIEW]',
            sent: { op: 6 },
            received: { op: 7 },
          };
      }
    }

    switch (method) {
      case 'getMe':
        return {
          _note: '[SIMULATED PAYLOAD PREVIEW]',
          status: 200,
          route: 'GET /users/@me',
          body: {
            id: '998877665544332211',
            username: 'strafe-bot',
            display_name: 'Strafe Helper',
            bot: true,
          },
        };
      case 'getSpaceRooms':
        return {
          _note: '[SIMULATED PAYLOAD PREVIEW]',
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
          _note: '[SIMULATED PAYLOAD PREVIEW]',
          status: 201,
          route: `POST /rooms/${roomId}/messages`,
          body: {
            id: messageId,
            room_id: roomId,
            sender_id: '998877665544332211',
            plaintext,
            mentions: [],
            mention_roles: [],
            mention_everyone: false,
            created_at: '2026-10-18T12:00:00.000Z',
          },
        };
      case 'listMessages':
        return {
          _note: '[SIMULATED PAYLOAD PREVIEW]',
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
          _note: '[SIMULATED PAYLOAD PREVIEW]',
          status: 204,
          route: `PUT /rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
          body: null,
        };
      case 'kickMember':
        return {
          _note: '[SIMULATED PAYLOAD PREVIEW]',
          status: 204,
          route: `DELETE /spaces/${spaceId}/members/${userId}`,
          body: null,
        };
    }
  };

  const executeLiveRest = async () => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setLastMeta({ source: 'live', statusLabel: 'Missing Token', isError: true });
      setResponse({
        error: 'Missing authorization token. Paste a Bot or Bearer token in the Live Credentials input above and retry.',
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
          isError: !relayData.ok,
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
        isError: !res.ok,
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
        isError: true,
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
      setLastMeta({ source: 'live', statusLabel: 'Missing Token', isError: true });
      setResponse({
        error: 'Missing authorization token. Paste a Bot or Bearer token before opening a live WebSocket connection.',
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
          isError: !relayData.ok,
          latencyMs,
        });
        setResponse(relayData);
        setIsLoading(false);
        return;
      }
    } catch {
      // Static export fallback when local Node relay is unavailable
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
        setLastMeta({ source: 'live', statusLabel: 'WS Handshake Rejected', isError: true });
        setResponse({
          live: true,
          error: 'Browser WebSocket handshake failed on static host.',
          note: 'Stargate accepts Bot tokens via the HTTP Authorization: Bot <token> upgrade header. Run the docs server locally (npm run docs:dev) or execute the snippet in Node.js with @strafe-js/ws.',
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
      setLastMeta({ source: 'live', statusLabel: 'Connection Error', isError: true });
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
    <div className="my-6 rounded-lg border border-[#2a303c] bg-[#161920] overflow-hidden text-[#e6e8ec]">
      <div className="px-5 py-4 bg-[#12151b] border-b border-[#2a303c] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[#f0f2f5] !m-0">
            REST API &amp; Stargate Frame Inspector
          </h3>
          <p className="text-xs text-[#b4bac6] !m-0 mt-1">
            Inspect simulated payloads or execute live requests with your own Bot or Bearer token.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded bg-[#0b0d11] border border-[#2a303c]">
            <button
              type="button"
              aria-pressed={mode === 'mock'}
              onClick={() => setMode('mock')}
              className={`px-3 py-1.5 min-h-[36px] rounded font-mono text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'mock'
                  ? 'bg-[#26613c] text-white border border-[#7fd19c]'
                  : 'text-[#b4bac6] hover:text-white'
              }`}
            >
              Simulated Preview
            </button>
            <button
              type="button"
              aria-pressed={mode === 'live'}
              onClick={() => setMode('live')}
              className={`px-3 py-1.5 min-h-[36px] rounded font-mono text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'live'
                  ? 'bg-[#26613c] text-white border border-[#7fd19c]'
                  : 'text-[#b4bac6] hover:text-white'
              }`}
            >
              Live Token Mode
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 rounded bg-[#0b0d11] border border-[#2a303c]">
            <button
              type="button"
              aria-pressed={activeTab === 'rest'}
              onClick={() => {
                setActiveTab('rest');
                setResponse(null);
              }}
              className={`px-3 py-1.5 min-h-[36px] rounded font-mono text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'rest'
                  ? 'bg-[#26613c] text-white border border-[#7fd19c]'
                  : 'text-[#b4bac6] hover:text-white'
              }`}
            >
              @strafe-js/rest
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'ws'}
              onClick={() => {
                setActiveTab('ws');
                setResponse(null);
              }}
              className={`px-3 py-1.5 min-h-[36px] rounded font-mono text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'ws'
                  ? 'bg-[#26613c] text-white border border-[#7fd19c]'
                  : 'text-[#b4bac6] hover:text-white'
              }`}
            >
              @strafe-js/ws
            </button>
          </div>
        </div>
      </div>

      {mode === 'live' && (
        <div className="px-5 py-4 bg-[#0b0d11] border-b border-[#2a303c] space-y-3.5 text-xs">
          <div className="p-3 rounded bg-[#161920] border border-[#5c677a] text-xs leading-relaxed text-[#e6e8ec]">
            <span className="font-mono font-bold text-[#7fd19c]">[IN-MEMORY TOKEN POLICY]</span>{' '}
            Your token stays in volatile React state for this tab only. It is never written to{' '}
            <code className="text-[#7fd19c]">localStorage</code>,{' '}
            <code className="text-[#7fd19c]">sessionStorage</code>, or cookies.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <label htmlFor="pg-endpoint-url" className="block font-mono text-xs text-[#b4bac6] mb-1">
                {activeTab === 'rest' ? 'REST Base URL' : 'Stargate WS URL'}
              </label>
              <input
                id="pg-endpoint-url"
                type="text"
                value={activeTab === 'rest' ? apiBase : gatewayUrl}
                onChange={(e) =>
                  activeTab === 'rest'
                    ? setApiBase(e.target.value)
                    : setGatewayUrl(e.target.value)
                }
                className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#161920] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="pg-auth-scheme" className="block font-mono text-xs text-[#b4bac6] mb-1">
                Auth Scheme
              </label>
              <select
                id="pg-auth-scheme"
                value={authScheme}
                onChange={(e) => setAuthScheme(e.target.value as 'Bot' | 'Bearer')}
                className="w-full px-2.5 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#161920] text-[#7fd19c] font-mono text-xs focus:border-[#7fd19c]"
              >
                <option value="Bot">Bot</option>
                <option value="Bearer">Bearer</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label htmlFor="pg-token-input" className="block font-mono text-xs text-[#b4bac6] mb-1">
                Authorization Token (Volatile In-Memory)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="pg-token-input"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="YOUR_BOT_OR_BEARER_TOKEN"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#161920] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                />
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#161920] hover:border-[#7fd19c] text-[#e6e8ec] font-mono text-xs cursor-pointer"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
                {token && (
                  <button
                    type="button"
                    onClick={() => setToken('')}
                    className="px-3 py-2 min-h-[40px] rounded border border-[#f28b8b] bg-[#f28b8b]/15 text-[#f28b8b] font-mono text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-3 bg-[#0b0d11] border-b border-[#2a303c] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        {activeTab === 'rest' ? (
          <>
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  VERB_COLORS[currentRest.verb]
                }`}
              >
                {currentRest.verb}
              </span>
              <span className="text-[#e6e8ec]">{currentRest.route}</span>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && (
                <span className="px-2 py-0.5 rounded bg-[#f0be52]/15 border border-[#f0be52] text-[#f0be52] text-xs">
                  [LOADING] Waiting for response...
                </span>
              )}
              {lastMeta?.latencyMs !== undefined && (
                <span className="px-2 py-0.5 rounded bg-[#161920] border border-[#5c677a] text-[#b4bac6] text-xs">
                  {lastMeta.latencyMs} ms
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded border text-xs ${
                  lastMeta?.isError
                    ? 'bg-[#f28b8b]/15 border-[#f28b8b] text-[#f28b8b]'
                    : 'bg-[#161920] border-[#5c677a] text-[#7fd19c]'
                }`}
              >
                {lastMeta ? `[${lastMeta.source.toUpperCase()}] ${lastMeta.statusLabel}` : `[SIMULATED] HTTP ${currentRest.status}`}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#26613c] text-white border border-[#7fd19c]">
                OP {currentWs.op}
              </span>
              <span className="text-[#e6e8ec]">{currentWs.name}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded border text-xs ${
                lastMeta?.isError
                  ? 'bg-[#f28b8b]/15 border-[#f28b8b] text-[#f28b8b]'
                  : 'bg-[#161920] border-[#5c677a] text-[#b4bac6]'
              }`}
            >
              {isLoading ? '[LOADING] Connecting to Gateway...' : lastMeta ? lastMeta.statusLabel : currentWs.direction}
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2a303c]">
        <div className="p-5 space-y-4 text-xs">
          <div>
            <div className="block font-mono text-xs font-bold text-[#e6e8ec] mb-2">
              {activeTab === 'rest' ? 'Select REST Method' : 'Select Gateway Frame'}
            </div>
            {activeTab === 'rest' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(REST_ENDPOINTS) as RestEndpointKey[]).map((key) => {
                  const item = REST_ENDPOINTS[key];
                  const selected = method === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setMethod(key);
                        setResponse(null);
                        setLastMeta(null);
                      }}
                      className={`p-3 min-h-[48px] rounded border text-left font-mono transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#7fd19c] bg-[#26613c]/25 text-[#7fd19c]'
                          : 'border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] hover:border-[#7fd19c]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs">{key}()</span>
                        <span className="text-[11px] text-[#b4bac6]">{item.verb}</span>
                      </div>
                      <div className="text-[11px] text-[#949eb0] truncate">{item.route}</div>
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
                      aria-pressed={selected}
                      onClick={() => {
                        setWsFrame(key);
                        setResponse(null);
                        setLastMeta(null);
                      }}
                      className={`p-3 min-h-[48px] rounded border text-left font-mono transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#7fd19c] bg-[#26613c]/25 text-[#7fd19c]'
                          : 'border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] hover:border-[#7fd19c]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs">{item.name}</span>
                        <span className="text-[11px] text-[#b4bac6]">op: {item.op}</span>
                      </div>
                      <div className="text-[11px] text-[#949eb0] truncate">{item.direction}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#2a303c] space-y-3">
            <div className="font-mono text-xs font-bold text-[#e6e8ec]">
              Request / Frame Parameters
            </div>

            {activeTab === 'rest' ? (
              <div className="space-y-3">
                {method === 'getMe' && (
                  <div className="p-3 rounded bg-[#0b0d11] border border-[#2a303c] font-mono text-xs text-[#b4bac6]">
                    [NO PATH PARAMETERS] GET /users/@me inspects the authenticated Bot or Bearer token header directly.
                  </div>
                )}
                {method === 'getSpaceRooms' && (
                  <div>
                    <label htmlFor="pg-space-id" className="block font-mono text-xs text-[#b4bac6] mb-1">
                      spaceId (Snowflake)
                    </label>
                    <input
                      id="pg-space-id"
                      type="text"
                      value={spaceId}
                      onChange={(e) => setSpaceId(e.target.value)}
                      className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                    />
                  </div>
                )}
                {(method === 'createMessage' ||
                  method === 'listMessages' ||
                  method === 'addReaction') && (
                  <div>
                    <label htmlFor="pg-room-id" className="block font-mono text-xs text-[#b4bac6] mb-1">
                      roomId (Snowflake, must have e2ee_enabled: false for bots)
                    </label>
                    <input
                      id="pg-room-id"
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                    />
                  </div>
                )}
                {method === 'createMessage' && (
                  <div>
                    <label htmlFor="pg-plaintext" className="block font-mono text-xs text-[#b4bac6] mb-1">
                      body.plaintext
                    </label>
                    <input
                      id="pg-plaintext"
                      type="text"
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                      className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] text-xs focus:border-[#7fd19c]"
                    />
                  </div>
                )}
                {method === 'kickMember' && (
                  <>
                    <div>
                      <label htmlFor="pg-kick-space" className="block font-mono text-xs text-[#b4bac6] mb-1">
                        spaceId (Snowflake)
                      </label>
                      <input
                        id="pg-kick-space"
                        type="text"
                        value={spaceId}
                        onChange={(e) => setSpaceId(e.target.value)}
                        className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                      />
                    </div>
                    <div>
                      <label htmlFor="pg-kick-user" className="block font-mono text-xs text-[#b4bac6] mb-1">
                        userId (Snowflake)
                      </label>
                      <input
                        id="pg-kick-user"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                      />
                    </div>
                  </>
                )}
                {method === 'addReaction' && (
                  <>
                    <div>
                      <label htmlFor="pg-react-msg" className="block font-mono text-xs text-[#b4bac6] mb-1">
                        messageId (Snowflake)
                      </label>
                      <input
                        id="pg-react-msg"
                        type="text"
                        value={messageId}
                        onChange={(e) => setMessageId(e.target.value)}
                        className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                      />
                    </div>
                    <div>
                      <label htmlFor="pg-react-emoji" className="block font-mono text-xs text-[#b4bac6] mb-1">
                        emoji (Unicode or custom:id)
                      </label>
                      <input
                        id="pg-react-emoji"
                        type="text"
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="pg-ws-space" className="block font-mono text-xs text-[#b4bac6] mb-1">
                    space_id (Snowflake)
                  </label>
                  <input
                    id="pg-ws-space"
                    type="text"
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                    className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                  />
                </div>
                <div>
                  <label htmlFor="pg-ws-room" className="block font-mono text-xs text-[#b4bac6] mb-1">
                    room_id (Snowflake)
                  </label>
                  <input
                    id="pg-ws-room"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 min-h-[40px] rounded border border-[#5c677a] bg-[#0b0d11] text-[#e6e8ec] font-mono text-xs focus:border-[#7fd19c]"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={handleRun}
              className={`w-full py-2.5 px-4 min-h-[44px] rounded font-mono font-semibold text-xs border transition-colors cursor-pointer ${
                mode === 'live' && activeTab === 'ws' && wsConnected
                  ? 'bg-[#f28b8b]/20 border-[#f28b8b] text-[#f28b8b] hover:bg-[#f28b8b]/30'
                  : 'bg-[#26613c] hover:bg-[#1f5433] border-[#7fd19c] text-white'
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

        <div className="p-5 bg-[#0b0d11] flex flex-col justify-between space-y-4">
          <CodeWindow
            title={activeTab === 'rest' ? `rest.${method}.ts` : `gateway.${wsFrame}.ts`}
            lang="ts"
            code={getCodeSnippet()}
          />
          <CodeWindow
            title={
              mode === 'live'
                ? `Live Output (${lastMeta?.statusLabel || 'Awaiting Execution'})`
                : activeTab === 'rest'
                  ? `Simulated HTTP Response (${currentRest.status})`
                  : `Simulated Stargate Frame (op: ${currentWs.op})`
            }
            lang="json"
            code={JSON.stringify(activePayload, null, 2)}
          />
        </div>
      </div>
    </div>
  );
}
