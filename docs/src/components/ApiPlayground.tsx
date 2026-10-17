'use client';

import React, { useState } from 'react';
import { Send, Radio, RefreshCw } from 'lucide-react';
import { CodeWindow } from './CodeWindow';

export function ApiPlayground() {
  const [activeTab, setActiveTab] = useState<'rest' | 'ws'>('rest');
  const [method, setMethod] = useState<'createMessage' | 'kickMember' | 'listMessages' | 'addReaction'>('createMessage');

  const [roomId, setRoomId] = useState('109876543210987654');
  const [spaceId, setSpaceId] = useState('987654321098765432');
  const [userId, setUserId] = useState('123456789012345678');
  const [messageId, setMessageId] = useState('112233445566778899');
  const [plaintext, setPlaintext] = useState('Hello world from Strafe SDK!');
  const [emoji, setEmoji] = useState('👍');

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const getCodeSnippet = () => {
    if (activeTab === 'ws') return `import { Gateway } from '@strafe-js/ws';\n\nconst gateway = new Gateway({\n  url: 'wss://app.strafe.chat/gateway/events',\n  token: 'YOUR_BOT_TOKEN',\n});\n\ngateway.on('messageCreate', (message, envelope) => {\n  console.log('New Gateway Event Received:', message);\n});\n\ngateway.connect();`;

    switch (method) {
      case 'createMessage': return `const message = await client.rest.createMessage('${roomId}', {\n  plaintext: '${plaintext}',\n});`;
      case 'kickMember': return `await client.rest.kickMember('${spaceId}', '${userId}');`;
      case 'listMessages': return `const messages = await client.rest.listMessages('${roomId}', { limit: 25 });`;
      case 'addReaction': return `await client.rest.addReaction('${roomId}', '${messageId}', '${emoji}');`;
    }
  };

  const executeRequest = () => {
    setLoading(true);
    setResponse(null);

    setTimeout(() => {
      setLoading(false);
      if (activeTab === 'ws') {
        setResponse({ event: 'messageCreate', op: 3, d: { id: '112233445566778899', room_id: roomId, space_id: spaceId, sender_id: userId, plaintext: 'Gateway WebSocket event dispatched live', created_at: new Date().toISOString() } });
      } else {
        switch (method) {
          case 'createMessage': setResponse({ status: 200, data: { id: '112233445566778899', room_id: roomId, sender_id: '998877665544332211', plaintext, created_at: new Date().toISOString() } }); break;
          case 'kickMember': setResponse({ status: 204, data: null, message: 'Space member successfully kicked (HTTP 204 No Content)' }); break;
          case 'listMessages': setResponse({ status: 200, data: [{ id: '112233445566778899', room_id: roomId, plaintext: 'First message' }] }); break;
          case 'addReaction': setResponse({ status: 204, data: null, message: `Reaction "${emoji}" added to message ${messageId}` }); break;
        }
      }
    }, 300);
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border border-[#2f3237] rounded-2xl bg-[#17191c] shadow-lg overflow-hidden text-[#f3f5f7]">
      <div className="p-4 bg-[#101114] border-b border-[#2f3237] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveTab('rest'); setResponse(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'rest' ? 'bg-[#509b6b] text-white' : 'text-[#aeb6c2] hover:text-[#f3f5f7]'}`}><Send className="w-3.5 h-3.5" /> REST API Simulator</button>
          <button onClick={() => { setActiveTab('ws'); setResponse(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'ws' ? 'bg-[#26282c] border border-[#2f3237] text-[#f3f5f7]' : 'text-[#aeb6c2] hover:text-[#f3f5f7]'}`}><Radio className="w-3.5 h-3.5 text-[#509b6b]" /> Gateway Simulator</button>
        </div>

        {activeTab === 'rest' && (
          <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="px-3 py-1 rounded-lg border border-[#2f3237] bg-[#17191c] text-[#f3f5f7] font-mono text-xs">
            <option value="createMessage">createMessage(roomId, body)</option>
            <option value="kickMember">kickMember(spaceId, userId)</option>
            <option value="listMessages">listMessages(roomId, query)</option>
            <option value="addReaction">addReaction(roomId, messageId, emoji)</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2f3237]">
        <div className="p-6 space-y-4 text-xs">
          <h4 className="font-bold text-[#509b6b] uppercase tracking-wider text-[11px]">{activeTab === 'rest' ? 'Method Parameters' : 'Gateway Connection Payload'}</h4>
          {activeTab === 'rest' ? (
            <div className="space-y-3">
              {(method === 'createMessage' || method === 'listMessages' || method === 'addReaction') && (
                <div>
                  <label className="block font-semibold mb-1 text-[#f3f5f7]">Room ID</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:border-[#509b6b] outline-none"
                  />
                </div>
              )}
              {method === 'createMessage' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#f3f5f7]">Message Plaintext</label>
                  <input
                    type="text"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] text-xs focus:border-[#509b6b] outline-none"
                  />
                </div>
              )}
              {method === 'kickMember' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1 text-[#f3f5f7]">Space ID</label>
                    <input
                      type="text"
                      value={spaceId}
                      onChange={(e) => setSpaceId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#f3f5f7]">Target User ID</label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                </>
              )}
              {method === 'addReaction' && (
                <>
                  <div>
                    <label className="block font-semibold mb-1 text-[#f3f5f7]">Message ID</label>
                    <input
                      type="text"
                      value={messageId}
                      onChange={(e) => setMessageId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#f3f5f7]">Reaction Emoji</label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] text-xs focus:border-[#509b6b] outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-[#f3f5f7]">Simulated Space ID</label>
                <input
                  type="text"
                  value={spaceId}
                  onChange={(e) => setSpaceId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:border-[#509b6b] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#f3f5f7]">Simulated Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-[#2f3237] bg-[#101114] text-[#f3f5f7] font-mono text-xs focus:border-[#509b6b] outline-none"
                />
              </div>
            </div>
          )}
          <button onClick={executeRequest} disabled={loading} className="w-full py-2 px-4 rounded-xl bg-[#509b6b] hover:bg-[#45875d] text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{loading ? 'Executing...' : 'Simulate Call'}</span>
          </button>
        </div>

        <div className="p-6 bg-[#101114] text-[#f3f5f7] flex flex-col justify-between space-y-4">
          <CodeWindow
            title={activeTab === 'rest' ? `rest.${method}.ts` : 'gateway.connect.ts'}
            lang="ts"
            code={getCodeSnippet()}
            showLineNumbers
          />
          <CodeWindow
            title="Response Payload"
            lang={response ? 'json' : 'ts'}
            code={response ? JSON.stringify(response, null, 2) : '// Click "Simulate Call" to inspect the response payload'}
            showLineNumbers={false}
          />
        </div>
      </div>
    </div>
  );
}
