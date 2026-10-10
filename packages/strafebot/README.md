<div align="center">
	<br />
	<p>
		<strong>@RUTUJEKWIELKI/strafebot</strong>
	</p>
	<br />
	<p>
		<a href="https://www.npmjs.com/package/@RUTUJEKWIELKI/strafebot"><img src="https://img.shields.io/npm/v/@RUTUJEKWIELKI/strafebot.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@RUTUJEKWIELKI/strafebot"><img src="https://img.shields.io/npm/dt/@RUTUJEKWIELKI/strafebot.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/RUTUJEKWIELKI/strafe-bot"><img src="https://img.shields.io/github/license/RUTUJEKWIELKI/strafe-bot" alt="License" /></a>
	</p>
</div>

## About

`@RUTUJEKWIELKI/strafebot` is a TypeScript module for interacting with the [Strafe Chat](https://strafe.chat) API and Gateway.

- Object-oriented
- Gateway events + REST helpers
- Built-in command handler with permission gates
- Full permission bit table from the official docs

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @RUTUJEKWIELKI/strafebot
yarn add @RUTUJEKWIELKI/strafebot
pnpm add @RUTUJEKWIELKI/strafebot
bun add @RUTUJEKWIELKI/strafebot
```

## Example usage

```ts
import { Client, command } from '@RUTUJEKWIELKI/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API!,
  gatewayUrl: process.env.STRAFE_GATEWAY!,
  prefix: '!',
});

client.commands.register(
  command({
    name: 'ping',
    async run(ctx) {
      await ctx.reply('pong');
    },
  }),
);

client.on('ready', (user) => {
  console.log(`Logged in as ${user.username}!`);
});

await client.login(process.env.BOT_TOKEN!);
```

## Links

- [Repository](https://github.com/RUTUJEKWIELKI/strafe-bot)
- [Strafe docs](https://app.strafe.chat/docs/)
- [npm](https://www.npmjs.com/package/@RUTUJEKWIELKI/strafebot)

## License

Apache-2.0
