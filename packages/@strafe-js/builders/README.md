<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>@strafe-js/builders</h1>
	<p>
		<strong>Fluent Message Payload & Permission Bitmask Builders for Strafe.js</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/builders"><img src="https://img.shields.io/npm/v/@strafe-js/builders.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/builders` provides ergonomic, chainable builders for constructing Strafe REST API payloads (`CreateMessageBody`) and computing bitwise permission masks.

---

## Installation

```sh
npm install @strafe-js/builders @strafe-js/util
```

---

## Usage

### 1. `MessageBuilder` & `message()`

Use `message()` (or `new MessageBuilder()`) to fluently construct a `CreateMessageBody` object for `rest.createMessage()` or `ctx.send()`:

```ts
import { message, MessageBuilder } from '@strafe-js/builders';

const body = message()
  .setContent('Hello everyone! Check out these attachments.')
  .setReply('112233445566778899')
  .setMentions(['223344556677889900'])
  .setRoleMentions(['334455667788990011'])
  .mentionEveryone(false)
  .setAttachments(['445566778899001122'])
  .toJSON();

await client.rest.createMessage(roomId, body);
```

#### `MessageBuilder` Methods

| Method | Signature | Description |
| :--- | :--- | :--- |
| `setContent` | `(text: string) => this` | Sets `plaintext` message content |
| `setReply` | `(messageId: Snowflake) => this` | Sets `reply_to_id` to reply to an existing message |
| `setMentions` | `(userIds: Snowflake[]) => this` | Sets explicit user IDs in `mentions` |
| `setRoleMentions` | `(roleIds: Snowflake[]) => this` | Sets explicit role IDs in `mention_roles` |
| `mentionEveryone` | `(allowed?: boolean) => this` | Toggles `mention_everyone` (default `true` when called without args) |
| `setAttachments` | `(ids: Snowflake[]) => this` | Attaches uploaded attachment IDs |
| `toJSON` | `() => CreateMessageBody` | Returns a shallow copy of the constructed `CreateMessageBody` |

---

### 2. Permission Mask Helpers (`permissions` & `permissionMask`)

Compute numeric permission bitmasks from human-readable `PermissionName` strings or nested `PermissionResolvable` values:

```ts
import { permissions, permissionMask } from '@strafe-js/builders';

// From an array of PermissionName strings
const modMask = permissions(['ViewRoom', 'KickMembers', 'BanMembers', 'ManageMessages']);

// Variadic helper accepting PermissionName strings, numeric masks, or arrays
const fullMask = permissionMask('SendMessages', 'AttachFiles', modMask);
```

## License

Apache-2.0
