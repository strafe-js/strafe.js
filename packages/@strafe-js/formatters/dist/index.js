"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = exports.customReactionEmoji = exports.customEmoji = exports.roomMention = exports.roleMention = exports.userMention = void 0;
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
//# sourceMappingURL=index.js.map