'use client';

import React, { useState } from 'react';
import { CodeWindow } from './CodeWindow';

type RestEndpointKey = 'createMessage' | 'listMessages' | 'addReaction' | 'kickMember';
type WsFrameKey = 'messageCreate' | 'ready' | 'subscribe' | 'pingPong';

const REST_ENDPOINTS: Record<
  RestEndpointKey,
  {
    verb: 'POST' | 'GET' | 'PUT' | 'DELETE';
    route: string;
    status: string;
    label: string;
  }
> = {
  createMessage: {
    verb: 'POST',
    route: '/rooms/:roomId/messages',
    status: '200 OK',
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

export function ApiPlayground() {
  const [activeTab, setActiveTab] = useState<'rest' | 'ws'>('rest');
  const [method, setMethod] = useState<RestEndpointKey>('createMessage');
  const [wsFrame, setWsFrame] = useState<WsFrameKey>('messageCreate');

  const [roomId, setRoomId] = useState('109876543210987654');
  const [spaceId, setSpaceId] = useState('987654321098765432');
  const [userId, setUserId] = useState('123456789012345678');
  const [messageId, setMessageId] = useState('112233445566778899');
  const [plaintext, setPlaintext] = useState('Hello from @strafe-js/rest');
  const [emoji, setEmoji] = useState('custom:778899001122334455');

  const [response, setResponse] = useState<Record<string, unknown> | null>(null);

  const getCodeSnippet = () => {
    if (activeTab === 'ws') {
      if (wsFrame === 'subscribe') {
        return `import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: 'wss://app.strafe.chat/gateway/events',
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
  url: 'wss://app.strafe.chat/gateway/events',
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
  url: 'wss://app.strafe.chat/gateway/events',
  token: process.env.BOT_TOKEN!,
});

gateway.on('${wsFrame}', (payload, envelope) => {
  console.log('Dispatched event:', payload, envelope);
});

gateway.connect();`;
    }

    switch (method) {
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
              Inspect HTTP routes, status codes, and Stargate WebSocket opcodes (0..8).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0b0d11] border border-[#252a34]">
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
            <span className="px-2 py-0.5 rounded bg-[#141820] border border-[#252a34] text-[#7fd19c] text-[11px]">
              HTTP {currentRest.status}
            </span>
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
              {currentWs.direction}
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
                {(method === 'createMessage' ||
                  method === 'listMessages' ||
                  method === 'addReaction') && (
                  <div>
                    <label className="block font-mono text-[11px] text-[#8f98a8] mb-1">
                      roomId (Snowflake)
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
              onClick={() => setResponse(buildPayloadPreview())}
              className="w-full py-2 px-4 rounded-lg bg-[#509b6b] hover:bg-[#45875d] text-white font-mono font-semibold text-xs transition-colors cursor-pointer"
            >
              Generate Frame / Response Snapshot
            </button>
          </div>
        </div>

        <div className="p-5 bg-[#0e1116] flex flex-col justify-between space-y-4">
          <CodeWindow
            title={activeTab === 'rest' ? `rest.${method}.ts` : `gateway.${wsFrame}.ts`}
            lang="ts"
            code={getCodeSnippet()}
            showLineNumbers
          />
          <CodeWindow
            title={
              activeTab === 'rest'
                ? `HTTP Response (${currentRest.status})`
                : `Stargate Frame (op: ${currentWs.op})`
            }
            lang="json"
            code={JSON.stringify(activePayload, null, 2)}
            showLineNumbers={false}
          />
        </div>
      </div>
    </div>
  );
}
