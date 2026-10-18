<div align="center">
	<br />
	<a href="https://strafe-js.github.io/strafe.js/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="84" height="84" alt="Strafe.js" />
	</a>
	<h1>Strafe.js</h1>
	<p>
		<strong>TypeScript and Node.js SDK for the Strafe Chat REST API and Stargate WebSocket Gateway</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/v/@strafe-js/strafebot.svg?style=flat-square&color=509b6b&label=%40strafe-js%2Fstrafebot" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/dt/@strafe-js/strafebot.svg?style=flat-square&color=509b6b" alt="npm downloads" /></a>
		<a href="https://strafe-js.github.io/strafe.js/"><img src="https://img.shields.io/badge/SDK_Docs-strafe--js.github.io-509b6b?style=flat-square&logo=read-the-docs&logoColor=ffffff" alt="Strafe.js SDK Docs" /></a>
		<a href="https://app.strafe.chat/docs/"><img src="https://img.shields.io/badge/Platform_Docs-app.strafe.chat-2a2f39?style=flat-square" alt="Strafe Platform Docs" /></a>
		<a href="https://github.com/strafe-js/strafe.js/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/strafe-js/strafe.js/ci.yml?branch=main&style=flat-square&color=509b6b&label=CI" alt="CI status" /></a>
		<a href="https://github.com/strafe-js/strafe.js/blob/main/LICENSE"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?style=flat-square&color=509b6b" alt="License" /></a>
	</p>
	<p>
		<a href="https://strafe-js.github.io/strafe.js/"><strong>SDK Home</strong></a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/guides/getting-started/">Getting Started</a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/strafebot/client/">Bot Client</a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/commands/overview/">Commands</a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/rest/overview/">REST API</a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/ws/overview/">Gateway</a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/packages/overview/">Packages</a> •
		<a href="https://strafe-js.github.io/strafe.js/docs/tools/permission-calculator/">Interactive Tools</a>
	</p>
</div>

---

## About

