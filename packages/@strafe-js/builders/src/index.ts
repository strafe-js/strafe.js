import {
  BitField,
  resolvePermission,
  type CreateMessageBody,
  type PermissionName,
  type PermissionResolvable,
  type Snowflake,
} from '@strafe-js/util';

/**
 * Fluent builder for constructing {@link CreateMessageBody} payloads to send via `client.rest.createMessage()`
 * or `ctx.send()` / `ctx.reply()`.
 *
 * @example
 * ```ts
 * import { message } from '@strafe-js/builders';
 *
 * const payload = message()
 *   .setContent('Welcome to the server! Please read the rules.')
 *   .setReply('112233445566778899')
 *   .setMentions(['223344556677889900'])
 *   .mentionEveryone(false)
 *   .toJSON();
 *
 * await client.rest.createMessage(roomId, payload);
 * ```
 */
export class MessageBuilder {
  private data: CreateMessageBody = {};

  /**
   * Sets the plaintext content of the message.
   *
   * @param text - Message text content.
   * @returns This `MessageBuilder` instance for chaining.
   * @example
   * ```ts
   * const body = message().setContent('Hello world!').toJSON();
   * ```
   */
  setContent(text: string): this {
    this.data.plaintext = text;
    return this;
  }

  /**
   * Sets `reply_to_id` so the message replies directly to an existing message in the room.
   *
   * @param messageId - Snowflake ID of the message being replied to.
   * @returns This `MessageBuilder` instance for chaining.
   * @example
   * ```ts
   * const body = message().setContent('Replying!').setReply(msg.id).toJSON();
   * ```
   */
  setReply(messageId: Snowflake): this {
    this.data.reply_to_id = messageId;
    return this;
  }

  /**
   * Explicitly specifies which User IDs should be notified by this message.
   *
   * @param userIds - Array of user Snowflake IDs.
   * @returns This `MessageBuilder` instance for chaining.
   * @example
   * ```ts
   * const body = message().setContent('Hey <@123>!').setMentions(['123']).toJSON();
   * ```
   */
  setMentions(userIds: Snowflake[]): this {
    this.data.mentions = userIds;
    return this;
  }

  /**
   * Explicitly specifies which Role IDs should be notified by this message.
   *
   * @param roleIds - Array of role Snowflake IDs.
   * @returns This `MessageBuilder` instance for chaining.
   * @example
   * ```ts
   * const body = message().setContent('Alert <@&456>!').setRoleMentions(['456']).toJSON();
   * ```
   */
  setRoleMentions(roleIds: Snowflake[]): this {
    this.data.mention_roles = roleIds;
    return this;
  }

  /**
   * Enables or disables `@everyone` notifications in the message payload.
   *
   * @param value - Whether `@everyone` mention notification is enabled (defaults to `true`).
   * @returns This `MessageBuilder` instance for chaining.
   * @example
   * ```ts
   * const body = message().setContent('@everyone update').mentionEveryone(true).toJSON();
   * ```
   */
  mentionEveryone(value = true): this {
    this.data.mention_everyone = value;
    return this;
  }

  /**
   * Attaches previously uploaded attachment IDs (from `rest.uploadAttachment`) to the message.
   *
   * @param ids - Array of uploaded Attachment Snowflake IDs.
   * @returns This `MessageBuilder` instance for chaining.
   * @example
   * ```ts
   * const uploaded = await client.rest.uploadAttachment(roomId, buf, 'report.txt');
   * const body = message().setContent('Report attached').setAttachments([uploaded.id]).toJSON();
   * ```
   */
  setAttachments(ids: Snowflake[]): this {
    this.data.attachments = ids;
    return this;
  }

  /**
   * Returns a shallow copy of the constructed {@link CreateMessageBody} payload ready for REST calls.
   *
   * @returns Constructed `CreateMessageBody` object.
   * @example
   * ```ts
   * const payload = message().setContent('Ready').toJSON();
   * ```
   */
  toJSON(): CreateMessageBody {
    return { ...this.data };
  }
}

/**
 * Factory helper that creates a new fluent {@link MessageBuilder} instance.
 *
 * @returns A new `MessageBuilder`.
 * @example
 * ```ts
 * const payload = message().setContent('Hello Strafe!').toJSON();
 * ```
 */
export function message(): MessageBuilder {
  return new MessageBuilder();
}

/**
 * Resolves an array of {@link PermissionName} strings into a numeric permission bitmask.
 *
 * @param list - Array of permission names to combine.
 * @returns Numeric bitwise OR permission mask.
 * @example
 * ```ts
 * const mask = permissions(['ViewRoom', 'SendMessages', 'AttachFiles']);
 * ```
 */
export function permissions(list: PermissionName[]): number {
  return resolvePermission(list);
}

/**
 * Variadic helper that resolves any combination of {@link PermissionName} strings,
 * numeric masks, or nested arrays into a single numeric permission bitmask.
 *
 * @param bits - Permission names, numbers, or arrays to combine.
 * @returns Combined numeric permission bitmask.
 * @example
 * ```ts
 * const mask = permissionMask('ViewRoom', 'SendMessages', ['AttachFiles', 'AddReactions']);
 * ```
 */
export function permissionMask(...bits: PermissionResolvable[]): number {
  return new BitField().add(...bits).bitfield;
}
