import { type CreateMessageBody, type PermissionName, type PermissionResolvable, type Snowflake } from '@strafe-js/util';
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
export declare class MessageBuilder {
    private data;
    /**
     * Sets the `plaintext` field on the underlying {@link CreateMessageBody}.
     *
     * @example
     * ```ts
     * const body = message().setContent('Hello world!').toJSON();
     * ```
     */
    setContent(text: string): this;
    /**
     * Sets `reply_to_id` so the message references an existing message in the same room.
     *
     * @example
     * ```ts
     * const body = message().setContent('Replying!').setReply(msg.id).toJSON();
     * ```
     */
    setReply(messageId: Snowflake): this;
    /**
     * Sets the explicit `mentions` array of User {@link Snowflake} IDs to notify.
     *
     * @example
     * ```ts
     * const body = message().setContent('Hey <@123>!').setMentions(['123']).toJSON();
     * ```
     */
    setMentions(userIds: Snowflake[]): this;
    /**
     * Sets the explicit `mention_roles` array of Role {@link Snowflake} IDs to notify.
     *
     * @example
     * ```ts
     * const body = message().setContent('Alert <@&456>!').setRoleMentions(['456']).toJSON();
     * ```
     */
    setRoleMentions(roleIds: Snowflake[]): this;
    /**
     * Sets `mention_everyone` (defaults to `true`). Requires `Permission.MentionEveryone` and `Permission.SendMessages`.
     *
     * @example
     * ```ts
     * const body = message().setContent('@everyone update').mentionEveryone(true).toJSON();
     * ```
     */
    mentionEveryone(value?: boolean): this;
    /**
     * Sets the `attachments` array of uploaded Attachment {@link Snowflake} IDs returned by `rest.uploadAttachment()`.
     *
     * @example
     * ```ts
     * const uploaded = await client.rest.uploadAttachment(roomId, buf, 'report.txt');
     * const body = message().setContent('Report attached').setAttachments([uploaded.id]).toJSON();
     * ```
     */
    setAttachments(ids: Snowflake[]): this;
    /**
     * Returns a shallow clone of the built {@link CreateMessageBody} payload.
     *
     * @example
     * ```ts
     * const payload = message().setContent('Ready').toJSON();
     * ```
     */
    toJSON(): CreateMessageBody;
}
/**
 * Creates a new {@link MessageBuilder} instance.
 *
 * @example
 * ```ts
 * const payload = message().setContent('Hello Strafe!').toJSON();
 * ```
 */
export declare function message(): MessageBuilder;
/**
 * Combines an array of {@link PermissionName} strings into a single numeric bitmask via {@link resolvePermission}.
 *
 * @example
 * ```ts
 * const mask = permissions(['ViewRoom', 'SendMessages', 'AttachFiles']);
 * ```
 */
export declare function permissions(list: PermissionName[]): number;
/**
 * Variadic helper that resolves any combination of {@link PermissionName} strings,
 * numeric masks, or nested arrays into a single numeric permission bitmask.
 *
 * @example
 * ```ts
 * const mask = permissionMask('ViewRoom', 'SendMessages', ['AttachFiles', 'AddReactions']);
 * ```
 */
export declare function permissionMask(...bits: PermissionResolvable[]): number;
//# sourceMappingURL=index.d.ts.map