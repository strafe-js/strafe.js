import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Client,
  Collection,
  command,
  createHelpCommand,
  deconstructSnowflake,
  snowflakeTimestamp,
  STRAFE_EPOCH,
  bold,
  italic,
  underline,
  strikethrough,
  spoiler,
  inlineCode,
  codeBlock,
  quote,
  blockQuote,
  hyperlink,
  message,
  permissionOverwrite,
} from '@strafe-js/strafebot';
import { Permission, type Message, type Space } from '@strafe-js/util';

test('Command Registration & Conflict Detection', () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
  });

  client.commands.register(
    command({
      name: 'ping',
      aliases: ['p'],
      async run() {},
    }),
  );

  assert.throws(() => {
    client.commands.register(
      command({
        name: 'ping',
        async run() {},
      }),
    );
  }, /Duplicate command name/);

  assert.throws(() => {
    client.commands.register(
      command({
        name: 'p',
        async run() {},
      }),
    );
  }, /conflicts with an existing alias/);
});

test('Command Framework - Positional & Typed Arguments Parsing', async () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
  });

  let executed = false;
  let receivedDifficulty = '';
  let receivedCount = 0;

  client.commands.register(
    command({
      name: 'configure',
      arguments: {
        difficulty: {
          type: 'string',
          required: true,
          choices: ['easy', 'normal', 'hard'],
        },
        count: {
          type: 'integer',
          required: false,
          min: 1,
          max: 100,
          default: 10,
        },
      },
      async run(ctx) {
        executed = true;
        receivedDifficulty = ctx.arguments.get('difficulty');
        receivedCount = ctx.arguments.get('count');
      },
    }),
  );

  client.rest.createMessage = async () => ({} as Message);

  const msg: Message = {
    id: 'msg_1',
    room_id: 'room_1',
    sender_id: 'user_1',
    plaintext: '!configure "hard" 25',
  };

  client.commands.attach();
  client.emit('messageCreate', msg, {} as any);

  await new Promise((r) => setTimeout(r, 50));

  assert.equal(executed, true);
  assert.equal(receivedDifficulty, 'hard');
  assert.equal(receivedCount, 25);
});

test('Command Framework - Bot Permissions & User Permissions Check', async () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
  });

  client.user = { id: 'bot_1', username: 'TestBot' };

  const space: Space = {
    id: 'space_1',
    name: 'Test Space',
    owner_id: 'user_owner',
    everyone_role_id: 'role_everyone',
    roles: [
      { id: 'role_everyone', name: '@everyone', permissions: Permission.ViewRoom | Permission.SendMessages, position: 0, color: 0, hoist: false, mentionable: false },
    ],
  };
  client.spaces.set(space.id, space);

  let runCalled = false;
  let replyText = '';

  client.rest.createMessage = async (_roomId, body) => {
    replyText = body.plaintext ?? '';
    return {} as Message;
  };

  client.commands.register(
    command({
      name: 'kick',
      permissions: ['KickMembers'],
      botPermissions: ['KickMembers'],
      guildOnly: true,
      async run() {
        runCalled = true;
      },
    }),
  );

  client.commands.attach();

  const msg: Message = {
    id: 'msg_1',
    room_id: 'room_1',
    space_id: 'space_1',
    sender_id: 'user_normal',
    plaintext: '!kick',
  };

  client.emit('messageCreate', msg, {} as any);
  await new Promise((r) => setTimeout(r, 50));

  assert.equal(runCalled, false);
  assert.match(replyText, /required permissions/);
});

test('Snowflake Deconstruction & Timestamps (@strafe-js/util)', () => {
  const offsetMs = 123_456_789n;
  const workerId = 3n;
  const processId = 7n;
  const increment = 42n;
  const rawBig = (offsetMs << 22n) | (workerId << 17n) | (processId << 12n) | increment;
  const id = rawBig.toString();

  const decoded = deconstructSnowflake(id);
  assert.equal(decoded.id, id);
  assert.equal(decoded.timestamp, Number(STRAFE_EPOCH + offsetMs));
  assert.equal(decoded.date.getTime(), Number(STRAFE_EPOCH + offsetMs));
  assert.equal(decoded.workerId, 3);
  assert.equal(decoded.processId, 7);
  assert.equal(decoded.increment, 42);
  assert.equal(snowflakeTimestamp(id), decoded.timestamp);

  assert.throws(() => deconstructSnowflake('not_a_number'), /Invalid Snowflake ID/);
});

