'use client';

import React, { useState } from 'react';
import { Send, Radio, Code2, Check, Copy, RefreshCw } from 'lucide-react';

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
    if (activeTab === 'ws') return `import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: 'wss://app.strafe.chat/gateway/events',
  token: 'YOUR_BOT_TOKEN',
});

gateway.on('messageCreate', (message, envelope) => {
  console.log('New Gateway Event Received:', message);
});

gateway.connect();`;

    switch (method) {
      case 'createMessage': return `const message = await client.rest.createMessage('${roomId}', {
  plaintext: '${plaintext}',
});`;
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
    <div className="my-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/80 shadow-lg overflow-hidden">
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveTab('rest'); setResponse(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'rest' ? 'bg-sky-500 text-white' : 'text-zinc-500'}`}><Send className="w-3.5 h-3.5" /> REST API Simulator</button>
          <button onClick={() => { setActiveTab('ws'); setResponse(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${activeTab === 'ws' ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}><Radio className="w-3.5 h-3.5" /> Gateway Simulator</button>
        </div>

        {activeTab === 'rest' && (
          <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-xs">
            <option value="createMessage">createMessage(roomId, body)</option>
            <option value="kickMember">kickMember(spaceId, userId)</option>
            <option value="listMessages">listMessages(roomId, query)</option>
            <option value="addReaction">addReaction(roomId, messageId, emoji)</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
        <div className="p-6 space-y-4 text-xs">
          <h4 className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider text-[11px]">{activeTab === 'rest' ? 'Method Parameters' : 'Gateway Connection Payload'}</h4>
          {activeTab === 'rest' && (
            <div className="space-y-3">
              {(method === 'createMessage' || method === 'listMessages' || method === 'addReaction') && (<div><label className="block font-semibold mb-1">Room ID</label><input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs" /></div>)}
              {method === 'createMessage' && (<div><label className="block font-semibold mb-1">Message Plaintext</label><input type="text" value={plaintext} onChange={(e) => setPlaintext(e.target.value)} className="w-full px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs" /></div>)}
            </div>
          )}
          <button onClick={executeRequest} disabled={loading} className="w-full py-2 px-4 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{loading ? 'Executing...' : 'Simulate Call'}</span>
          </button>
        </div>

        <div className="p-6 bg-zinc-950 text-zinc-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2"><span className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Code2 className="w-4 h-4" /> SDK Code</span><button onClick={copySnippet} className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px] flex items-center gap-1">{copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}<span>{copied ? 'Copied' : 'Copy'}</span></button></div>
            <pre className="p-3 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-sky-300 overflow-x-auto"><code>{getCodeSnippet()}</code></pre>
          </div>
          <div>
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-2">Response Payload</span>
            <pre className="p-3 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto min-h-[100px]"><code>{response ? JSON.stringify(response, null, 2) : '// Response output'}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}
