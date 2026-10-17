<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>@strafe-js/strafebot</h1>
	<p>
		<strong>High-level TypeScript Bot Client, State Cache, Permission Engine & Command Framework for Strafe Chat</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/v/@strafe-js/strafebot.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/@strafe-js/strafebot"><img src="https://img.shields.io/npm/dt/@strafe-js/strafebot.svg?color=509b6b" alt="npm downloads" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
		<a href="https://app.strafe.chat/docs/"><img src="https://img.shields.io/badge/Strafe.chat-Developers-509b6b" alt="Strafe Developer Docs" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/strafebot` is the primary all-in-one SDK for building bots on [Strafe Chat](https://app.strafe.chat). It integrates `@strafe-js/rest`, `@strafe-js/ws`, `@strafe-js/collection`, and `@strafe-js/util` into a single `Client` with:

- **Automatic Entity Caching**: Live `Collection` caches for `spaces`, `rooms`, `spaceRooms`, and `members`.
- **Equinox Permission Engine**: Full 6-stage hierarchical permission resolution (`client.resolveMemberPermissions()`).
- **Command Framework**: Prefix matching, quote-aware argument tokenization, typed `ArgumentsSchema` validation, cooldowns, and permission/ownership guards.
- **Re-exported Ecosystem**: Conveniently re-exports `@strafe-js/util`, `@strafe-js/collection`, `@strafe-js/rest`, and `@strafe-js/ws`.

---

## Installation

**Node.js 18 or newer is required.**

```sh
npm install @strafe-js/strafebot
yarn add @strafe-js/strafebot
pnpm add @strafe-js/strafebot
bun add @strafe-js/strafebot
```

---

## Quick Start

```ts
import { Client, command } from '@strafe-js/strafebot';

const client = new Client({
  apiBase: process.env.STRAFE_API || 'https://app.strafe.chat/api',
  gatewayUrl: process.env.STRAFE_GATEWAY || 'wss://app.strafe.chat/gateway/events',
  prefix: '!',
  owners: ['123456789012345678'],
});

client.commands.register(
  command({
    name: 'ping',
    aliases: ['latency'],
    description: 'Check if the bot is responsive',
    cooldown: 3000,
    async run(ctx) {
      await ctx.reply('Pong!');
    },
  }),
);

client.on('ready', async (info) => {
  console.log(`Logged in as ${info.user.username} (${info.user.id})`);
  for (const spaceId of client.spaces.keys()) {
    await client.fetchMembers(spaceId);
  }
});

await client.login(process.env.BOT_TOKEN!);
```

---

## `Client` API Reference

### `new Client(options: ClientOptions)`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiBase` | `string` | *Required* | Base URL for the Strafe REST API (`https://app.strafe.chat/api`) |
| `gatewayUrl` | `string` | *Required* | WebSocket URL for the Strafe Gateway (`wss://app.strafe.chat/gateway/events`) |
| `token` | `string` | `undefined` | Bot token (can also be passed to `client.login(token)`) |
| `authScheme` | `'Bot' \| 'Bearer'` | `'Bot'` | HTTP & Gateway authorization header scheme |
| `prefix` | `string \| string[]` | `undefined` | Command prefix(es) passed to `client.commands` |
| `owners` | `Snowflake[]` | `[]` | User IDs permitted to invoke `botOwnerOnly` commands |
| `autoSubscribeSpaces` | `boolean` | `true` | Automatically subscribe to all spaces received in `READY` |
| `heartbeatIntervalMs` | `number` | `45000` | Interval between Gateway `Ping` frames in milliseconds |

### Properties & State Caches

- `client.rest: REST`: Underlying HTTP REST client.
- `client.gateway: Gateway`: Underlying WebSocket Gateway client.
- `client.commands: CommandHandler`: Built-in command registry and dispatcher.
- `client.user: User | null`: Authenticated bot user (populated on `ready`).
- `client.spaces: Collection<Snowflake, Space>`: Cached spaces.
- `client.rooms: Collection<Snowflake, Room>`: Cached rooms by room ID.
- `client.spaceRooms: Collection<Snowflake, Collection<Snowflake, Room>>`: Rooms grouped by space ID.
- `client.members: Collection<Snowflake, Collection<Snowflake, SpaceMember>>`: Members grouped by space ID.

### Methods

