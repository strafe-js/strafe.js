<div align="center">
	<br />
	<a href="https://app.strafe.chat/docs/">
		<img src="https://app.strafe.chat/icons/icon-192.png" width="64" height="64" alt="Strafe" />
	</a>
	<h1>@strafe-js/formatters</h1>
	<p>
		<strong>Mentions, Custom Emoji & Markdown Formatting Helpers for Strafe Chat</strong>
	</p>
	<p>
		<a href="https://www.npmjs.com/package/@strafe-js/formatters"><img src="https://img.shields.io/npm/v/@strafe-js/formatters.svg?color=509b6b" alt="npm version" /></a>
		<a href="https://github.com/strafe-js/strafe.js"><img src="https://img.shields.io/github/license/strafe-js/strafe.js?color=509b6b" alt="License" /></a>
	</p>
</div>

---

## Overview

`@strafe-js/formatters` provides lightweight string formatting utilities for constructing user, role, and room mentions, rendering static or animated custom emojis, and safely escaping user-supplied Markdown text.

---

## Installation

```sh
npm install @strafe-js/formatters @strafe-js/util
```

---

## Usage & API Reference

```ts
import {
  userMention,
  roleMention,
  roomMention,
  customEmoji,
  escapeMarkdown,
} from '@strafe-js/formatters';

// 1. User Mention: "<@123456789012345678>"
const user = userMention('123456789012345678');

// 2. Role Mention: "<@&234567890123456789>"
const role = roleMention('234567890123456789');

// 3. Room Mention: "<#345678901234567890>"
const room = roomMention('345678901234567890');

// 4. Static Custom Emoji: "<:strafe:456789012345678901>"
const staticIcon = customEmoji('strafe', '456789012345678901');

// 5. Animated Custom Emoji: "<a:party:456789012345678901>"
const animIcon = customEmoji('party', '456789012345678901', true);

// 6. Escape Markdown characters (* _ ` ~ | \)
const safeName = escapeMarkdown('**Admin_User**'); // "\\*\\*Admin\\_User\\*\\*"
```

| Function | Signature | Output Format |
| :--- | :--- | :--- |
| `userMention` | `(id: Snowflake) => string` | `<@${id}>` |
| `roleMention` | `(id: Snowflake) => string` | `<@&${id}>` |
| `roomMention` | `(id: Snowflake) => string` | `<#${id}>` |
| `customEmoji` | `(name: string, id: Snowflake, animated?: boolean) => string` | `<:${name}:${id}>` or `<a:${name}:${id}>` |
| `escapeMarkdown` | `(text: string) => string` | Escapes `\*`, `\_`, `` \` ``, `\~`, `\|`, `\\` |

## License

Apache-2.0
