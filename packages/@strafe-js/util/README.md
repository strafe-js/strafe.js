<div align="center">
	<br />
	<h1>@strafe-js/util</h1>
	<p>
		<strong>Shared TypeScript Models, Permission Bitflags, BitField & Error Classes for Strafe.js</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/util"><img src="https://img.shields.io/npm/v/@strafe-js/util.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/util` is the zero-dependency foundational package of the Strafe.js monorepo. It provides:

- **28 Permission Bitflags (`Permission` & `ALL_PERMISSIONS`)** and **`BitField`** manipulation class.
- **Constants**: `RoomType` (`PM` through `Thread`) and `GatewayOp` (`Heartbeat` through `Error`).
- **Error Classes**: `StrafeError` and `RateLimitError` (with `retryAfter`).
- **Helpers**: `resolvePermission()`, `isSnowflake()`, and `sleep()`.
- **TypeScript Interfaces**: `User`, `Space`, `Room`, `Role`, `PermissionOverride`, `Message`, `Attachment`, `SpaceMember`, `ReadyPayload`, and `GatewayFrame`.

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
perms.add('EmbedLinks', 'AttachFiles');

// Check if all specified permissions are present
console.log(perms.has(['ViewRoom', 'SendMessages'])); // true

// Remove a permission
perms.remove('AttachFiles');

// Convert active bits to an array of PermissionName strings
console.log(perms.toArray()); // ['ViewRoom', 'SendMessages', 'EmbedLinks']
console.log(perms.valueOf()); // numeric bitmask
```

### 2. Permission Bitflags Table (`Permission`)

| Permission Name | Bit Shift | Decimal Value |
| :--- | :--- | :--- |
| `ViewRoom` | `1 << 0` | `1` |
| `ManageSpace` | `1 << 1` | `2` |
| `ManageRoles` | `1 << 2` | `4` |
| `ManageRooms` | `1 << 3` | `8` |
| `KickMembers` | `1 << 4` | `16` |
| `BanMembers` | `1 << 5` | `32` |
| `CreateInvites` | `1 << 6` | `64` |
| `ChangeNickname` | `1 << 7` | `128` |
| `ManageNicknames` | `1 << 8` | `256` |
| `ManageEmojis` | `1 << 9` | `512` |
| `SendMessages` | `1 << 10` | `1024` |
| `EmbedLinks` | `1 << 11` | `2048` |
| `AttachFiles` | `1 << 12` | `4096` |
| `AddReactions` | `1 << 13` | `8192` |
| `UseExternalEmojis` | `1 << 14` | `16384` |
| `MentionEveryone` | `1 << 15` | `32768` |
| `ManageMessages` | `1 << 16` | `65536` |
| `ReadMessageHistory` | `1 << 17` | `131072` |
| `SendVoiceMessages` | `1 << 18` | `262144` |
| `Connect` | `1 << 19` | `524288` |
| `Speak` | `1 << 20` | `1048576` |
| `Video` | `1 << 21` | `2097152` |
| `MuteMembers` | `1 << 22` | `4194304` |
| `DeafenMembers` | `1 << 23` | `8388608` |
| `MoveMembers` | `1 << 24` | `16777216` |
| `Administrator` | `1 << 25` | `33554432` |
| `SendMessagesInThreads` | `1 << 26` | `67108864` |
| `ManageThreads` | `1 << 27` | `134217728` |

### 3. Utility Functions & Constants

```ts
import { isSnowflake, sleep, RoomType, GatewayOp } from '@strafe-js/util';

isSnowflake('123456789012345678'); // true (16–20 digits)
await sleep(1000); // 1 second delay

console.log(RoomType.Text); // 3
console.log(GatewayOp.Event); // 3
```

## License

Apache-2.0
