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
//# sourceMappingURL=index.d.ts.map