"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hyperlink = exports.blockQuote = exports.quote = exports.codeBlock = exports.inlineCode = exports.spoiler = exports.strikethrough = exports.underline = exports.italic = exports.bold = exports.escapeMarkdown = exports.customReactionEmoji = exports.customEmoji = exports.roomMention = exports.roleMention = exports.userMention = void 0;
/**
 * Formats a User {@link Snowflake} ID into an inline Strafe user mention token (`<@id>`).
 *
 * @example
 * ```ts
 * userMention('123456789012345678'); // "<@123456789012345678>"
 * ```
 */
const userMention = (id) => `<@${id}>`;
exports.userMention = userMention;
/**
 * Formats a Role {@link Snowflake} ID into an inline Strafe role mention token (`<@&id>`).
 *
 * @example
 * ```ts
 * roleMention('234567890123456789'); // "<@&234567890123456789>"
 * ```
 */
const roleMention = (id) => `<@&${id}>`;
exports.roleMention = roleMention;
/**
 * Formats a Room {@link Snowflake} ID into an inline Strafe room link token (`<#id>`).
 *
 * @example
 * ```ts
 * roomMention('345678901234567890'); // "<#345678901234567890>"
 * ```
 */
const roomMention = (id) => `<#${id}>`;
exports.roomMention = roomMention;
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
const customEmoji = (name, id, animated = false) => `<${animated ? 'a' : ''}:${name}:${id}>`;
exports.customEmoji = customEmoji;
/**
 * Formats a custom emoji {@link Snowflake} ID into the `custom:<id>` identifier expected by
 * `rest.addReaction()`, `rest.removeReaction()`, and `rest.getReactions()`.
 *
 * @example
 * ```ts
 * await client.rest.addReaction(roomId, messageId, customReactionEmoji('456789012345678901'));
 * ```
 */
const customReactionEmoji = (id) => `custom:${id}`;
exports.customReactionEmoji = customReactionEmoji;
/**
 * Backslash-escapes Markdown control characters (`*`, `_`, `` ` ``, `~`, `|`, `\`) in untrusted text.
 *
 * @example
 * ```ts
 * escapeMarkdown('**bold_and_italic**'); // "\\*\\*bold\\_and\\_italic\\*\\*"
 * ```
 */
const escapeMarkdown = (text) => text.replace(/([*_`~|\\])/g, '\\$1');
exports.escapeMarkdown = escapeMarkdown;
/**
 * Wraps `text` in bold Markdown syntax (`**text**`).
 *
 * @example
 * ```ts
 * bold('Warning'); // "**Warning**"
 * ```
 */
const bold = (text) => `**${text}**`;
exports.bold = bold;
/**
 * Wraps `text` in italic Markdown syntax (`*text*`).
 *
 * @example
 * ```ts
 * italic('note'); // "*note*"
 * ```
 */
const italic = (text) => `*${text}*`;
exports.italic = italic;
/**
 * Wraps `text` in underline Markdown syntax (`__text__`).
 *
 * @example
 * ```ts
 * underline('important'); // "__important__"
 * ```
 */
const underline = (text) => `__${text}__`;
exports.underline = underline;
/**
 * Wraps `text` in strikethrough Markdown syntax (`~~text~~`).
 *
 * @example
 * ```ts
 * strikethrough('deprecated'); // "~~deprecated~~"
 * ```
 */
const strikethrough = (text) => `~~${text}~~`;
exports.strikethrough = strikethrough;
/**
 * Wraps `text` in spoiler Markdown syntax (`||text||`).
 *
 * @example
 * ```ts
 * spoiler('secret code'); // "||secret code||"
 * ```
 */
const spoiler = (text) => `||${text}||`;
exports.spoiler = spoiler;
/**
 * Wraps `text` in single backticks for inline code formatting (`` `text` ``).
 *
 * @example
 * ```ts
 * inlineCode('npm test'); // "`npm test`"
 * ```
 */
const inlineCode = (text) => `\`${text}\``;
exports.inlineCode = inlineCode;
/**
 * Wraps `code` in a fenced multi-line Markdown code block (` ```language\ncode\n``` `).
 *
 * @example
 * ```ts
 * codeBlock('const x = 1;', 'ts'); // "```ts\nconst x = 1;\n```"
 * ```
 */
const codeBlock = (code, language = '') => `\`\`\`${language}\n${code}\n\`\`\``;
exports.codeBlock = codeBlock;
/**
 * Prefixes `text` with `> ` to format a single-line block quote.
 *
 * @example
 * ```ts
 * quote('Quoted line'); // "> Quoted line"
 * ```
 */
const quote = (text) => `> ${text}`;
exports.quote = quote;
/**
 * Prefixes `text` with `>>> ` to format a multi-line block quote.
 *
 * @example
 * ```ts
 * blockQuote('Line 1\nLine 2'); // ">>> Line 1\nLine 2"
 * ```
 */
const blockQuote = (text) => `>>> ${text}`;
exports.blockQuote = blockQuote;
/**
 * Formats a clickable Markdown link (`[label](url)`).
 *
 * @example
 * ```ts
 * hyperlink('Strafe Docs', 'https://app.strafe.chat/docs'); // "[Strafe Docs](https://app.strafe.chat/docs)"
 * ```
 */
const hyperlink = (label, url) => `[${label}](${url})`;
exports.hyperlink = hyperlink;
//# sourceMappingURL=index.js.map