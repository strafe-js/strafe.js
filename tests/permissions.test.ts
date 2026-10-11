import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Permission,
  ALL_PERMISSIONS,
  BitField,
  resolvePermission,
  type Role,
  type Room,
  type Space,
  type SpaceMember,
} from '@strafe-js/util';
import { Client } from '@strafe-js/strafebot';

test('Permission BitField & resolvePermission', () => {
  assert.equal(resolvePermission('ViewRoom'), 1);
  assert.equal(resolvePermission('SendMessages'), 2);
  assert.equal(resolvePermission(['ViewRoom', 'SendMessages']), 3);

  const bf = new BitField(Permission.ViewRoom);
  assert.equal(bf.has('ViewRoom'), true);
  assert.equal(bf.has('SendMessages'), false);

  bf.add('SendMessages');
  assert.equal(bf.has(['ViewRoom', 'SendMessages']), true);

  bf.remove('ViewRoom');
  assert.equal(bf.has('ViewRoom'), false);
  assert.deepEqual(bf.toArray(), ['SendMessages']);
});

test('resolveMemberPermissions - Space Owner & Administrator', () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
  });

  const space: Space = {
    id: '100',
    name: 'Test Space',
    owner_id: 'user_owner',
    everyone_role_id: 'role_everyone',
    roles: [
      { id: 'role_everyone', name: '@everyone', permissions: Permission.ViewRoom, position: 0, color: 0, hoist: false, mentionable: false },
      { id: 'role_admin', name: 'Admin', permissions: Permission.Administrator, position: 1, color: 0, hoist: false, mentionable: false },
    ],
  };
  client.spaces.set(space.id, space);

  // 1. Space Owner gets ALL_PERMISSIONS
  const ownerPerms = client.resolveMemberPermissions('user_owner', '100');
  assert.equal(ownerPerms, ALL_PERMISSIONS);

  // 2. Member with Administrator gets ALL_PERMISSIONS
  client.members.set('100', new Map([
    ['user_admin', { user_id: 'user_admin', role_ids: ['role_admin'] } as SpaceMember],
  ]) as any);

  const adminPerms = client.resolveMemberPermissions('user_admin', '100');
  assert.equal(adminPerms, ALL_PERMISSIONS);
});

test('resolveMemberPermissions - Overrides and Dependent Permissions', () => {
  const client = new Client({
    apiBase: 'https://test.local',
    gatewayUrl: 'wss://test.local',
  });

  const space: Space = {
    id: '100',
    name: 'Test Space',
    owner_id: 'user_owner',
    everyone_role_id: 'role_everyone',
    roles: [
      { id: 'role_everyone', name: '@everyone', permissions: Permission.ViewRoom | Permission.SendMessages | Permission.AttachFiles, position: 0, color: 0, hoist: false, mentionable: false },
      { id: 'role_mod', name: 'Mod', permissions: Permission.ManageMessages, position: 1, color: 0, hoist: false, mentionable: false },
      { id: 'role_muted', name: 'Muted', permissions: 0, position: 2, color: 0, hoist: false, mentionable: false },
    ],
  };
  client.spaces.set(space.id, space);

  const room: Room = {
    id: 'room_1',
    type: 3,
    space_id: '100',
    permission_overrides: [
      // Muted role denies SendMessages
      { role_id: 'role_muted', allow: 0, deny: Permission.SendMessages },
    ],
    user_overrides: [
      // User 1 explicitly allowed SendMessages
      { user_id: 'user_1', allow: Permission.SendMessages, deny: 0 },
      // User 2 denied ViewRoom
      { user_id: 'user_2', allow: 0, deny: Permission.ViewRoom },
    ],
  };
  client.rooms.set(room.id, room);

  client.members.set('100', new Map([
    ['user_1', { user_id: 'user_1', role_ids: ['role_muted'] } as SpaceMember],
    ['user_2', { user_id: 'user_2', role_ids: ['role_mod'] } as SpaceMember],
  ]) as any);

  // User 1 has role_muted (denies SendMessages), but user_override explicitly ALLOWS SendMessages
  const user1Perms = client.resolveMemberPermissions('user_1', '100', 'room_1');
  assert.equal((user1Perms & Permission.SendMessages) !== 0, true);

  // User 2 denied ViewRoom -> Dependent cascade clears room permissions to 0
  const user2Perms = client.resolveMemberPermissions('user_2', '100', 'room_1');
  assert.equal(user2Perms, 0);
});