test('Collection Extended Methods (@strafe-js/collection)', () => {
  const col = new Collection<string, { id: string; score: number; bot: boolean }>();
  col.set('a', { id: 'a', score: 10, bot: false });
  col.set('b', { id: 'b', score: 20, bot: true });
  col.set('c', { id: 'c', score: 30, bot: false });

  assert.equal(col.last()?.id, 'c');
  assert.deepEqual(
    col.last(2).map((x) => x.id),
    ['b', 'c'],
  );

  const sampleOne = col.random();
  assert.ok(sampleOne && ['a', 'b', 'c'].includes(sampleOne.id));
  const sampleTwo = col.random(2);
  assert.equal(sampleTwo.length, 2);
  assert.notEqual(sampleTwo[0]!.id, sampleTwo[1]!.id);

  const sum = col.reduce((acc, item) => acc + item.score, 0);
  assert.equal(sum, 60);

  const [bots, humans] = col.partition((item) => item.bot);
  assert.equal(bots.size, 1);
  assert.equal(humans.size, 2);

  let tappedSize = 0;
  const cloned = col.clone().tap((c) => {
    tappedSize = c.size;
  });
  assert.equal(tappedSize, 3);

  const swept = cloned.sweep((item) => item.bot);
  assert.equal(swept, 1);
  assert.equal(cloned.size, 2);
  assert.equal(col.size, 3);

  const extra = new Collection<string, { id: string; score: number; bot: boolean }>();
  extra.set('d', { id: 'd', score: 40, bot: false });
  const merged = cloned.concat(extra);
  assert.equal(merged.size, 3);
  assert.equal(merged.last()?.id, 'd');
});

test('Markdown Formatters & Incremental Builders (@strafe-js/formatters & @strafe-js/builders)', () => {
  assert.equal(bold('hi'), '**hi**');
  assert.equal(italic('hi'), '*hi*');
  assert.equal(underline('hi'), '__hi__');
  assert.equal(strikethrough('hi'), '~~hi~~');
  assert.equal(spoiler('secret'), '||secret||');
  assert.equal(inlineCode('x'), '`x`');
  assert.equal(codeBlock('const a = 1;', 'ts'), '```ts\nconst a = 1;\n```');
  assert.equal(quote('line'), '> line');
  assert.equal(blockQuote('multi'), '>>> multi');
  assert.equal(hyperlink('Strafe', 'https://app.strafe.chat'), '[Strafe](https://app.strafe.chat)');

  const builtMsg = message()
    .setContent('Hello')
    .appendContent('World', ' ')
    .addUserMention('111111111111111111', '111111111111111111')
    .addRoleMention('222222222222222222')
    .addAttachment('333333333333333333')
    .toJSON();

  assert.equal(builtMsg.plaintext, 'Hello World');
  assert.deepEqual(builtMsg.mentions, ['111111111111111111']);
  assert.deepEqual(builtMsg.mention_roles, ['222222222222222222']);
  assert.deepEqual(builtMsg.attachments, ['333333333333333333']);

  const ov = permissionOverwrite()
    .setRole('222222222222222222')
    .allow('ViewRoom', 'SendMessages')
    .deny('SendMessages', 'AttachFiles')
    .clear('AttachFiles')
    .toJSON();

  assert.equal(ov.role_id, '222222222222222222');
  assert.equal(ov.allow, Permission.ViewRoom);
  assert.equal(ov.deny, Permission.SendMessages);
});

