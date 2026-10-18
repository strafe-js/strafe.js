import { Snowflake } from '@strafe-js/util';
/**
 * Formats a User {@link Snowflake} ID into an inline Strafe user mention token (`<@id>`).
 *
 * @example
 * ```ts
 * userMention('123456789012345678'); // "<@123456789012345678>"
 * ```
 */
export declare const userMention: (id: Snowflake) => string;
/**
 * Formats a Role {@link Snowflake} ID into an inline Strafe role mention token (`<@&id>`).
 *
 * @example
 * ```ts
 * roleMention('234567890123456789'); // "<@&234567890123456789>"
 * ```
 */
export declare const roleMention: (id: Snowflake) => string;
/**
 * Formats a Room {@link Snowflake} ID into an inline Strafe room link token (`<#id>`).
 *
 * @example
 * ```ts
 * roomMention('345678901234567890'); // "<#345678901234567890>"
 * ```
 */
export declare const roomMention: (id: Snowflake) => string;
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
export declare const customEmoji: (name: string, id: Snowflake, animated?: boolean) => string;
/**
 * Formats a custom emoji {@link Snowflake} ID into the `custom:<id>` identifier expected by
 * `rest.addReaction()`, `rest.removeReaction()`, and `rest.getReactions()`.
 *
 * @example
 * ```ts
 * await client.rest.addReaction(roomId, messageId, customReactionEmoji('456789012345678901'));
 * ```
 */
export declare const customReactionEmoji: (id: Snowflake) => string;
/**
 * Backslash-escapes Markdown control characters (`*`, `_`, `` ` ``, `~`, `|`, `\`) in untrusted text.
 *
 * @example
 * ```ts
 * escapeMarkdown('**bold_and_italic**'); // "\\*\\*bold\\_and\\_italic\\*\\*"
 * ```
 */
export declare const escapeMarkdown: (text: string) => string;
/**
 * Wraps `text` in bold Markdown syntax (`**text**`).
 *
 * @example
 * ```ts
 * bold('Warning'); // "**Warning**"
 * ```
 */
export declare const bold: (text: string) => string;
/**
 * Wraps `text` in italic Markdown syntax (`*text*`).
 *
 * @example
 * ```ts
 * italic('note'); // "*note*"
 * ```
 */
export declare const italic: (text: string) => string;
/**
 * Wraps `text` in underline Markdown syntax (`__text__`).
 *
 * @example
 * ```ts
 * underline('important'); // "__important__"
 * ```
 */
export declare const underline: (text: string) => string;
/**
 * Wraps `text` in strikethrough Markdown syntax (`~~text~~`).
 *
 * @example
 * ```ts
 * strikethrough('deprecated'); // "~~deprecated~~"
 * ```
 */
export declare const strikethrough: (text: string) => string;
/**
 * Wraps `text` in spoiler Markdown syntax (`||text||`).
 *
 * @example
 * ```ts
 * spoiler('secret code'); // "||secret code||"
 * ```
 */
export declare const spoiler: (text: string) => string;
/**
 * Wraps `text` in single backticks for inline code formatting (`` `text` ``).
 *
 * @example
 * ```ts
 * inlineCode('npm test'); // "`npm test`"
 * ```
 */
export declare const inlineCode: (text: string) => string;
/**
 * Wraps `code` in a fenced multi-line Markdown code block (` ```language\ncode\n``` `).
 *
 * @example
 * ```ts
 * codeBlock('const x = 1;', 'ts'); // "```ts\nconst x = 1;\n```"
 * ```
 */
export declare const codeBlock: (code: string, language?: string) => string;
/**
 * Prefixes `text` with `> ` to format a single-line block quote.
 *
 * @example
 * ```ts
 * quote('Quoted line'); // "> Quoted line"
 * ```
 */
export declare const quote: (text: string) => string;
/**
 * Prefixes `text` with `>>> ` to format a multi-line block quote.
 *
 * @example
 * ```ts
 * blockQuote('Line 1\nLine 2'); // ">>> Line 1\nLine 2"
 * ```
 */
export declare const blockQuote: (text: string) => string;
/**
 * Formats a clickable Markdown link (`[label](url)`).
 *
 * @example
 * ```ts
 * hyperlink('Strafe Docs', 'https://app.strafe.chat/docs'); // "[Strafe Docs](https://app.strafe.chat/docs)"
 * ```
 */
export declare const hyperlink: (label: string, url: string) => string;
//# sourceMappingURL=index.d.ts.map