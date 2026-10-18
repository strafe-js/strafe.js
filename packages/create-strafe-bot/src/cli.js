#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

const args = process.argv.slice(2);
const cmd = args[0];

function usage() {
  console.log(`create-strafebot <name>              scaffold a bot project
create-strafebot command <name>      add src/commands/<name>.ts
create-strafebot help`);
}

function ask(question) {
  const rl = createInterface({ input, output });
  return new Promise((resolveAsk) => {
    rl.question(question, (answer) => {
      rl.close();
      resolveAsk(String(answer || '').trim());
    });
  });
}

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
  usage();
  process.exit(cmd ? 0 : 1);
}

if (cmd === 'command') {
  const name = (args[1] || '').toLowerCase();
  if (!name || !/^[a-z][a-z0-9_-]*$/.test(name)) {
    console.error('usage: create-strafebot command <name>');
    process.exit(1);
  }

  const dir = resolve(process.cwd(), 'src/commands');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.ts`);
  if (existsSync(file)) {
    console.error(`already exists: ${file}`);
    process.exit(1);
  }

  const perms = args.includes('--mod')
    ? `  category: 'moderation',\n  permissions: ['ManageMessages'],\n`
    : args.includes('--admin')
      ? `  category: 'admin',\n  permissions: ['Administrator'],\n`
      : `  category: 'general',\n`;

  writeFileSync(
    file,
    `import { command } from '@strafe-js/strafebot';

export default command({
  name: '${name}',
  description: '${name} command',
  aliases: [],
${perms}  cooldown: 0,
  async run(ctx) {
    await ctx.reply('${name} works');
  },
});
`,
  );
  console.log(`wrote ${file}`);
  process.exit(0);
}

const name = cmd;
if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
  console.error('invalid project name');
  process.exit(1);
}

const root = resolve(process.cwd(), name);
if (existsSync(root)) {
  console.error(`directory already exists: ${root}`);
  process.exit(1);
}

const token = await ask('Bot token (Enter to skip): ');

console.log('');
console.log('Instance (Enter = official app.strafe.chat)');
console.log('  API     https://app.strafe.chat/api');
console.log('  Gateway wss://app.strafe.chat/gateway/events');
const instanceChoice = await ask('Use official instance? [Y/n]: ');
let apiBase;
let gatewayUrl;
if (!instanceChoice || /^y(es)?$/i.test(instanceChoice)) {
  apiBase = 'https://app.strafe.chat/api';
  gatewayUrl = 'wss://app.strafe.chat/gateway/events';
} else {
  apiBase =
    (await ask('API base: ')) || 'https://app.strafe.chat/api';
  gatewayUrl =
    (await ask('Gateway URL: ')) || 'wss://app.strafe.chat/gateway/events';
}

const prefix = (await ask('Command prefix [!]: ')) || '!';
const owners = await ask('Owner user ids (comma-separated, optional): ');

mkdirSync(join(root, 'src/commands'), { recursive: true });

writeFileSync(
  join(root, 'package.json'),
  JSON.stringify(
    {
      name,
      version: '1.0.0',
      type: 'module',
      private: true,
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'tsc && node dist/index.js',
        'new-command': 'create-strafebot command',
      },
      dependencies: {
        '@strafe-js/strafebot': '^1.3.0',
      },
      devDependencies: {
        typescript: '^5.6.0',
        '@types/node': '^22.0.0',
      },
      engines: {
        node: '>=18',
      },
    },
    null,
    2,
  ) + '\n',
);

writeFileSync(
  join(root, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'Node16',
        moduleResolution: 'Node16',
        outDir: 'dist',
        rootDir: 'src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: false,
      },
      include: ['src/**/*'],
    },
    null,
    2,
  ) + '\n',
);

writeFileSync(
  join(root, '.env'),
  `BOT_TOKEN=${token}
STRAFE_API=${apiBase}
STRAFE_GATEWAY=${gatewayUrl}
PREFIX=${prefix}
OWNERS=${owners}
`,
);

writeFileSync(
  join(root, '.env.example'),
  `BOT_TOKEN=
STRAFE_API=https://app.strafe.chat/api
STRAFE_GATEWAY=wss://app.strafe.chat/gateway/events
PREFIX=!
OWNERS=
`,
);

writeFileSync(
  join(root, '.gitignore'),
  `node_modules/
dist/
.env
*.log
`,
);

writeFileSync(
  join(root, 'src/index.ts'),
  `import { Client } from '@strafe-js/strafebot';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config } from './loadEnv.js';

