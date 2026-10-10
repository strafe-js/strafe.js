import { Client, command } from '../packages/strafebot/src/index.js';

const client = new Client({
  apiBase: process.env.STRAFE_API!,
  gatewayUrl: process.env.STRAFE_GATEWAY!,
  prefix: ['!', '?'],
  owners: (process.env.OWNERS || '').split(',').filter(Boolean),
});

client.commands
  .register(
    command({
      name: 'ping',
      aliases: ['p'],
      async run(ctx) {
        await ctx.reply('pong');
      },
    }),
  )
  .register(
    command({
      name: 'say',
      usage: '<text>',
      minArgs: 1,
      async run(ctx) {
        await ctx.send(ctx.args.join(' '));
      },
    }),
  )
  .register(
    command({
      name: 'kick',
      usage: '<user_id>',
      permissions: ['KickMembers'],
      guildOnly: true,
      minArgs: 1,
      async run(ctx) {
        await ctx.client.rest.kickMember(ctx.space!.id, ctx.args[0]!);
        await ctx.reply(`kicked ${ctx.args[0]}`);
      },
    }),
  )
  .register(
    command({
      name: 'purge',
      permissions: ['ManageMessages'],
      guildOnly: true,
      minArgs: 1,
      cooldown: 5000,
      async run(ctx) {
        const n = Math.min(50, Math.max(1, parseInt(ctx.args[0]!, 10) || 1));
        await ctx.reply(`would delete ${n} messages`);
      },
    }),
  );

client.on('ready', async (user) => {
  console.log(`online as ${user.username}`);
  for (const id of client.spaces.keys()) {
    try {
      await client.fetchMembers(id);
    } catch (e) {
      console.warn((e as Error).message);
    }
  }
});

client.on('commandError', (err, ctx) => {
  console.error(ctx.commandName, err);
});

await client.login(process.env.BOT_TOKEN!);
