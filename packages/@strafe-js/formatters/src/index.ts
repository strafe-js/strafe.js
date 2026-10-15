import { Snowflake } from '@strafe-js/util';

/**
 * Formats a User {@link Snowflake} ID into a Strafe user mention string (`<@id>`).
 *
 * @param id - Target User Snowflake ID.
 * @returns Formatted user mention string (`<@id>`).
 * @example
 * ```ts
 * userMention('123456789012345678'); // "<@123456789012345678>"
 * ```
 */
export const userMention = (id: Snowflake): string => `<@${id}>`;

/**
 * Formats a Role {@link Snowflake} ID into a Strafe role mention string (`<@&id>`).
 *
 * @param id - Target Role Snowflake ID.
 * @returns Formatted role mention string (`<@&id>`).
 * @example
 * ```ts
 * roleMention('234567890123456789'); // "<@&234567890123456789>"
 * ```
 */
export const roleMention = (id: Snowflake): string => `<@&${id}>`;

/**
 * Formats a Room {@link Snowflake} ID into a Strafe room mention string (`<#id>`).
 *
 * @param id - Target Room Snowflake ID.
 * @returns Formatted room mention string (`<#id>`).
 * @example
 * ```ts
 * roomMention('345678901234567890'); // "<#345678901234567890>"
 * ```
 */
export const roomMention = (id: Snowflake): string => `<#${id}>`;

/**
 * Formats a static (`<:name:id>`) or animated (`<a:name:id>`) custom Strafe emoji tag for message content.
 *
 * @param name - Emoji name.
 * @param id - Emoji Snowflake ID.
 * @param animated - Whether the emoji is animated (defaults to `false`).
 * @returns Formatted custom emoji tag string.
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
 * Formats a custom emoji Snowflake ID for use with reaction endpoints (`custom:<id>`).
 *
 * @param id - Custom emoji Snowflake ID.
 * @returns Reaction emoji identifier (`custom:<id>`).
 * @example
 * ```ts
 * await client.rest.addReaction(roomId, messageId, customReactionEmoji('456789012345678901'));
 * ```
 */
export const customReactionEmoji = (id: Snowflake): string => `custom:${id}`;

/**
 * Escapes special Markdown formatting characters (`*`, `_`, `` ` ``, `~`, `|`, `\`) in user-supplied text
 * to prevent unintended formatting.
 *
 * @param text - Raw input string to escape.
 * @returns Markdown-escaped string.
 * @example
 * ```ts
 * escapeMarkdown('**bold_and_italic**'); // "\\*\\*bold\\_and\\_italic\\*\\*"
 * ```
 */
export const escapeMarkdown = (text: string): string =>
  text.replace(/([*_`~|\\])/g, '\\$1');