config();

const client = new Client({
  apiBase: process.env.STRAFE_API!,
  gatewayUrl: process.env.STRAFE_GATEWAY!,
  prefix: process.env.PREFIX || '!',
  owners: (process.env.OWNERS || '').split(',').map((s) => s.trim()).filter(Boolean),
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsDir = join(__dirname, 'commands');

for (const file of readdirSync(commandsDir)) {
  if (!file.endsWith('.js')) continue;
  const mod = await import(pathToFileURL(join(commandsDir, file)).href);
  const cmd = mod.default;
  if (!cmd) {
    console.warn('skip (no default export):', file);
    continue;
  }
  client.commands.register(cmd);
  console.log('loaded command:', cmd.name ?? file);
}

client.on('ready', async (user) => {
  console.log(\`online as \${user.username} (\${user.id})\`);
  for (const spaceId of client.spaces.keys()) {
    try {
      await client.fetchMembers(spaceId);
    } catch (e) {
      console.warn('members fetch failed', spaceId, (e as Error).message);
    }
  }
});

client.on('spaceCreate', async (space) => {
  try {
    await client.fetchMembers(space.id);
  } catch {}
});

client.on('commandError', (err, ctx) => {
  console.error(\`command \${ctx.commandName} failed\`, err);
});

client.on('error', (err) => console.error(err));

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.error('BOT_TOKEN missing in .env');
  process.exit(1);
}

await client.login(botToken);
`,
);

writeFileSync(
  join(root, 'src/loadEnv.ts'),
  `import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Load KEY=VALUE from project-root .env into process.env (does not override existing). */
export function config(path = resolve(process.cwd(), '.env')): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
`,
);

writeFileSync(
  join(root, 'src/commands/ping.ts'),
  `import { command } from '@strafe-js/strafebot';

export default command({
  name: 'ping',
  description: 'latency check',
  category: 'utility',
  aliases: ['p'],
  async run(ctx) {
    await ctx.reply('pong');
  },
});
`,
);

writeFileSync(
  join(root, 'src/commands/help.ts'),
  `import { createHelpCommand } from '@strafe-js/strafebot';

export default createHelpCommand({
  title: '**Available Bot Commands**',
});
`,
);

writeFileSync(
  join(root, 'src/commands/kick.ts'),
  `import { command, userMention } from '@strafe-js/strafebot';

export default command({
  name: 'kick',
  description: 'kick a member from the space',
  category: 'moderation',
  permissions: ['KickMembers'],
  botPermissions: ['KickMembers'],
  guildOnly: true,
  arguments: {
    target: { type: 'user', required: true, description: 'Member ID or @mention' },
    reason: { type: 'string', rest: true, default: 'No reason provided' },
  },
  async run(ctx) {
    const target = ctx.arguments.get('target');
    const reason = ctx.arguments.get('reason');
    try {
      await ctx.client.rest.kickMember(ctx.spaceId!, target);
      await ctx.reply(\`kicked \${userMention(target)} (reason: \${reason})\`);
    } catch (err) {
      await ctx.reply(\`failed: \${(err as Error).message}\`);
    }
  },
});
`,
);

writeFileSync(
  join(root, 'README.md'),
  `# ${name}

Strafe bot (\`@strafe-js/strafebot\`).

## Setup

\`\`\`bash
npm install
npm run build
npm start
\`\`\`

\`.env\` is filled from scaffold prompts.

## Commands

One file per command in \`src/commands/\` (\`.ts\`):

\`\`\`
src/commands/ping.ts → !ping
src/commands/kick.ts → !kick
src/commands/help.ts → !help
\`\`\`

\`\`\`bash
npx create-strafebot command ban
npx create-strafebot command purge --mod
\`\`\`

## Layout

\`\`\`
${name}/
  .env
  .env.example
  package.json
  tsconfig.json
  src/
    index.ts
    loadEnv.ts
    commands/
      ping.ts
      help.ts
      kick.ts
\`\`\`
`,
);

console.log('');
console.log(`created ${name}/`);
console.log('  .env');
console.log('  src/index.ts');
console.log('  src/commands/*.ts');
console.log('');
console.log(`  cd ${name}`);
console.log('  npm install && npm run build && npm start');
