<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="76" height="76" alt="Strafe" />
	</a>
	<h1>Strafe.js</h1>
	<p>
		<strong>TypeScript and Node.js SDK for the Strafe Chat REST API and Stargate WebSocket Gateway</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/v/@strafe-js/strafebot.svg?color=509b6b&label=%40strafe-js%2Fstrafebot" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/dt/@strafe-js/strafebot.svg?color=509b6b" alt="npm downloads" /></a>
		<a href="https://github.com/strafe-js/strafe.js/commits/main"><img src="https://img.shields.io/github/last-commit/strafe-js/strafe.js?color=509b6b&logo=github&logoColor=ffffff" alt="Last commit" /></a>
		<a href="https://github.com/strafe-js/strafe.js/blob/main/LICENSE"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
		<a href="https://app.strafe.chat/docs/"><img src="https://img.shields.io/badge/Strafe.chat-Developers-509b6b" alt="Strafe Developer Docs" /></a>
	</p>
	<p>
		<a href="https://app.strafe.chat/docs/">Getting Started</a> •
		<a href="https://app.strafe.chat/docs/bots/">Bots</a> •
		<a href="https://app.strafe.chat/docs/gateway/">Gateway</a> •
		<a href="https://app.strafe.chat/docs/rest/">REST API</a> •
		<a href="https://app.strafe.chat/docs/permissions/">Permissions</a> •
		<a href="https://app.strafe.chat/docs/oauth2/">OAuth2</a>
	</p>
</div>

---

## About

**Strafe.js** is a modular TypeScript monorepo for building bots, moderation tools, and real-time integrations on [Strafe Chat](https://app.strafe.chat). The primary package is [`@strafe-js/strafebot`](./packages/strafebot), backed by standalone packages for the HTTP REST API, Stargate WebSocket Gateway, payload builders, string formatters, collections, and project scaffolding.

- **Bot Client**: Combines the Gateway WebSocket (`@strafe-js/ws`) and REST client (`@strafe-js/rest`) with live state caches (`spaces`, `rooms`, `spaceRooms`, `members`).
- **Equinox Permission Engine**: Implements the 6-stage Strafe permission calculation (Space Owner, `@everyone` + role bitmasks, `Administrator` short-circuit, room overrides, implicit `ViewRoom` denial, and dependent `SendMessages` flags).
- **Typed Command Framework**: Declarative argument schemas (`string`, `integer`, `number`, `boolean`, `user`, `snowflake`, `attachment`), quote-aware tokenization, per-user cooldowns, and permission guards.
- **Transport Reliability**: Automatic HTTP `429 Retry-After` / `retry_after` backoff and WebSocket `Ping`/`Pong` (`op: 6` / `op: 7`) heartbeats with jittered exponential reconnects.

---

## Instance Endpoints & Vocabulary (`app.strafe.chat`)

Strafe is federated and self-hosted. Each deployment serves its own API under `/api` and WebSocket gateway under `/gateway/events`:

| Service | Default URL (`app.strafe.chat`) | Notes |
| :--- | :--- | :--- |
| **Web Client & OAuth2** | `https://app.strafe.chat` | OAuth2 consent page at `/oauth2/authorize` |
| **REST API Base** | `https://app.strafe.chat/api` | Passed as `apiBase` in `Client` or `baseUrl` in `REST` |
| **Gateway (WebSocket)** | `wss://app.strafe.chat/gateway/events` | Passed as `gatewayUrl` in `Client` or `url` in `Gateway` |
| **CDN** | `https://app.strafe.chat/cdn` | Avatars, space icons, attachments, and custom emoji |

### Strafe Vocabulary

| Strafe Term | Discord Equivalent | Protocol Details |
| :--- | :--- | :--- |
| **Space** | Server / guild | `spaces` in REST paths and Gateway payloads |
| **Room** | Channel | Space text (`type: 0`), voice (`type: 3`), PM (`type: 1`), and group PM (`type: 2`) |
| **Section** | Category | Room of `type: 4` (`RoomType.SpaceSection`) that groups other rooms |
| **Thread** | Thread | Public (`type: 5`) and private (`type: 6`) threads inside a parent room |

---

## Monorepo Packages

| Package | Directory | Description | Install |
| :--- | :--- | :--- | :--- |
| **`@strafe-js/strafebot`** | [`packages/strafebot`](./packages/strafebot) | High-level Bot `Client`, state caches, Equinox permission engine, and `CommandHandler` | `npm i @strafe-js/strafebot` |
| **`create-strafebot`** | [`packages/create-strafe-bot`](./packages/create-strafe-bot) | Interactive CLI to scaffold new bot projects and generate command modules | `npm create strafebot@latest` |
| **`@strafe-js/rest`** | [`packages/@strafe-js/rest`](./packages/@strafe-js/rest) | Fetch-based HTTP REST API client with automatic `429` retries and multipart uploads | `npm i @strafe-js/rest` |
| **`@strafe-js/ws`** | [`packages/@strafe-js/ws`](./packages/@strafe-js/ws) | Persistent WebSocket Gateway client with heartbeating and exponential backoff | `npm i @strafe-js/ws` |
| **`@strafe-js/builders`** | [`packages/@strafe-js/builders`](./packages/@strafe-js/builders) | Fluent `MessageBuilder` and permission bitmask factories (`message`, `permissions`) | `npm i @strafe-js/builders` |
| **`@strafe-js/formatters`** | [`packages/@strafe-js/formatters`](./packages/@strafe-js/formatters) | Mentions (`<@id>`, `<@&id>`, `<#id>`), custom emoji, and Markdown escaping helpers | `npm i @strafe-js/formatters` |
| **`@strafe-js/collection`** | [`packages/@strafe-js/collection`](./packages/@strafe-js/collection) | Extended `Map<K, V>` subclass with functional query methods (`find`, `filter`, `map`) | `npm i @strafe-js/collection` |
| **`@strafe-js/util`** | [`packages/@strafe-js/util`](./packages/@strafe-js/util) | Shared API types, `Permission` flags, `BitField`, `StrafeError`, and `RateLimitError` | `npm i @strafe-js/util` |

---

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @strafe-js/strafebot
yarn add @strafe-js/strafebot
pnpm add @strafe-js/strafebot
bun add @strafe-js/strafebot
```

Or scaffold a new TypeScript bot project interactively:

```sh
npm create strafebot@latest my-bot
# or
npx create-strafebot my-bot
```

---

## How to Use Each Package

### 1. `@strafe-js/strafebot` - Main Bot Client & Command Framework

```ts
import { Client, command, userMention } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API || 'https://app.strafe.chat/api',
  gatewayUrl: process.env.STRAFE_GATEWAY || 'wss://app.strafe.chat/gateway/events',
  prefix: ['!', 's!'],
  owners: ['123456789012345678'],
});