**Strafe.js** is a modular TypeScript monorepo for building bots, moderation tools, and real-time integrations on [Strafe Chat](https://app.strafe.chat). The primary package is [`@strafe-js/strafebot`](./packages/strafebot), backed by standalone packages for the HTTP REST API, Stargate WebSocket Gateway, payload builders, string formatters, collections, and project scaffolding.

Full SDK documentation, package guides, and interactive developer tools are hosted at **[strafe-js.github.io/strafe.js](https://strafe-js.github.io/strafe.js/)**.

- **Bot Client**: Combines the Gateway WebSocket (`@strafe-js/ws`) and REST client (`@strafe-js/rest`) with live state caches (`spaces`, `rooms`, `spaceRooms`, `members`) and message/reaction collectors (`awaitMessages`, `awaitReactions`).
- **Equinox Permission Engine**: Implements the 6-stage Strafe permission calculation (Space Owner, `@everyone` + role bitmasks, `Administrator` short-circuit, room overrides, implicit `ViewRoom` denial, and dependent `SendMessages` flags).
- **Typed Command Framework**: Declarative argument schemas (`string`, `integer`, `number`, `boolean`, `user`, `room`, `role`, `snowflake`, `attachment`), quote-aware tokenization, `rest` capture, `@mention` prefix support, middleware (`commands.use`), per-user cooldowns, permission guards, and built-in help generation (`createHelpCommand`).
- **Transport Reliability**: Automatic HTTP `429 Retry-After` / `retry_after` backoff and WebSocket `Ping`/`Pong` (`op: 6` / `op: 7`) heartbeats with jittered exponential reconnects.

---

## Monorepo Packages

| Package | Directory | SDK Documentation | Description | Install |
| :--- | :--- | :--- | :--- | :--- |
| **`@strafe-js/strafebot`** | [`packages/strafebot`](./packages/strafebot) | [Client](https://strafe-js.github.io/strafe.js/docs/strafebot/client/) / [Commands](https://strafe-js.github.io/strafe.js/docs/commands/overview/) | High-level Bot `Client`, state caches, Equinox permission engine, and `CommandHandler` | `npm i @strafe-js/strafebot` |
| **`create-strafebot`** | [`packages/create-strafe-bot`](./packages/create-strafe-bot) | [CLI Guide](https://strafe-js.github.io/strafe.js/docs/cli/overview/) | Interactive CLI to scaffold new bot projects and generate command modules | `npm create strafebot@latest` |
| **`@strafe-js/rest`** | [`packages/@strafe-js/rest`](./packages/@strafe-js/rest) | [REST Reference](https://strafe-js.github.io/strafe.js/docs/rest/overview/) | Fetch-based HTTP REST API client with automatic `429` retries and multipart uploads | `npm i @strafe-js/rest` |
| **`@strafe-js/ws`** | [`packages/@strafe-js/ws`](./packages/@strafe-js/ws) | [Gateway Reference](https://strafe-js.github.io/strafe.js/docs/ws/overview/) | Persistent WebSocket Gateway client with heartbeating and exponential backoff | `npm i @strafe-js/ws` |
| **`@strafe-js/builders`** | [`packages/@strafe-js/builders`](./packages/@strafe-js/builders) | [Builders Docs](https://strafe-js.github.io/strafe.js/docs/packages/builders/) | Fluent `MessageBuilder` and permission bitmask factories (`message`, `permissions`) | `npm i @strafe-js/builders` |
| **`@strafe-js/formatters`** | [`packages/@strafe-js/formatters`](./packages/@strafe-js/formatters) | [Formatters Docs](https://strafe-js.github.io/strafe.js/docs/packages/formatters/) | Mentions (`<@id>`, `<@&id>`, `<#id>`), custom emoji, and Markdown escaping helpers | `npm i @strafe-js/formatters` |
| **`@strafe-js/collection`** | [`packages/@strafe-js/collection`](./packages/@strafe-js/collection) | [Collection Docs](https://strafe-js.github.io/strafe.js/docs/packages/collection/) | Extended `Map<K, V>` subclass with functional query methods (`find`, `filter`, `map`) | `npm i @strafe-js/collection` |
| **`@strafe-js/util`** | [`packages/@strafe-js/util`](./packages/@strafe-js/util) | [Util & BitField](https://strafe-js.github.io/strafe.js/docs/packages/util/) | Shared API types, `Permission` flags, `BitField`, `StrafeError`, and `RateLimitError` | `npm i @strafe-js/util` |

---

## Interactive Documentation & Tools (`strafe-js.github.io/strafe.js`)

The [`docs/`](./docs) workspace powers the static documentation portal at **[https://strafe-js.github.io/strafe.js/](https://strafe-js.github.io/strafe.js/)**, including browser-based developer tools:

| Tool / Guide | URL | Capability |
| :--- | :--- | :--- |
| **Documentation Home** | [`/strafe.js/docs/`](https://strafe-js.github.io/strafe.js/docs/) | Architecture overview, package topology, and protocol quick reference |
| **Getting Started Guide** | [`/docs/guides/getting-started/`](https://strafe-js.github.io/strafe.js/docs/guides/getting-started/) | Step-by-step bot setup, token configuration, and Gateway subscription |
| **Equinox Permission Calculator** | [`/docs/tools/permission-calculator/`](https://strafe-js.github.io/strafe.js/docs/tools/permission-calculator/) | Interactive 28-bit bitmask builder and 6-stage room override simulator |
| **OAuth2 & Bot Invite Generator** | [`/docs/tools/oauth2-generator/`](https://strafe-js.github.io/strafe.js/docs/tools/oauth2-generator/) | Construct `/oauth2/authorize` consent and bot installation URLs with scope presets |
| **Command Builder** | [`/docs/tools/command-builder/`](https://strafe-js.github.io/strafe.js/docs/tools/command-builder/) | Visual generator for `@strafe-js/strafebot` typed `command()` definitions |
| **REST API Playground** | [`/docs/tools/api-playground/`](https://strafe-js.github.io/strafe.js/docs/tools/api-playground/) | Inspect HTTP routes, request payloads, and generated `@strafe-js/rest` snippets |

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

## How to Use Each Package

### 1. `@strafe-js/strafebot` - Main Bot Client & Command Framework

Docs: [Bot Client](https://strafe-js.github.io/strafe.js/docs/strafebot/client/) • [Events](https://strafe-js.github.io/strafe.js/docs/strafebot/events/) • [Commands](https://strafe-js.github.io/strafe.js/docs/commands/overview/) • [Arguments](https://strafe-js.github.io/strafe.js/docs/commands/arguments/)

```ts
import { Client, command, createHelpCommand, userMention } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API || 'https://app.strafe.chat/api',
  gatewayUrl: process.env.STRAFE_GATEWAY || 'wss://app.strafe.chat/gateway/events',
  prefix: ['!', 's!'],
  owners: ['123456789012345678'],
});

client.commands.use(async (ctx, next) => {
  console.log(`[CMD] ${ctx.commandName} invoked by ${ctx.authorId}`);
  await next();
});

client.commands.registerAll([
  createHelpCommand({ title: '**Bot Commands**' }),

  command({
    name: 'ping',
    aliases: ['p'],
    category: 'utility',
    description: 'Replies with pong',
    async run(ctx) {
      await ctx.reply('Pong!');
    },
  }),

  command({
    name: 'ban',
    category: 'moderation',
    description: 'Ban a user with typed schema validation',
    guildOnly: true,
    permissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    arguments: {
      target: { type: 'user', required: true, description: 'User ID or @mention' },
      reason: { type: 'string', rest: true, default: 'No reason provided' },
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

Docs: [CLI Documentation](https://strafe-js.github.io/strafe.js/docs/cli/overview/)

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

Docs: [REST API Overview](https://strafe-js.github.io/strafe.js/docs/rest/overview/)

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

Docs: [Gateway Overview](https://strafe-js.github.io/strafe.js/docs/ws/overview/)

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

Docs: [Builders Documentation](https://strafe-js.github.io/strafe.js/docs/packages/builders/)

```ts
import {
  message,
  permissions,
  permissionMask,
  permissionOverwrite,
} from '@strafe-js/builders';

const payload = message()
  .setContent('Important announcement!')
  .appendContent('Please review the updated rules.', '\n')
  .setReply('998877665544332211')
  .addUserMention('123456789012345678')
  .mentionEveryone(false)
  .toJSON();

const modBits = permissions(['KickMembers', 'BanMembers', 'ManageMessages']);
const combinedMask = permissionMask('ViewRoom', 'SendMessages', modBits);

const roomOverride = permissionOverwrite()
  .setRole('234567890123456789')
  .allow('ViewRoom', 'ReadMessageHistory')
  .deny('SendMessages')
  .toJSON();
```

---

### 6. `@strafe-js/formatters` - Mentions, Emoji & Markdown Escaping

Docs: [Formatters Documentation](https://strafe-js.github.io/strafe.js/docs/packages/formatters/)

```ts
import {
  userMention,
  roleMention,
  roomMention,
  customEmoji,
  customReactionEmoji,
  escapeMarkdown,
  bold,
  italic,
  inlineCode,
  codeBlock,
  spoiler,
  quote,
  hyperlink,
} from '@strafe-js/formatters';

userMention('123456789012345678'); // "<@123456789012345678>"
roleMention('123456789012345678'); // "<@&123456789012345678>"
roomMention('123456789012345678'); // "<#123456789012345678>"
customEmoji('wave', '998877665544332211', true); // "<a:wave:998877665544332211>"
customReactionEmoji('998877665544332211'); // "custom:998877665544332211"
escapeMarkdown('**unsafe_input**'); // "\\*\\*unsafe\\_input\\*\\*"
bold('Notice'); // "**Notice**"
italic('subtle'); // "*subtle*"
inlineCode('npm test'); // "`npm test`"
codeBlock('const ok = true;', 'ts'); // "```ts\nconst ok = true;\n```"
spoiler('hidden'); // "||hidden||"
quote('quoted line'); // "> quoted line"
hyperlink('Strafe Docs', 'https://app.strafe.chat/docs'); // "[Strafe Docs](https://app.strafe.chat/docs)"
```

---

### 7. `@strafe-js/collection` - Extended `Map<K, V>` Data Structure

Docs: [Collection Documentation](https://strafe-js.github.io/strafe.js/docs/packages/collection/)

```ts
import { Collection } from '@strafe-js/collection';

const users = new Collection<string, { id: string; bot: boolean }>();
users.set('1', { id: '1', bot: false });
users.set('2', { id: '2', bot: true });

const firstHuman = users.find((u) => !u.bot);
const botsOnly = users.filter((u) => u.bot);
const [bots, humans] = users.partition((u) => u.bot);
const randomUser = users.random();
const allIds = users.map((u) => u.id);
```

---

### 8. `@strafe-js/util` - BitField, Permissions, Errors & Types

Docs: [Util & BitField Documentation](https://strafe-js.github.io/strafe.js/docs/packages/util/)

```ts
import {
  BitField,
  Permission,
  isSnowflake,
  deconstructSnowflake,
} from '@strafe-js/util';

const perms = new BitField(Permission.ViewRoom | Permission.SendMessages);
perms.add('AddReactions', 'AttachFiles');

console.log(perms.has('AddReactions')); // true
console.log(perms.toArray()); // ['ViewRoom', 'SendMessages', 'AddReactions', 'AttachFiles']
console.log(isSnowflake('123456789012345678')); // true
console.log(deconstructSnowflake('2104652899186380800').date.toISOString());
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

## Documentation & Resources

### Strafe.js SDK Documentation (`strafe-js.github.io/strafe.js`)

- [Strafe.js SDK Landing Page](https://strafe-js.github.io/strafe.js/)
- [Documentation Index & Architecture](https://strafe-js.github.io/strafe.js/docs/)
- [Getting Started with `@strafe-js/strafebot`](https://strafe-js.github.io/strafe.js/docs/guides/getting-started/)
- [Equinox Permissions & Overrides Guide](https://strafe-js.github.io/strafe.js/docs/guides/permissions/)
- [OAuth2 Flows & Token Exchange Guide](https://strafe-js.github.io/strafe.js/docs/guides/oauth2/)
- [E2EE Messaging & Web Push Guide](https://strafe-js.github.io/strafe.js/docs/guides/e2ee-and-push/)
- [Bot Client Reference](https://strafe-js.github.io/strafe.js/docs/strafebot/client/)
- [Gateway Events Reference](https://strafe-js.github.io/strafe.js/docs/strafebot/events/)
- [Command Framework & Typed Arguments](https://strafe-js.github.io/strafe.js/docs/commands/overview/)
- [Interactive Permission Calculator](https://strafe-js.github.io/strafe.js/docs/tools/permission-calculator/)
- [Interactive OAuth2 URL Generator](https://strafe-js.github.io/strafe.js/docs/tools/oauth2-generator/)
- [Interactive Command Builder](https://strafe-js.github.io/strafe.js/docs/tools/command-builder/)
- [Interactive REST API Playground](https://strafe-js.github.io/strafe.js/docs/tools/api-playground/)

### Official Strafe Platform Documentation (`app.strafe.chat/docs`)

- [Strafe Developer Portal (`app.strafe.chat/docs`)](https://app.strafe.chat/docs/)
- [Applications & Install Links](https://app.strafe.chat/docs/applications/)
- [OAuth2 Scopes & Grants](https://app.strafe.chat/docs/oauth2/)
- [Bots & Encryption](https://app.strafe.chat/docs/bots/)
- [Stargate WebSocket Gateway Protocol](https://app.strafe.chat/docs/gateway/)
- [REST API & Rate Limits](https://app.strafe.chat/docs/rest/)
- [Permissions Bitmask Specification](https://app.strafe.chat/docs/permissions/)

### Package & Source Links

- [GitHub Repository (`strafe-js/strafe.js`)](https://github.com/strafe-js/strafe.js)
- [npm Package (`@strafe-js/strafebot`)](https://www.npmjs.com/package/@strafe-js/strafebot)

## License

[Apache-2.0](./LICENSE)
