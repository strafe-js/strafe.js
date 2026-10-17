<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/permissions/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>@strafe-js/util</h1>
	<p>
		<strong>Shared TypeScript Models, Permission Bitflags, BitField & Error Classes for Strafe.js</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/util"><img src="https://img.shields.io/npm/v/@strafe-js/util.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/util` is the zero-dependency foundational package of the Strafe.js monorepo. It provides:

- **28 Official Strafe Permission Bitflags (`Permission` & `ALL_PERMISSIONS`)** and **`BitField`** manipulation class.
- **Constants**: `RoomType` (`PM` through `Thread`) and `GatewayOp` (`Heartbeat` through `Error`).
- **Error Classes**: `StrafeError` and `RateLimitError` (with `retryAfter`).
- **Helpers**: `resolvePermission()`, `isSnowflake()`, and `sleep()`.
- **TypeScript Interfaces**: `User`, `Space`, `Room`, `ThreadMetadata`, `Role`, `PermissionOverride`, `Message`, `MessageReaction`, `Attachment`, `SpaceMember`, `ReadyPayload`, `GatewayEventEnvelope`, and `GatewayFrame`.

---

## Installation

```sh
npm install @strafe-js/util
```

---

## Usage

### 1. `BitField` & `Permission`

```ts
import { BitField, Permission, ALL_PERMISSIONS, resolvePermission } from '@strafe-js/util';

const perms = new BitField(Permission.ViewRoom | Permission.SendMessages);

// Add permissions by name, number, or array
perms.add('AddReactions', 'AttachFiles');

// Check if all specified permissions are present
console.log(perms.has(['ViewRoom', 'SendMessages'])); // true

// Remove a permission
perms.remove('AttachFiles');

// Convert active bits to an array of PermissionName strings
console.log(perms.toArray()); // ['ViewRoom', 'SendMessages', 'AddReactions']
console.log(perms.valueOf()); // numeric bitmask
```

### 2. Permission Bitflags Table (`Permission`)

Matches the official [Strafe Permissions Bit Table](https://app.strafe.chat/docs/permissions/#the-bits):

| Permission Name | Bit Shift | Decimal Value | Category |
| :--- | :--- | :--- | :--- |
| `ViewRoom` | `1 << 0` | `1` | General |
| `SendMessages` | `1 << 1` | `2` | Text |
| `ReadMessageHistory` | `1 << 2` | `4` | Text |
| `AddReactions` | `1 << 3` | `8` | Text |
| `UseExternalEmojis` | `1 << 4` | `16` | Text |
| `MentionEveryone` | `1 << 5` | `32` | Text |
| `ManageMessages` | `1 << 6` | `64` | Moderation |
| `ManageRoles` | `1 << 7` | `128` | Moderation |
| `ManageRooms` | `1 << 8` | `256` | Moderation |
| `KickMembers` | `1 << 9` | `512` | Moderation |
| `BanMembers` | `1 << 10` | `1024` | Moderation |
| `Administrator` | `1 << 11` | `2048` | Moderation |
| `ManageSpace` | `1 << 12` | `4096` | Moderation |
| `CreateInvite` | `1 << 13` | `8192` | General |
| `ManageEmojis` | `1 << 14` | `16384` | Moderation |
| `Connect` | `1 << 15` | `32768` | Voice |
| `Speak` | `1 << 16` | `65536` | Voice |
| `Video` | `1 << 17` | `131072` | Voice |
| `MuteMembers` | `1 << 18` | `262144` | Voice |
| `DeafenMembers` | `1 << 19` | `524288` | Voice |
| `MoveMembers` | `1 << 20` | `1048576` | Voice |
| `UseVoiceActivity` | `1 << 21` | `2097152` | Voice |
| `PrioritySpeaker` | `1 << 22` | `4194304` | Voice |
| `AttachFiles` | `1 << 23` | `8388608` | Text |
| `CreatePublicThreads` | `1 << 24` | `16777216` | Threads |
| `CreatePrivateThreads` | `1 << 25` | `33554432` | Threads |
| `SendMessagesInThreads` | `1 << 26` | `67108864` | Threads |
| `ManageThreads` | `1 << 27` | `134217728` | Threads |

### 3. Utility Functions & Constants

```ts
import { isSnowflake, sleep, RoomType, GatewayOp } from '@strafe-js/util';

isSnowflake('123456789012345678'); // true (16..20 digits)
await sleep(1000); // 1 second delay

console.log(RoomType.Text); // 3
console.log(GatewayOp.Event); // 3
```

## License

Apache-2.0
