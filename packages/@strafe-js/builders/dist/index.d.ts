import { type BotInviteUrlOptions, type CreateMessageBody, type OAuth2UrlOptions, type PermissionName, type PermissionOverride, type PermissionResolvable, type Snowflake } from '@strafe-js/util';
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
     * Appends `text` to the existing `plaintext` content separated by `separator` (defaults to `''`).
     *
     * @example
     * ```ts
     * const body = message().setContent('Line 1').appendContent('Line 2', '\n').toJSON();
     * ```
     */
    appendContent(text: string, separator?: string): this;
    /**
     * Appends one or more unique User {@link Snowflake} IDs to `mentions`.
     *
     * @example
     * ```ts
     * const body = message().setContent('Hello!').addUserMention('123456789012345678').toJSON();
     * ```
     */
    addUserMention(...userIds: Snowflake[]): this;
    /**
     * Appends one or more unique Role {@link Snowflake} IDs to `mention_roles`.
     *
     * @example
     * ```ts
     * const body = message().setContent('Alert!').addRoleMention('234567890123456789').toJSON();
     * ```
     */
    addRoleMention(...roleIds: Snowflake[]): this;
    /**
     * Appends one or more unique Attachment {@link Snowflake} IDs to `attachments`.
     *
     * @example
     * ```ts
     * const body = message().setContent('Files:').addAttachment(att1.id, att2.id).toJSON();
     * ```
     */
    addAttachment(...attachmentIds: Snowflake[]): this;
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
 * Fluent builder for constructing a room-level {@link PermissionOverride} entry (`allow` and `deny` bitmasks
 * for a target `role_id` or `user_id`). Allowing a permission automatically clears it from `deny`, and vice versa.
 *
 * @example
 * ```ts
 * import { permissionOverwrite } from '@strafe-js/builders';
 *
 * const override = permissionOverwrite()
 *   .setRole('234567890123456789')
 *   .allow('ViewRoom', 'ReadMessageHistory')
 *   .deny('SendMessages', 'AddReactions')
 *   .toJSON();
 * ```
 */
export declare class PermissionOverwriteBuilder {
    private roleId?;
    private userId?;
    private allowBits;
    private denyBits;
    /**
     * Sets the target `role_id` for this override and clears any previously set `user_id`.
     */
    setRole(roleId: Snowflake): this;
    /**
     * Sets the target `user_id` for this override and clears any previously set `role_id`.
     */
    setUser(userId: Snowflake): this;
    /**
     * Adds the resolved permissions to `allow` and removes them from `deny`.
     */
    allow(...perms: PermissionResolvable[]): this;
    /**
     * Adds the resolved permissions to `deny` and removes them from `allow`.
     */
    deny(...perms: PermissionResolvable[]): this;
    /**
     * Clears the resolved permissions from both `allow` and `deny` so they inherit from space roles.
     */
    clear(...perms: PermissionResolvable[]): this;
    /**
     * Serializes the builder state into a {@link PermissionOverride} object.
     */
    toJSON(): PermissionOverride;
}
/**
 * Creates a new {@link PermissionOverwriteBuilder} instance.
 *
 * @example
 * ```ts
 * const override = permissionOverwrite().setUser('123456789012345678').deny('SendMessages').toJSON();
 * ```
 */
export declare function permissionOverwrite(): PermissionOverwriteBuilder;
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
/**
 * Builds a Strafe OAuth2 authorization URL (`/oauth2/authorize`) with `response_type=code`.
 * Automatically strips any trailing `/api` suffix from `baseUrl` so the consent page resolves on the web client origin.
 *
 * @example
 * ```ts
 * const authUrl = generateOAuth2Url({
 *   clientId: '2104652899186380800',
 *   scopes: ['identify', 'email'],
 *   redirectUri: 'https://app.example.com/callback',
 *   state: 'b1f3c0a9',
 * });
 * ```
 */
export declare function generateOAuth2Url(opts: OAuth2UrlOptions): string;
/**
 * Builds a Strafe bot installation link (`/oauth2/authorize?response_type=code&client_id=...&scope=bot...`).
 * Resolves `opts.permissions` into the integer bitmask assigned to the bot's managed role upon approval.
 *
 * @example
 * ```ts
 * const installUrl = generateBotInviteUrl({
 *   clientId: '2105141069376131072',
 *   permissions: ['ViewRoom', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
 * });
 * ```
 */
export declare function generateBotInviteUrl(opts: BotInviteUrlOptions): string;
//# sourceMappingURL=index.d.ts.map