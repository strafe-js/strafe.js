import { Snowflake } from '@strafe-js/util';

/**
 * Formats a User {@link Snowflake} ID into an inline Strafe user mention token (`<@id>`).
 *
 * @example
 * ```ts
 * userMention('123456789012345678'); // "<@123456789012345678>"
 * ```
 */
export const userMention = (id: Snowflake): string => `<@${id}>`;

/**
 * Formats a Role {@link Snowflake} ID into an inline Strafe role mention token (`<@&id>`).
 *
 * @example
 * ```ts
 * roleMention('234567890123456789'); // "<@&234567890123456789>"
 * ```
 */
export const roleMention = (id: Snowflake): string => `<@&${id}>`;

/**
 * Formats a Room {@link Snowflake} ID into an inline Strafe room link token (`<#id>`).
 *
 * @example
 * ```ts
 * roomMention('345678901234567890'); // "<#345678901234567890>"
 * ```
 */
export const roomMention = (id: Snowflake): string => `<#${id}>`;

/**
 * Formats a custom Strafe emoji tag (`<:name:id>` when static, or `<a:name:id>` when `animated` is `true`)
 * for embedding inside message content.
 *
 * @example
 * ```ts
 * customEmoji('wave', '456789012345678901');       // "<:wave:456789012345678901>"
 * customEmoji('party', '456789012345678901', true); // "<a:party:456789012345678901>"
 * ```
 */
export const customEmoji = (
  name: string,
  id: Snowflake,
  animated = false,
): string => `<${animated ? 'a' : ''}:${name}:${id}>`;

/**
 * Formats a custom emoji {@link Snowflake} ID into the `custom:<id>` identifier expected by
 * `rest.addReaction()`, `rest.removeReaction()`, and `rest.getReactions()`.
 *
 * @example
 * ```ts
 * await client.rest.addReaction(roomId, messageId, customReactionEmoji('456789012345678901'));
 * ```
 */
export const customReactionEmoji = (id: Snowflake): string => `custom:${id}`;

/**
 * Backslash-escapes Markdown control characters (`*`, `_`, `` ` ``, `~`, `|`, `\`) in untrusted text.
 *
 * @example
 * ```ts
 * escapeMarkdown('**bold_and_italic**'); // "\\*\\*bold\\_and\\_italic\\*\\*"
 * ```
 */
export const escapeMarkdown = (text: string): string =>
  text.replace(/([*_`~|\\])/g, '\\$1');

/**
 * Wraps `text` in bold Markdown syntax (`**text**`).
 *
 * @example
 * ```ts
 * bold('Warning'); // "**Warning**"
 * ```
 */
export const bold = (text: string): string => `**${text}**`;

/**
 * Wraps `text` in italic Markdown syntax (`*text*`).
 *
 * @example
 * ```ts
 * italic('note'); // "*note*"
 * ```
 */
export const italic = (text: string): string => `*${text}*`;

/**
 * Wraps `text` in underline Markdown syntax (`__text__`).
 *
 * @example
 * ```ts
 * underline('important'); // "__important__"
 * ```
 */
export const underline = (text: string): string => `__${text}__`;

/**
 * Wraps `text` in strikethrough Markdown syntax (`~~text~~`).
 *
 * @example
 * ```ts
 * strikethrough('deprecated'); // "~~deprecated~~"
 * ```
 */
export const strikethrough = (text: string): string => `~~${text}~~`;

/**
 * Wraps `text` in spoiler Markdown syntax (`||text||`).
 *
 * @example
 * ```ts
 * spoiler('secret code'); // "||secret code||"
 * ```
 */
export const spoiler = (text: string): string => `||${text}||`;

/**
 * Wraps `text` in single backticks for inline code formatting (`` `text` ``).
 *
 * @example
 * ```ts
 * inlineCode('npm test'); // "`npm test`"
 * ```
 */
export const inlineCode = (text: string): string => `\`${text}\``;

/**
 * Wraps `code` in a fenced multi-line Markdown code block (` ```language\ncode\n``` `).
 *
 * @example
 * ```ts
 * codeBlock('const x = 1;', 'ts'); // "```ts\nconst x = 1;\n```"
 * ```
 */
export const codeBlock = (code: string, language = ''): string =>
  `\`\`\`${language}\n${code}\n\`\`\``;

/**
 * Prefixes `text` with `> ` to format a single-line block quote.
 *
 * @example
 * ```ts
 * quote('Quoted line'); // "> Quoted line"
 * ```
 */
export const quote = (text: string): string => `> ${text}`;

/**
 * Prefixes `text` with `>>> ` to format a multi-line block quote.
 *
 * @example
 * ```ts
 * blockQuote('Line 1\nLine 2'); // ">>> Line 1\nLine 2"
 * ```
 */
export const blockQuote = (text: string): string => `>>> ${text}`;

/**
 * Formats a clickable Markdown link (`[label](url)`).
 *
 * @example
 * ```ts
 * hyperlink('Strafe Docs', 'https://app.strafe.chat/docs'); // "[Strafe Docs](https://app.strafe.chat/docs)"
 * ```
 */
export const hyperlink = (label: string, url: string): string =>
  `[${label}](${url})`;