client.commands.registerAll([
  command({
    name: 'ping',
    aliases: ['p'],
    description: 'Replies with pong',
    async run(ctx) {
      await ctx.reply('Pong!');
    },
  }),

  command({
    name: 'ban',
    description: 'Ban a user with typed schema validation',
    guildOnly: true,
    permissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    arguments: {
      target: { type: 'user', required: true, description: 'User ID or @mention' },
      reason: { type: 'string', default: 'No reason provided' },
    },
    async run(ctx) {
      const targetId = ctx.arguments.get('target');
      const reason = ctx.arguments.get('reason');
      await ctx.client.rest.banMember(ctx.spaceId!, targetId, reason);
      await ctx.reply(`Banned ${userMention(targetId)} (Reason: ${reason})`);
    },
  }),
]);

client.on('ready', async (info) => {
  console.log(`Logged in as ${info.user.username} (${info.spaces.length} spaces)`);
  for (const spaceId of client.spaces.keys()) {
    await client.fetchMembers(spaceId);
  }
});

await client.login(process.env.BOT_TOKEN!);
```

#### Raw Event Handling (Without the Command Framework)

```ts
import { Client } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: 'https://app.strafe.chat/api',
  gatewayUrl: 'wss://app.strafe.chat/gateway/events',
});

client.on('ready', (info) => {
  console.log(`Logged in as ${info.user.username}`);
});

client.on('messageCreate', async (msg) => {
  if (!msg.plaintext || msg.sender_id === client.user?.id) return;
  if (msg.plaintext === '!ping') {
    await client.rest.createMessage(msg.room_id, {
      plaintext: 'pong',
      reply_to_id: msg.id,
    });
  }
});

await client.login(process.env.BOT_TOKEN!);
```

---

### 2. `create-strafebot` - Project & Command Scaffolder CLI

```sh
# 1. Scaffold a new bot project interactively
npx create-strafebot my-bot

# 2. Generate new command files inside an existing project (src/commands/<name>.ts)
npx create-strafebot command userinfo
npx create-strafebot command warn --mod     # Includes KickMembers + ManageMessages guards
npx create-strafebot command purge --admin  # Includes Administrator + BanMembers guards
```

---

### 3. `@strafe-js/rest` - Standalone HTTP REST Client

```ts
import { REST } from '@strafe-js/rest';

const rest = new REST({
  baseUrl: 'https://app.strafe.chat/api',
  token: process.env.BOT_TOKEN,
  authScheme: 'Bot',
  retries: 3,
});