test('Command Framework - room, role, rest, minLength, mentionPrefix, middleware, and createHelpCommand', async () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
    prefix: '!',
  });
  client.user = { id: '999999999999999999', username: 'HelperBot' };

  const replies: string[] = [];
  client.rest.createMessage = async (_roomId, body) => {
    replies.push(body.plaintext ?? '');
    return {} as Message;
  };

  const middlewareOrder: string[] = [];
  client.commands.use(async (ctx, next) => {
    middlewareOrder.push(`before:${ctx.commandName}`);
    await next();
    middlewareOrder.push(`after:${ctx.commandName}`);
  });

  let parsedRoom = '';
  let parsedRole = '';
  let parsedReason = '';

  client.commands.registerAll([
    createHelpCommand({ title: '**Bot Help**' }),
    command({
      name: 'announce',
      category: 'moderation',
      description: 'Announce to a room and role',
      arguments: {
        room: { type: 'room', required: true },
        role: { type: 'role', required: true },
        reason: { type: 'string', required: true, rest: true, minLength: 5, maxLength: 50 },
      },
      async run(ctx) {
        parsedRoom = ctx.arguments.get('room');
        parsedRole = ctx.arguments.get('role');
        parsedReason = ctx.arguments.get('reason');
        await ctx.reply('announced');
      },
    }),
  ]);

  client.commands.attach();

  client.emit(
    'messageCreate',
    {
      id: 'm1',
      room_id: 'r1',
      sender_id: 'u1',
      created_at: new Date().toISOString(),
      plaintext: '<@999999999999999999> announce <#123456789012345678> <@&234567890123456789> Server maintenance tonight',
    },
    {} as any,
  );
  await new Promise((r) => setTimeout(r, 30));

  assert.equal(parsedRoom, '123456789012345678');
  assert.equal(parsedRole, '234567890123456789');
  assert.equal(parsedReason, 'Server maintenance tonight');
  assert.deepEqual(middlewareOrder, ['before:announce', 'after:announce']);

  client.emit(
    'messageCreate',
    {
      id: 'm2',
      room_id: 'r1',
      sender_id: 'u1',
      created_at: new Date().toISOString(),
      plaintext: '!help',
    },
    {} as any,
  );
  await new Promise((r) => setTimeout(r, 30));
  assert.match(replies[replies.length - 1] ?? '', /\*\*Bot Help\*\*/);
  assert.match(replies[replies.length - 1] ?? '', /!announce <room:room> <role:role> <reason\.\.\.:string>/);

  client.emit(
    'messageCreate',
    {
      id: 'm3',
      room_id: 'r1',
      sender_id: 'u1',
      created_at: new Date().toISOString(),
      plaintext: '!help announce',
    },
    {} as any,
  );
  await new Promise((r) => setTimeout(r, 30));
  assert.match(replies[replies.length - 1] ?? '', /Category: `moderation`/);
});

test('Client Collectors - awaitMessages & awaitReactions', async () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
  });

  const msgPromise = client.awaitMessages('room_collect', {
    filter: (m) => m.sender_id === 'u_target',
    max: 2,
    timeoutMs: 500,
  });

  client.emit('messageCreate', {
    id: 'msg_other',
    room_id: 'room_collect',
    sender_id: 'u_other',
    plaintext: 'ignored',
    created_at: new Date().toISOString(),
  });
  client.emit('messageCreate', {
    id: 'msg_ok_1',
    room_id: 'room_collect',
    sender_id: 'u_target',
    plaintext: 'first',
    created_at: new Date().toISOString(),
  });
  client.emit('messageCreate', {
    id: 'msg_ok_2',
    room_id: 'room_collect',
    sender_id: 'u_target',
    plaintext: 'second',
    created_at: new Date().toISOString(),
  });

  const collectedMsgs = await msgPromise;
  assert.equal(collectedMsgs.size, 2);
  assert.equal(collectedMsgs.first()?.plaintext, 'first');
  assert.equal(collectedMsgs.last()?.plaintext, 'second');

  const reactPromise = client.awaitReactions('room_collect', 'msg_ok_1', {
    filter: (r) => r.emoji === '👍',
    max: 1,
    timeoutMs: 500,
  });

  client.emit('messageReactionAdd', {
    room_id: 'room_collect',
    message_id: 'msg_ok_1',
    user_id: 'u_target',
    emoji: '👍',
  });

  const reactions = await reactPromise;
  assert.equal(reactions.length, 1);
  assert.equal(reactions[0]!.user_id, 'u_target');
});