- `await client.login(token?: string)` (alias: `client.connect(token)`): Connects to the Gateway and starts listening for events.
- `await client.fetchMembers(spaceId: Snowflake)`: Fetches all members of a space from REST and caches them in `client.members`.
- `await client.fetchMember(spaceId: Snowflake, userId: Snowflake)`: Fetches and caches a single member with in-flight request deduplication.
- `client.getMember(spaceId: Snowflake, userId: Snowflake)`: Synchronously reads a cached `SpaceMember`.
- `client.resolveMemberPermissions(userId: Snowflake, spaceId?: Snowflake, roomId?: Snowflake): BitField`: Resolves effective permissions using the 6-stage Equinox permission engine.
- `client.destroy()`: Disconnects the Gateway WebSocket and removes all listeners.

---

## Command Framework (`CommandHandler`, `command`, `Context`)

### Typed Argument Schemas (`arguments`)

Commands support strongly-typed argument schemas with automatic validation, default values, range bounds (`min`/`max`), `choices`, and `rest` capture:

```ts
import { command } from '@strafe-js/strafebot';

export const slowmodeCommand = command({
  name: 'roll',
  description: 'Roll a die with custom sides and multiplier',
  guildOnly: true,
  permissions: ['SendMessages'],
  botPermissions: ['SendMessages'],
  arguments: {
    sides: { type: 'integer', min: 2, max: 1000, default: 6 },
    label: { type: 'string', rest: true, default: 'Standard Roll' },
  },
  async run(ctx) {
    const sides = ctx.arguments.get('sides'); // number
    const label = ctx.arguments.get('label'); // string
    const rolled = Math.floor(Math.random() * sides) + 1;
    await ctx.reply(`**${label}**: rolled **${rolled}** (1..${sides})`);
  },
});
```

Supported argument types:
- `'string'` (`string`): supports `choices`
- `'integer'` (`number`): whole integers, supports `min`/`max` value, `choices`
- `'number'` (`number`): floating-point numbers, supports `min`/`max` value, `choices`
- `'boolean'` (`boolean`): accepts `true/false`, `yes/no`, `1/0`, `y/n`
- `'user'` (`Snowflake`): accepts `<@id>`, `<@!id>`, or raw 16..20 digit Snowflake IDs
- `'snowflake'` (`Snowflake`): validates 16..20 digit Snowflake IDs
- `'attachment'` (`Attachment`): consumes uploaded files from `ctx.message.attachments`

### `Context` Helpers

Inside `run(ctx)`:
- `ctx.arguments.get(name)`: Retrieve a validated schema argument.
- `ctx.args`: Raw tokenized string arguments (`string[]`).
- `ctx.authorId`, `ctx.author`, `ctx.roomId`, `ctx.spaceId`, `ctx.member`, `ctx.botMember`.
- `await ctx.reply(content, extra?)`: Reply directly to the command message.
- `await ctx.send(content, extra?)`: Send a message to the same room without a reply reference.
- `await ctx.react(emoji)`: React to the command message.
- `await ctx.typing()`: Trigger typing indicator in the room.
- `ctx.hasPermissions(required)` / `ctx.hasBotPermissions(required)`: Check caller or bot permissions in the current room.
- `ctx.isBotOwner()` / `ctx.isSpaceOwner()`: Check ownership status.

### Command Guard Events

Listen on `client` to customize feedback when a command is blocked:

```ts
client.on('commandPermissionDenied', (ctx, cmd) => {
  void ctx.reply(`You lack permissions to run \`${cmd.name}\`.`);
});

client.on('commandBotPermissionDenied', (ctx, cmd, missing) => {
  void ctx.reply(`I am missing permissions: ${missing.toArray().join(', ')}`);
});

client.on('commandCooldown', (ctx, cmd, remainingMs) => {
  void ctx.reply(`Please wait ${(remainingMs / 1000).toFixed(1)}s before reusing \`${cmd.name}\`.`);
});

client.on('commandInvalidArguments', (ctx, cmd, err) => {
  void ctx.reply(`Invalid argument: ${err.message}`);
});
```

---

## Links

- [Monorepo Repository](https://github.com/strafe-js/strafe.js)
- [Strafe Developer Docs](https://app.strafe.chat/docs/)
- [npm Package](https://www.npmjs.com/package/@strafe-js/strafebot)

## License

Apache-2.0
