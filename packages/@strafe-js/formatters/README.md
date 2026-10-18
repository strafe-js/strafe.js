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

`@strafe-js/formatters` provides string formatting functions for user, role, and room mentions, static or animated custom emojis, and Markdown escaping.

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
  customReactionEmoji,
  escapeMarkdown,
} from '@strafe-js/formatters';

const user = userMention('123456789012345678'); // "<@123456789012345678>"
const role = roleMention('234567890123456789'); // "<@&234567890123456789>"
const room = roomMention('345678901234567890'); // "<#345678901234567890>"
const staticIcon = customEmoji('strafe', '456789012345678901'); // "<:strafe:456789012345678901>"
const animIcon = customEmoji('party', '456789012345678901', true); // "<a:party:456789012345678901>"
const reactionId = customReactionEmoji('456789012345678901'); // "custom:456789012345678901"
const safeName = escapeMarkdown('**Admin_User**'); // "\\*\\*Admin\\_User\\*\\*"
```

| Function | Signature | Output Format |
| :--- | :--- | :--- |
| `userMention` | `(id: Snowflake) => string` | `<@${id}>` |
| `roleMention` | `(id: Snowflake) => string` | `<@&${id}>` |
| `roomMention` | `(id: Snowflake) => string` | `<#${id}>` |
| `customEmoji` | `(name: string, id: Snowflake, animated?: boolean) => string` | `<:${name}:${id}>` or `<a:${name}:${id}>` |
| `customReactionEmoji` | `(id: Snowflake) => string` | `custom:${id}` |
| `escapeMarkdown` | `(text: string) => string` | Escapes `\*`, `\_`, `` \` ``, `\~`, `\|`, `\\` |
| `bold` / `italic` / `underline` / `strikethrough` / `spoiler` | `(text: string) => string` | `**text**`, `*text*`, `__text__`, `~~text~~`, `\|\|text\|\|` |
| `inlineCode` / `codeBlock` | `(code: string, language?: string) => string` | `` `code` `` or fenced code block |
| `quote` / `blockQuote` / `hyperlink` | `(text: string) => string` / `(label, url) => string` | `> text`, `>>> text`, `[label](url)` |

## License

Apache-2.0
