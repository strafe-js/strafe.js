<div align="center">
	<br />
	<p>
		<strong>@strafe-js/strafebot</strong>
	</p>
	<br />
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/v/@strafe-js/strafebot.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/dt/@strafe-js/strafebot.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/strafe-js/strafe.js/commits/main"><img src="https://img.shields.io/github/last-commit/strafe-js/strafe.js?logo=github&logoColor=ffffff" alt="Last commit" /></a>
		<a href="https://github.com/strafe-js/strafe.js/blob/main/LICENSE"><img src="https://img.shields.io/github/license/strafe-js/strafe.js" alt="License" /></a>
		<a href="https://app.strafe.chat/docs/"><img src="https://img.shields.io/badge/docs-Strafe_API-0ea5e9" alt="Strafe docs" /></a>
	</p>
</div>

## About

This repository contains multiple packages with separate releases. The main library is [`@strafe-js/strafebot`](https://github.com/strafe-js/strafe.js/tree/main/packages/strafebot) — a TypeScript / Node.js module for the [Strafe Chat](https://strafe.chat) REST API and Gateway.

- Object-oriented client
- Gateway + REST in one place
- Command framework with permission checks
- Typed against the live [Strafe developer docs](https://app.strafe.chat/docs/)

## Packages

- [`@strafe-js/strafebot`](https://github.com/strafe-js/strafe.js/tree/main/packages/strafebot) — main client (gateway, REST, commands)
- [`create-strafebot`](https://github.com/strafe-js/strafe.js/tree/main/packages/create-strafe-bot) — CLI to scaffold a bot project
- [`@strafe-js/rest`](https://github.com/strafe-js/strafe.js/tree/main/packages/@strafe-js/rest) — REST API client
- [`@strafe-js/ws`](https://github.com/strafe-js/strafe.js/tree/main/packages/@strafe-js/ws) — Gateway WebSocket client
- [`@strafe-js/builders`](https://github.com/strafe-js/strafe.js/tree/main/packages/@strafe-js/builders) — message and permission payload builders
- [`@strafe-js/collection`](https://github.com/strafe-js/strafe.js/tree/main/packages/@strafe-js/collection) — map-backed collection helper
- [`@strafe-js/formatters`](https://github.com/strafe-js/strafe.js/tree/main/packages/@strafe-js/formatters) — mentions, emoji, markdown helpers
- [`@strafe-js/util`](https://github.com/strafe-js/strafe.js/tree/main/packages/@strafe-js/util) — types, permission bits, errors

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @strafe-js/strafebot
yarn add @strafe-js/strafebot
pnpm add @strafe-js/strafebot
bun add @strafe-js/strafebot
```

Scaffold a project:

```sh
npx create-strafebot my-bot
```

## Example usage

These examples use [ES modules](https://nodejs.org/api/esm.html#enabling).

```ts
import { Client, command } from '@strafe-js/strafebot';

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
import { Client } from '@strafe-js/strafebot';

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
- [GitHub](https://github.com/strafe-js/strafe.js)
- [npm](https://www.npmjs.com/package/@strafe-js/strafebot)



## GitHub Packages

On push to `main` (and on version tags `v*`), workflows publish to the GitHub npm registry.

Install from GitHub Packages:

```sh
# .npmrc
@strafe-js:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

```sh
npm install @strafe-js/strafebot
```

> Packages are scoped as `@strafe-js/*` so they match the GitHub user that owns this repository and can publish to GitHub Packages.

## Contributing

Open an issue or pull request on [GitHub](https://github.com/strafe-js/strafe.js). Check existing issues first.

## Help

Stuck on the API surface or gateway behaviour? Use the official [Strafe docs](https://app.strafe.chat/docs/) and the examples under [`examples/`](https://github.com/strafe-js/strafe.js/tree/main/examples).

## License

[Apache-2.0](https://github.com/strafe-js/strafe.js/blob/main/LICENSE)
