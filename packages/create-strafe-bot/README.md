<div align="center">
	<br />
	<h1>create-strafebot</h1>
	<p>
		<strong>Interactive CLI Project Scaffolder & Command Generator for Strafe.js Bots</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/create-strafebot"><img src="https://img.shields.io/npm/v/create-strafebot.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js" alt="License" /></a>
	</p>
</div>

---

## Overview

`create-strafebot` is an interactive command-line tool that helps you:

1. **Scaffold a complete TypeScript Strafe Chat bot project** with pre-configured environment files, scripts, and starter commands.
2. **Generate new typed command modules** (`src/commands/<name>.ts`) inside an existing bot project with optional moderator (`--mod`) or administrator (`--admin`) permission guards.

---

## 1. Scaffolding a New Bot Project

Run the interactive wizard with `npm`, `npx`, `pnpm`, or `bun`:

```sh
npm create strafebot@latest my-bot
# or
npx create-strafebot my-bot
```

### Interactive Prompts

1. **Project folder** — Target directory name (default: `my-strafe-bot`).
2. **Bot token** — Optional token written directly into `.env` (`BOT_TOKEN`).
3. **Command prefix** — Default command prefix (default: `!`).
4. **Owner user IDs** — Comma-separated Snowflake IDs for `botOwnerOnly` commands.
5. **Template selection**:
   - **1) Full Command Bot** — Includes `CommandHandler`, `src/commands/ping.ts`, and `src/commands/kick.ts`.
   - **2) Minimal Event Bot** — Lightweight `messageCreate` listener setup without command files.

### Generated Directory Structure

```text
my-bot/
├── .env                  # Local environment secrets (gitignored)
├── .env.example          # Safe template for version control
├── .gitignore
├── package.json          # Scripts: dev (tsx watch), build (tsc), start
├── tsconfig.json         # Strict ES2022 + NodeNext TypeScript config
└── src/
    ├── index.ts          # Client setup, event logging, and command registration
    └── commands/
        ├── ping.ts       # Basic latency check command
        └── kick.ts       # Moderation command example
```

### Running Your New Bot

```sh
cd my-bot
npm run dev
```

---

## 2. Generating Command Files (`command` / `cmd` / `g`)

From the root of an existing bot project, generate a new command module in `src/commands/<name>.ts`:

```sh
# Generate a standard user command (SendMessages)
npx create-strafebot command userinfo

# Generate a moderator command (KickMembers, ManageMessages + guildOnly)
npx create-strafebot command warn --mod

# Generate an administrator command (Administrator, BanMembers + guildOnly)
npx create-strafebot command purge --admin
```

Then import and register the generated command in `src/index.ts`:

```ts
import { warnCommand } from './commands/warn.js';

client.commands.register(warnCommand);
```

---

## Links

- [Monorepo Repository](https://github.com/strafe-js/strafe.js)
- [Strafe Developer Docs](https://app.strafe.chat/docs/)

## License

Apache-2.0
