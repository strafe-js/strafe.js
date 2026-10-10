<div align="center">
	<br />
	<p>
		<strong>@strafe-js/strafebot</strong>
	</p>
	<br />
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/v/@strafe-js/strafebot.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/dt/@strafe-js/strafebot.svg?maxAge=3600" alt="npm downloads" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js" alt="License" /></a>
	</p>
</div>

## About

`@strafe-js/strafebot` is a TypeScript module for interacting with the [Strafe Chat](https://strafe.chat) API and Gateway.

- Object-oriented
- Gateway events + REST helpers
- Built-in command handler with permission gates
- Full permission bit table from the official docs

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @strafe-js/strafebot
yarn add @strafe-js/strafebot
pnpm add @strafe-js/strafebot
bun add @strafe-js/strafebot
```

## Example usage

```ts
import { Client, command } from '@strafe-js/strafebot';

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

- [Repository](https://github.com/strafe-js/strafe.js)
- [Strafe docs](https://app.strafe.chat/docs/)
- [npm](https://www.npmjs.com/package/@strafe-js/strafebot)

## License

Apache-2.0
