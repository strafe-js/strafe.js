<div align="center">
	<br />
	<h1>@strafe-js/ws</h1>
	<p>
		<strong>Persistent WebSocket Gateway Client for Strafe Chat with Heartbeating & Exponential Backoff</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/ws"><img src="https://img.shields.io/npm/v/@strafe-js/ws.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/ws` provides the `Gateway` class for maintaining a real-time WebSocket connection to the [Strafe Chat Gateway](https://app.strafe.chat/docs/gateway/). It handles:

- **Automatic Heartbeating**: Sends `GatewayOp.Ping` (`op: 6`) every `heartbeatIntervalMs` (default `45,000` ms).
- **Resilient Reconnection**: Automatically reconnects on unexpected disconnects using exponential backoff with random jitter (`0–1000ms`).
- **Event Normalization**: Converts `SNAKE_CASE` gateway events (e.g. `MESSAGE_CREATE`, `SPACE_MEMBER_ADD`) into `camelCase` Node `EventEmitter` events (`messageCreate`, `spaceMemberAdd`) while preserving `room_id` and `space_id` context on the payload.

---

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @strafe-js/ws @strafe-js/util
```

---

## Quick Start

```ts
import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: 'wss://app.strafe.chat/gateway/events',
  token: process.env.BOT_TOKEN!,
  authScheme: 'Bot',
  heartbeatIntervalMs: 45_000,
  reconnect: true,
});

gateway.on('ready', (payload) => {
  console.log(`Connected as ${payload.user.username} (${payload.spaces.length} spaces)`);
  for (const space of payload.spaces) {
    gateway.subscribe(space.id);
  }
});

gateway.on('messageCreate', (msg) => {
  console.log(`[Room ${msg.room_id}] ${msg.plaintext}`);
});

gateway.on('error', (err) => {
  console.error('Gateway error:', err);
});

gateway.connect();
```

---

## Constructor Options (`GatewayOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | *Required* | WebSocket Gateway URL (`wss://app.strafe.chat/gateway/events`) |
| `token` | `string` | *Required* | Authentication token |
| `authScheme` | `'Bot' \| 'Bearer' \| ''` | `'Bot'` | Prefix for the `Authorization` header |
| `heartbeatIntervalMs` | `number` | `45000` | Interval between `Ping` frames in milliseconds |
| `reconnect` | `boolean` | `true` | Automatically reconnect on unexpected close |
| `reconnectDelay` | `number` | `2500` | Initial reconnect backoff delay in milliseconds |
| `maxReconnectDelay` | `number` | `60000` | Maximum reconnect backoff cap in milliseconds |

---

## Methods

- `gateway.connect(): void` — Opens the WebSocket connection to the Gateway.
- `gateway.disconnect(): void` — Disables auto-reconnect, stops the heartbeat timer, and closes the WebSocket cleanly (`code: 1000`).
- `gateway.ping(): void` — Sends a `GatewayOp.Ping` (`op: 6`) frame.
- `gateway.send(op: number, d?: unknown, extra?: Partial<GatewayFrame>): void` — Sends a raw JSON frame over the WebSocket.
- `gateway.subscribe(spaceId: Snowflake): void` — Sends `GatewayOp.Subscribe` (`op: 1`, `{ space_id }`) to receive real-time events for a space.
- `gateway.unsubscribe(spaceId: Snowflake): void` — Sends `GatewayOp.Unsubscribe` (`op: 5`, `{ space_id }`).
- `gateway.sendTyping(roomId: Snowflake): void` — Sends `GatewayOp.Send` (`op: 2`, `t: 'TYPING_START'`).

---

## Emitted Events

- `'open'` `()` — WebSocket connection opened.
- `'ready'` `(payload: ReadyPayload)` — `GatewayOp.Ready` (`op: 4`) received.
- `'pong'` `()` — `GatewayOp.Pong` (`op: 7`) received.
- `'raw'` `(frame: GatewayFrame)` — Emitted for every `GatewayOp.Event` (`op: 3`) frame.
- `'close'` `(code: number, reason: string)` — WebSocket closed.
- `'error'` `(err: Error)` — WebSocket or Gateway error (`op: 8`).
- Normalized `camelCase` events: `'messageCreate'`, `'messageUpdate'`, `'messageDelete'`, `'spaceCreate'`, `'spaceUpdate'`, `'spaceDelete'`, `'roomCreate'`, `'roomUpdate'`, `'roomDelete'`, `'spaceMemberAdd'`, `'spaceMemberUpdate'`, `'spaceMemberRemove'`, `'spaceMembersChunk'`, `'presenceUpdate'`, etc.

## License

Apache-2.0