const me = await rest.getMe();
await rest.createMessage('112233445566778899', {
  plaintext: `Hello from ${me.username}!`,
});
```

---

### 4. `@strafe-js/ws` - Standalone Gateway WebSocket Client

```ts
import { Gateway } from '@strafe-js/ws';

const gateway = new Gateway({
  url: 'wss://app.strafe.chat/gateway/events',
  token: process.env.BOT_TOKEN!,
  heartbeatIntervalMs: 45_000,
  reconnect: true,
});

gateway.on('ready', (payload) => {
  for (const space of payload.spaces) {
    gateway.subscribe(space.id);
  }
});

gateway.on('messageCreate', (msg) => {
  console.log(`[${msg.room_id}] ${msg.plaintext}`);
});

gateway.connect();
```

---

### 5. `@strafe-js/builders` - Fluent Payload & Permission Builders

```ts
import { message, permissions, permissionMask } from '@strafe-js/builders';

const payload = message()
  .setContent('Important announcement!')
  .setReply('998877665544332211')
  .mentionEveryone(false)
  .toJSON();

const modBits = permissions(['KickMembers', 'BanMembers', 'ManageMessages']);
const combinedMask = permissionMask('ViewRoom', 'SendMessages', modBits);
```

---

### 6. `@strafe-js/formatters` - Mentions, Emoji & Markdown Escaping

```ts
import {
  userMention,
  roleMention,
  roomMention,
  customEmoji,
  customReactionEmoji,
  escapeMarkdown,
} from '@strafe-js/formatters';

userMention('123456789012345678'); // "<@123456789012345678>"
roleMention('123456789012345678'); // "<@&123456789012345678>"
roomMention('123456789012345678'); // "<#123456789012345678>"
customEmoji('wave', '998877665544332211', true); // "<a:wave:998877665544332211>"
customReactionEmoji('998877665544332211'); // "custom:998877665544332211"
escapeMarkdown('**unsafe_input**'); // "\\*\\*unsafe\\_input\\*\\*"
```

---

### 7. `@strafe-js/collection` - Extended `Map<K, V>` Data Structure

```ts
import { Collection } from '@strafe-js/collection';

const users = new Collection<string, { id: string; bot: boolean }>();
users.set('1', { id: '1', bot: false });
users.set('2', { id: '2', bot: true });

const firstHuman = users.find((u) => !u.bot);
const botsOnly = users.filter((u) => u.bot);
const allIds = users.map((u) => u.id);
```

---

### 8. `@strafe-js/util` - BitField, Permissions, Errors & Types

```ts
import { BitField, Permission, isSnowflake } from '@strafe-js/util';

const perms = new BitField(Permission.ViewRoom | Permission.SendMessages);
perms.add('AddReactions', 'AttachFiles');

console.log(perms.has('AddReactions')); // true
console.log(perms.toArray()); // ['ViewRoom', 'SendMessages', 'AddReactions', 'AttachFiles']
console.log(isSnowflake('123456789012345678')); // true
```

---

## Development & Building the Monorepo

```sh
# Install dependencies across all workspaces
npm install

# Build all packages in dependency order
npm run build

# Run the unit test suite (commands + Equinox permission engine)
npm test

# Start the interactive Fumadocs documentation site locally (http://localhost:3000)
npm run docs:dev

# Build the static documentation export (docs/out)
npm run docs:build
```

---

## GitHub Packages & npm Registry

On push to `main` (and on version tags `v*`), GitHub Actions workflows publish packages to both **GitHub Packages** (`https://npm.pkg.github.com`) and the **npm registry** (`https://registry.npmjs.org`).

To install from GitHub Packages instead of npmjs.org:

```ini
# .npmrc
@strafe-js:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

```sh
npm install @strafe-js/strafebot
```

---

## Official Strafe Documentation Links

- [Strafe Developer Documentation (`app.strafe.chat/docs`)](https://app.strafe.chat/docs/)
- [Applications & Install Links](https://app.strafe.chat/docs/applications/)
- [OAuth2 Scopes & Grants](https://app.strafe.chat/docs/oauth2/)
- [Bots & Encryption](https://app.strafe.chat/docs/bots/)
- [Stargate WebSocket Gateway](https://app.strafe.chat/docs/gateway/)
- [REST API & Rate Limits](https://app.strafe.chat/docs/rest/)
- [Permissions Bitmask Table](https://app.strafe.chat/docs/permissions/)
- [GitHub Repository (`strafe-js/strafe.js`)](https://github.com/strafe-js/strafe.js)
- [npm Package (`@strafe-js/strafebot`)](https://www.npmjs.com/package/@strafe-js/strafebot)

## License

[Apache-2.0](./LICENSE)
