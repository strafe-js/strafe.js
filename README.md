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
		<a href="https://strafe-js.github.io/strafe.js/"><img src="https://img.shields.io/badge/SDK_Docs-strafe--js.github.io-509b6b?style=flat-square" alt="Strafe.js SDK Docs" /></a>
		<a href="https://app.strafe.chat/docs/"><img src="https://img.shields.io/badge/Platform_Docs-app.strafe.chat-2a2f39?style=flat-square" alt="Strafe Platform Docs" /></a>
		<a href="https://github.com/strafe-js/strafe.js/blob/main/LICENSE"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?style=flat-square&color=509b6b" alt="License" /></a>
	</p>
</div>

---

## OAuth2 (server-side)

```ts
import { OAuth2Client } from '@strafe-js/strafebot';

const oauth = new OAuth2Client({
  clientId: process.env.STRAFE_CLIENT_ID!,
  clientSecret: process.env.STRAFE_CLIENT_SECRET!,
  redirectUri: 'https://example.com/callback',
});

const state = oauth.generateState(); // store in session
const url = oauth.getAuthorizationUrl({ scope: ['identify', 'email'], state });
// after callback:
const tokens = await oauth.exchangeCode(code);
const user = await oauth.getUser(tokens.access_token);
```

Never put the client secret in browser code. See `examples/oauth-server.ts`.

---

## About

**Strafe.js** is a modular TypeScript monorepo for building bots and integrations on [Strafe Chat](https://app.strafe.chat). The main package is `@strafe-js/strafebot`.

- **Client**: Gateway + REST, caches (`spaces`, `rooms`, `members`), collectors
- **Equinox permissions**: 6-stage bitmask resolution
- **Commands**: typed args, cooldowns, permission guards, middleware
- **Transport**: HTTP 429 retries (per-route buckets), WebSocket heartbeat + reconnect

SDK docs: **[strafe-js.github.io/strafe.js](https://strafe-js.github.io/strafe.js/)**

---

## Installation

**Node.js 18+**

```sh
npm install @strafe-js/strafebot
# or
npm create strafebot@latest my-bot
```

## Quick bot

```ts
import { Client, command, createHelpCommand } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API || 'https://app.strafe.chat/api',
  gatewayUrl: process.env.STRAFE_GATEWAY || 'wss://app.strafe.chat/gateway/events',
  prefix: ['!', 's!'],
});

client.commands.registerAll([
  createHelpCommand({ title: '**Bot Commands**' }),
  command({
    name: 'ping',
    async run(ctx) {
      await ctx.reply('Pong!');
    },
  }),
  command({
    name: 'ban',
    guildOnly: true,
    permissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    arguments: {
      target: { type: 'user', required: true },
      reason: { type: 'string', rest: true, default: 'No reason provided' },
    },
    async run(ctx) {
      const targetId = ctx.arguments.get('target') as string;
      if (!ctx.canModerate(targetId)) {
        await ctx.reply('You cannot moderate that member.');
        return;
      }
      await ctx.ban(targetId, ctx.arguments.get('reason') as string);
      await ctx.reply(`Banned <@${targetId}>`);
    },
  }),
]);

client.on('ready', async (info) => {
  console.log(`Logged in as ${info.user.username}`);
  for (const spaceId of client.spaces.keys()) {
    await client.fetchMembers(spaceId);
  }
});

await client.login(process.env.BOT_TOKEN!);
```

## Packages

| Package | Description |
| :--- | :--- |
| `@strafe-js/strafebot` | Bot client, commands, permissions |
| `@strafe-js/rest` | HTTP client + OAuth2Client |
| `@strafe-js/ws` | Gateway WebSocket |
| `@strafe-js/builders` | Message / permission / OAuth URL builders |
| `@strafe-js/formatters` | Mentions, markdown helpers |
| `@strafe-js/collection` | Extended Map |
| `@strafe-js/util` | Types, Permission flags, errors |
| `create-strafebot` | Project scaffold CLI |

## Endpoints

| Service | Default |
| :--- | :--- |
| REST | `https://app.strafe.chat/api` |
| Gateway | `wss://app.strafe.chat/gateway/events` |

## Development

```sh
npm install
npm run build
npm test
```

## License

[Apache-2.0](./LICENSE)
