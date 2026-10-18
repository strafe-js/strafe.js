<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/rest/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>@strafe-js/rest</h1>
	<p>
		<strong>Fetch-based HTTP REST API Client for Strafe Chat with Automatic 429 Rate-Limit Retries</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/rest"><img src="https://img.shields.io/npm/v/@strafe-js/rest.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/rest` is the standalone HTTP REST client for the [Strafe Chat API](https://app.strafe.chat/docs/rest/). It uses Node.js native `fetch` and `FormData`, sends `Bot` and `Bearer` authorization headers, retries `HTTP 429 Too Many Requests` responses using `retry_after` / `Retry-After`, and provides typed methods for Strafe endpoints.

---

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @strafe-js/rest @strafe-js/util
```

---

## Quick Start

```ts
import { REST } from '@strafe-js/rest';

const rest = new REST({
  baseUrl: 'https://app.strafe.chat/api',
  token: process.env.BOT_TOKEN,
  authScheme: 'Bot',
  retries: 3,
});

const me = await rest.getMe();
console.log(`Authenticated as ${me.username} (${me.id})`);

await rest.createMessage('112233445566778899', {
  plaintext: 'Hello from @strafe-js/rest!',
});
```

---

## Constructor Options (`RESTOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `string` | *Required* | Base URL of the Strafe REST API (`https://app.strafe.chat/api`) |
| `token` | `string` | `undefined` | Authentication token (can also be set via `rest.setToken(token)`) |
| `authScheme` | `'Bot' \| 'Bearer'` | `'Bot'` | Prefix for the `Authorization` header |
| `retries` | `number` | `3` | Maximum automatic retries on `HTTP 429` rate-limit responses |
| `userAgent` | `string` | `'strafebot-js/1.2'` | Custom `User-Agent` header |

---

## API Reference

### Low-Level HTTP Methods

- `rest.setToken(token: string): this`: Updates the authentication token at runtime.
- `rest.request<T>(opts: RequestOptions): Promise<T>`: Executes an HTTP request with query serialization, JSON or `FormData` body encoding, and `429` retry handling.
- `rest.get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T>`
- `rest.post<T>(path: string, body?: unknown): Promise<T>`
- `rest.patch<T>(path: string, body?: unknown): Promise<T>`
- `rest.put<T>(path: string, body?: unknown): Promise<T>`
- `rest.delete<T>(path: string, body?: unknown): Promise<T>`

### Users & Spaces

- `rest.getMe(): Promise<User>`: `GET /users/@me`
- `rest.getMySpaces(): Promise<Space[]>`: `GET /users/@me/spaces`
- `rest.getSpaces(): Promise<Space[]>`: `GET /spaces`
- `rest.getSpace(spaceId: Snowflake): Promise<Space>`: `GET /spaces/:spaceId`
- `rest.getSpaceRooms(spaceId: Snowflake): Promise<Room[]>`: `GET /spaces/:spaceId/rooms`
- `rest.getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]>`: `GET /spaces/:spaceId/members`
- `rest.getSpaceMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember>`: `GET /spaces/:spaceId/members/:userId`

### Messages & Reactions

- `rest.createMessage(roomId: Snowflake, body: CreateMessageBody | string): Promise<Message>`: `POST /rooms/:roomId/messages`
- `rest.editMessage(roomId: Snowflake, messageId: Snowflake, body: EditMessageBody | string): Promise<Message>`: `PATCH /rooms/:roomId/messages/:messageId`
- `rest.deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<void>`: `DELETE /rooms/:roomId/messages/:messageId`
- `rest.listMessages(roomId: Snowflake, params?: { limit?: number; before?: Snowflake; after?: Snowflake }): Promise<Message[]>`: `GET /rooms/:roomId/messages`
- `rest.getMessage(roomId: Snowflake, messageId: Snowflake): Promise<Message>`: `GET /rooms/:roomId/messages/:messageId`
- `rest.triggerTyping(roomId: Snowflake): Promise<void>`: `POST /rooms/:roomId/typing`
- `rest.addReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<void>`: `PUT /rooms/:roomId/messages/:messageId/reactions/:emoji`
- `rest.removeReaction(roomId: Snowflake, messageId: Snowflake, emoji: string, userId?: Snowflake): Promise<void>`: `DELETE /rooms/:roomId/messages/:messageId/reactions/:emoji[/:userId]`

### Invites, Moderation & Attachments

- `rest.createInvite(spaceId: Snowflake, opts?: { max_uses?: number; max_age_seconds?: number; max_age?: number; room_id?: Snowflake }): Promise<Invite>`: `POST /spaces/:spaceId/invites`
- `rest.kickMember(spaceId: Snowflake, userId: Snowflake): Promise<void>`: `DELETE /spaces/:spaceId/members/:userId`
- `rest.banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<void>`: `POST /spaces/:spaceId/bans/:userId`
- `rest.uploadAttachment(roomId: Snowflake, file: Blob | Buffer, filename?: string): Promise<Attachment>`: Uploads a binary file via `multipart/form-data` to `POST /rooms/:roomId/attachments`.

---

## Error Handling

Non-2xx responses throw `StrafeError` or `RateLimitError` (from `@strafe-js/util`):

```ts
import { StrafeError, RateLimitError } from '@strafe-js/util';

try {
  await rest.createMessage(roomId, 'Hello!');
} catch (err) {
  if (err instanceof RateLimitError) {
    console.error(`Rate limited! Retry after ${err.retryAfter}s`);
  } else if (err instanceof StrafeError) {
    console.error(`HTTP ${err.status} (${err.code}): ${err.message}`);
  }
}
```

## License

Apache-2.0
