import { Client, command, createHelpCommand } from '../packages/strafebot/src/index.js';

const client = new Client({
  apiBase: process.env.STRAFE_API || 'https://app.strafe.chat/api',
  gatewayUrl: process.env.STRAFE_GATEWAY || 'wss://app.strafe.chat/gateway/events',
  prefix: ['!', '?'],
  owners: (process.env.OWNERS || '').split(',').filter(Boolean),
  autoFetchMembersOnReady: true,
});

client.commands.registerAll([
  createHelpCommand({ title: '**Bot Commands**' }),

  command({
    name: 'ping',
    aliases: ['p', 'latency'],
    category: 'utility',
    description: 'Check if the bot is responsive',
    cooldown: 2000,
    async run(ctx) {
      await ctx.reply('Pong!');
    },
  }),

  command({
    name: 'say',
    category: 'utility',
    description: 'Echo text',
    usage: '<text>',
    minArgs: 1,
    botPermissions: ['SendMessages'],
    async run(ctx) {
      await ctx.send(ctx.args.join(' '));
    },
  }),

  command({
    name: 'kick',
    category: 'moderation',
    description: 'Kick a member from the space',
    guildOnly: true,
    permissions: ['KickMembers'],
    botPermissions: ['KickMembers'],
    arguments: {
      target: { type: 'user', required: true, description: 'User to kick' },
      reason: { type: 'string', rest: true, default: 'No reason provided' },
    },
    async run(ctx) {
      const targetId = ctx.arguments.get('target') as string;
      const reason = ctx.arguments.get('reason') as string;
      if (targetId === ctx.client.user?.id) {
        await ctx.reply('I cannot kick myself.');
        return;
      }
      if (targetId === ctx.authorId) {
        await ctx.reply('You cannot kick yourself.');
        return;
      }
      if (!ctx.canModerate(targetId)) {
        await ctx.reply('You cannot moderate that member (role hierarchy).');
        return;
      }
      await ctx.kick(targetId, reason);
      await ctx.reply(`Kicked <@${targetId}> — ${reason}`);
    },
  }),

  command({
    name: 'ban',
    category: 'moderation',
    description: 'Ban a member from the space',
    guildOnly: true,
    permissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    arguments: {
      target: { type: 'user', required: true, description: 'User to ban' },
      reason: { type: 'string', rest: true, default: 'No reason provided' },
    },
    async run(ctx) {
      const targetId = ctx.arguments.get('target') as string;
      const reason = ctx.arguments.get('reason') as string;
      if (targetId === ctx.client.user?.id) {
        await ctx.reply('I cannot ban myself.');
        return;
      }
      if (targetId === ctx.authorId) {
        await ctx.reply('You cannot ban yourself.');
        return;
      }
      if (!ctx.canModerate(targetId)) {
        await ctx.reply('You cannot moderate that member (role hierarchy).');
        return;
      }
      await ctx.ban(targetId, reason);
      await ctx.reply(`Banned <@${targetId}> — ${reason}`);
    },
  }),

  command({
    name: 'unban',
    category: 'moderation',
    description: 'Remove a ban',
    guildOnly: true,
    permissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    arguments: {
      target: { type: 'user', required: true, description: 'User id to unban' },
    },
    async run(ctx) {
      const targetId = ctx.arguments.get('target') as string;
      await ctx.unban(targetId);
      await ctx.reply(`Unbanned <@${targetId}>`);
    },
  }),

  command({
    name: 'purge',
    category: 'moderation',
    description: 'Placeholder purge',
    permissions: ['ManageMessages'],
    botPermissions: ['ManageMessages'],
    guildOnly: true,
    minArgs: 1,
    cooldown: 5000,
    async run(ctx) {
      const n = Math.min(50, Math.max(1, parseInt(ctx.args[0]!, 10) || 1));
      await ctx.reply(`Would purge up to ${n} messages.`);
    },
  }),
]);

client.on('ready', async (payload) => {
  const user = (payload as any).user ?? payload;
  console.log(`online as ${user.username} (${user.id})`);
  try {
    client.gateway.setActivity({ name: 'moderating spaces', type: 'playing' });
  } catch {
    /* ignore until Activity op lands */
  }
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

client.on('commandPermissionDenied', (_msg, command, missing) => {
  console.log(`user missing for ${command.name}:`, missing);
});

client.on('commandBotPermissionDenied', (_msg, command, missing) => {
  console.log(`bot missing for ${command.name}:`, missing);
});

await client.login(process.env.BOT_TOKEN!);
