import test from 'node:test';
import assert from 'node:assert/strict';
import { Client, command } from '@strafe-js/strafebot';
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

  // Duplicate name check
  assert.throws(() => {
    client.commands.register(
      command({
        name: 'ping',
        async run() {},
      }),
    );
  }, /Duplicate command name/);

  // Alias collision with existing command name check
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

  // Mock REST message reply to avoid network error
  client.rest.createMessage = async () => ({} as Message);

  // Emit message
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

  // User doesn't have KickMembers permission
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
