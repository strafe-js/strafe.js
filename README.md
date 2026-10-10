<div align="center">
	<br />
	<p>
		<strong>@RUTUJEKWIELKI/strafebot</strong>
	</p>
	<br />
	<p>
		<a href="https://www.npmjs.com/package/@RUTUJEKWIELKI/strafebot"><img src="https://img.shields.io/npm/v/@RUTUJEKWIELKI/strafebot.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@RUTUJEKWIELKI/strafebot"><img src="https://img.shields.io/npm/dt/@RUTUJEKWIELKI/strafebot.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/RUTUJEKWIELKI/strafe-bot/commits/main"><img src="https://img.shields.io/github/last-commit/RUTUJEKWIELKI/strafe-bot?logo=github&logoColor=ffffff" alt="Last commit" /></a>
		<a href="https://github.com/RUTUJEKWIELKI/strafe-bot/blob/main/LICENSE"><img src="https://img.shields.io/github/license/RUTUJEKWIELKI/strafe-bot" alt="License" /></a>
		<a href="https://app.strafe.chat/docs/"><img src="https://img.shields.io/badge/docs-Strafe_API-0ea5e9" alt="Strafe docs" /></a>
	</p>
</div>

## About

This repository contains multiple packages with separate releases. The main library is [`@RUTUJEKWIELKI/strafebot`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/strafebot) — a TypeScript / Node.js module for the [Strafe Chat](https://strafe.chat) REST API and Gateway.

- Object-oriented client
- Gateway + REST in one place
- Command framework with permission checks
- Typed against the live [Strafe developer docs](https://app.strafe.chat/docs/)

## Packages

- [`@RUTUJEKWIELKI/strafebot`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/strafebot) — main client (gateway, REST, commands)
- [`create-strafebot`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/create-strafe-bot) — CLI to scaffold a bot project
- [`@RUTUJEKWIELKI/rest`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/@RUTUJEKWIELKI/rest) — REST API client
- [`@RUTUJEKWIELKI/ws`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/@RUTUJEKWIELKI/ws) — Gateway WebSocket client
- [`@RUTUJEKWIELKI/builders`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/@RUTUJEKWIELKI/builders) — message and permission payload builders
- [`@RUTUJEKWIELKI/collection`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/@RUTUJEKWIELKI/collection) — map-backed collection helper
- [`@RUTUJEKWIELKI/formatters`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/@RUTUJEKWIELKI/formatters) — mentions, emoji, markdown helpers
- [`@RUTUJEKWIELKI/util`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/packages/@RUTUJEKWIELKI/util) — types, permission bits, errors

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @RUTUJEKWIELKI/strafebot
yarn add @RUTUJEKWIELKI/strafebot
pnpm add @RUTUJEKWIELKI/strafebot
bun add @RUTUJEKWIELKI/strafebot
```

Scaffold a project:

```sh
npx create-strafebot my-bot
```

## Example usage

These examples use [ES modules](https://nodejs.org/api/esm.html#enabling).

```ts
import { Client, command } from '@RUTUJEKWIELKI/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API!,      // https://app.strafe.chat/api
  gatewayUrl: process.env.STRAFE_GATEWAY!, // wss://app.strafe.chat/gateway/events
  prefix: '!',
  owners: ['YOUR_USER_ID'],
});

client.commands.register(
  command({
    name: 'ping',
    description: 'Replies with pong',
    async run(ctx) {
      await ctx.reply('pong');
    },
  }),
);

client.commands.register(
  command({
    name: 'kick',
    usage: '<user_id>',
    permissions: ['KickMembers'],
    guildOnly: true,
    minArgs: 1,
    async run(ctx) {
      await client.rest.kickMember(ctx.space!.id, ctx.args[0]!);
      await ctx.reply(`kicked ${ctx.args[0]}`);
    },
  }),
);

client.on('ready', async (user) => {
  console.log(`Logged in as ${user.username}!`);
  for (const id of client.spaces.keys()) {
    await client.fetchMembers(id);
  }
});

await client.login(process.env.BOT_TOKEN!);
```

`client.connect(token)` is an alias of `client.login(token)`.

### Without the command framework

```ts
import { Client } from '@RUTUJEKWIELKI/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API!,
  gatewayUrl: process.env.STRAFE_GATEWAY!,
});

client.on('ready', (user) => {
  console.log(`Logged in as ${user.username}!`);
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

## Links

- [Strafe developer documentation](https://app.strafe.chat/docs/)
- [Bots guide](https://app.strafe.chat/docs/bots/)
- [Gateway](https://app.strafe.chat/docs/gateway/)
- [REST API](https://app.strafe.chat/docs/rest/)
- [Permissions](https://app.strafe.chat/docs/permissions/)
- [GitHub](https://github.com/RUTUJEKWIELKI/strafe-bot)
- [npm](https://www.npmjs.com/package/@RUTUJEKWIELKI/strafebot)



## GitHub Packages

On push to `main` (and on version tags `v*`), workflows publish to the GitHub npm registry.

Install from GitHub Packages:

```sh
# .npmrc
@RUTUJEKWIELKI:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

```sh
npm install @RUTUJEKWIELKI/strafebot
```

> Packages are scoped as `@RUTUJEKWIELKI/*` so they match the GitHub user that owns this repository and can publish to GitHub Packages.

## Contributing

Open an issue or pull request on [GitHub](https://github.com/RUTUJEKWIELKI/strafe-bot). Check existing issues first.

## Help

Stuck on the API surface or gateway behaviour? Use the official [Strafe docs](https://app.strafe.chat/docs/) and the examples under [`examples/`](https://github.com/RUTUJEKWIELKI/strafe-bot/tree/main/examples).

## License

[Apache-2.0](https://github.com/RUTUJEKWIELKI/strafe-bot/blob/main/LICENSE)
