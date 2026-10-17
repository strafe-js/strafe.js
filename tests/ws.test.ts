import test from 'node:test';
import assert from 'node:assert/strict';
import { Gateway } from '@strafe-js/ws';
import { Client, command } from '@strafe-js/strafebot';
import {
  GatewayOp,
  RoomType,
  isEncryptedMessage,
  isEncryptedRoom,
  isSystemMessage,
  type GatewayFrame,
  type Message,
  type Room,
} from '@strafe-js/util';

test('Gateway - Nested and flat op: 3 Event envelopes, SNAKE_CASE to camelCase, and room_id/space_id injection', () => {
  const gw = new Gateway({
    url: 'wss://test.local/ws',
    token: 'bot_token',
  });

  const handle = (gw as unknown as { _handle(frame: GatewayFrame): void })._handle.bind(gw);

  let nestedReceived: Message | undefined;
  let flatReceived: Message | undefined;

  gw.on('messageCreate', (msg) => {
    if (msg.id === 'msg_nested') nestedReceived = msg;
    if (msg.id === 'msg_flat') flatReceived = msg;
  });

  handle({
    op: GatewayOp.Event,
    d: {
      t: 'MESSAGE_CREATE',
      space_id: 'space_10',
      room_id: 'room_20',
      d: {
        id: 'msg_nested',
        sender_id: 'user_1',
        plaintext: 'hello nested',
      },
    },
  });

  handle({
    op: GatewayOp.Event,
    t: 'MESSAGE_CREATE',
    space_id: 'space_30',
    room_id: 'room_40',
    d: {
      id: 'msg_flat',
      sender_id: 'user_2',
      plaintext: 'hello flat',
    },
  });

  assert.ok(nestedReceived);
  assert.equal(nestedReceived.room_id, 'room_20');
  assert.equal(nestedReceived.space_id, 'space_10');
  assert.equal(nestedReceived.plaintext, 'hello nested');

  assert.ok(flatReceived);
  assert.equal(flatReceived.room_id, 'room_40');
  assert.equal(flatReceived.space_id, 'space_30');
  assert.equal(flatReceived.plaintext, 'hello flat');
});

test('Gateway - SESSION_REVOKED disables automatic reconnection and emits sessionRevoked', () => {
  const gw = new Gateway({
    url: 'wss://test.local/ws',
    token: 'bot_token',
    reconnect: true,
  });

  const handle = (gw as unknown as { _handle(frame: GatewayFrame): void })._handle.bind(gw);

  let revokedReason = '';
  gw.on('sessionRevoked', (data) => {
    revokedReason = data.reason;
  });

  handle({
    op: GatewayOp.Event,
    d: {
      t: 'SESSION_REVOKED',
      d: { reason: 'bot_token_reset' },
    },
  });

  assert.equal(revokedReason, 'bot_token_reset');
  assert.equal(
    (gw as unknown as { shouldReconnect: boolean }).shouldReconnect,
    false,
  );
});

test('E2EE - Encrypted room/message detection and Client encryptedMessageCreate event', async () => {
  const client = new Client({
    apiBase: 'https://test.local/api',
    gatewayUrl: 'wss://test.local/ws',
    token: 'bot_token',
  });

  const encryptedRoom: Room = {
    id: 'room_pm_1',
    type: RoomType.PM,
    e2ee_enabled: true,
  };
  const normalRoom: Room = {
    id: 'room_text_1',
    type: RoomType.SpaceText,
    e2ee_enabled: false,
  };

  client.rooms.set(encryptedRoom.id, encryptedRoom);
  client.rooms.set(normalRoom.id, normalRoom);

  assert.equal(isEncryptedRoom(encryptedRoom), true);
  assert.equal(isEncryptedRoom(normalRoom), false);
  assert.equal(client.isRoomEncrypted('room_pm_1'), true);
  assert.equal(client.isRoomEncrypted('room_text_1'), false);

  const cipherMsg: Message = {
    id: 'msg_enc_1',
    room_id: 'room_pm_1',
    sender_id: 'user_1',
    ciphertext: 'base64_ciphertext_blob',
    nonce: 'base64_nonce',
  };
  const plainMsg: Message = {
    id: 'msg_plain_1',
    room_id: 'room_text_1',
    sender_id: 'user_1',
    plaintext: '!ping',
  };
  const sysMsg: Message = {
    id: 'msg_sys_1',
    room_id: 'room_text_1',
    sender_id: '0',
    system_type: 'member_joined',
  };

  assert.equal(isEncryptedMessage(cipherMsg), true);
  assert.equal(isEncryptedMessage(plainMsg), false);
  assert.equal(isSystemMessage(sysMsg), true);
  assert.equal(isSystemMessage(plainMsg), false);

  let encryptedEventFired = false;
  let commandExecuted = false;

  client.on('encryptedMessageCreate', (msg) => {
    if (msg.id === 'msg_enc_1') encryptedEventFired = true;
  });

  client.commands.register(
    command({
      name: 'ping',
      async run() {
        commandExecuted = true;
      },
    }),
  );
  client.gateway = new Gateway({
    url: 'wss://test.local/ws',
    token: 'bot_token',
  });
  (client as unknown as { _wireGateway(): void })._wireGateway();
  client.commands.attach();

  const handle = (client.gateway as unknown as { _handle(frame: GatewayFrame): void })._handle.bind(client.gateway);
  handle({
    op: GatewayOp.Event,
    d: {
      t: 'MESSAGE_CREATE',
      room_id: 'room_pm_1',
      d: cipherMsg,
    },
  });

  await new Promise((r) => setTimeout(r, 20));
  assert.equal(encryptedEventFired, true);
  assert.equal(commandExecuted, false);
});
