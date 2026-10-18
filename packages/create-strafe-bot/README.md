<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>create-strafebot</h1>
	<p>
		<strong>Interactive CLI Project Scaffolder & Command Generator for Strafe.js Bots</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/create-strafebot"><img src="https://img.shields.io/npm/v/create-strafebot.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
	</p>
</div>

---

## Overview

`create-strafebot` is a CLI tool that:

1. **Scaffolds a TypeScript Strafe Chat bot project** with `.env`, `tsconfig.json`, and starter commands (`ping.ts`, `help.ts`, `kick.ts`).
2. **Generates new command modules** (`src/commands/<name>.ts`) inside an existing bot project with optional moderator (`--mod`) or administrator (`--admin`) permission guards.

---

## 1. Scaffolding a New Bot Project

Run the CLI with `npm`, `npx`, `pnpm`, or `bun`:

```sh
npm create strafebot@latest my-bot
# or
npx create-strafebot my-bot
```

### Interactive Prompts

1. **Bot token**: Optional token written into `.env` (`BOT_TOKEN`).
2. **Instance**: Use `app.strafe.chat` (`https://app.strafe.chat/api` and `wss://app.strafe.chat/gateway/events`) or custom self-hosted URLs.
3. **Command prefix**: Default command prefix (default: `!`).
4. **Owner user IDs**: Comma-separated Snowflake IDs for `botOwnerOnly` commands.

### Generated Directory Structure

```text
my-bot/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── loadEnv.ts
    └── commands/
        ├── ping.ts
        ├── help.ts
        └── kick.ts
```

### Running Your Bot

```sh
cd my-bot
npm install
npm run dev
```

---

## 2. Generating Command Files (`command`)

From the root of an existing bot project, generate a new command module in `src/commands/<name>.ts`:

```sh
npx create-strafebot command userinfo
npx create-strafebot command warn --mod
npx create-strafebot command purge --admin
```

---

## Links

- [Monorepo Repository](https://github.com/strafe-js/strafe.js)
- [Strafe Developer Docs](https://app.strafe.chat/docs/)

## License

Apache-2.0
