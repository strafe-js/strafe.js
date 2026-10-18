"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionOverwriteBuilder = exports.MessageBuilder = void 0;
exports.message = message;
exports.permissionOverwrite = permissionOverwrite;
exports.permissions = permissions;
exports.permissionMask = permissionMask;
exports.generateOAuth2Url = generateOAuth2Url;
exports.generateBotInviteUrl = generateBotInviteUrl;
const util_1 = require("@strafe-js/util");
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
class MessageBuilder {
    data = {};
    /**
     * Sets the `plaintext` field on the underlying {@link CreateMessageBody}.
     *
     * @example
     * ```ts
     * const body = message().setContent('Hello world!').toJSON();
     * ```
     */
    setContent(text) {
        this.data.plaintext = text;
        return this;
    }
    /**
     * Sets `reply_to_id` so the message references an existing message in the same room.
     *
     * @example
     * ```ts
     * const body = message().setContent('Replying!').setReply(msg.id).toJSON();
     * ```
     */
    setReply(messageId) {
        this.data.reply_to_id = messageId;
        return this;
    }
    /**
     * Sets the explicit `mentions` array of User {@link Snowflake} IDs to notify.
     *
     * @example
     * ```ts
     * const body = message().setContent('Hey <@123>!').setMentions(['123']).toJSON();
     * ```
     */
    setMentions(userIds) {
        this.data.mentions = userIds;
        return this;
    }
    /**
     * Sets the explicit `mention_roles` array of Role {@link Snowflake} IDs to notify.
     *
     * @example
     * ```ts
     * const body = message().setContent('Alert <@&456>!').setRoleMentions(['456']).toJSON();
     * ```
     */
    setRoleMentions(roleIds) {
        this.data.mention_roles = roleIds;
        return this;
    }
    /**
     * Sets `mention_everyone` (defaults to `true`). Requires `Permission.MentionEveryone` and `Permission.SendMessages`.
     *
     * @example
     * ```ts
     * const body = message().setContent('@everyone update').mentionEveryone(true).toJSON();
     * ```
     */
    mentionEveryone(value = true) {
        this.data.mention_everyone = value;
        return this;
    }
    /**
     * Sets the `attachments` array of uploaded Attachment {@link Snowflake} IDs returned by `rest.uploadAttachment()`.
     *
     * @example
     * ```ts
     * const uploaded = await client.rest.uploadAttachment(roomId, buf, 'report.txt');
     * const body = message().setContent('Report attached').setAttachments([uploaded.id]).toJSON();
     * ```
     */
    setAttachments(ids) {
        this.data.attachments = ids;
        return this;
    }
    /**
     * Appends `text` to the existing `plaintext` content separated by `separator` (defaults to `''`).
     *
     * @example
     * ```ts
     * const body = message().setContent('Line 1').appendContent('Line 2', '\n').toJSON();
     * ```
     */
    appendContent(text, separator = '') {
        this.data.plaintext = this.data.plaintext
            ? `${this.data.plaintext}${separator}${text}`
            : text;
        return this;
    }
    /**
     * Appends one or more unique User {@link Snowflake} IDs to `mentions`.
     *
     * @example
     * ```ts
     * const body = message().setContent('Hello!').addUserMention('123456789012345678').toJSON();
     * ```
     */
    addUserMention(...userIds) {
        const set = new Set(this.data.mentions ?? []);
        for (const id of userIds)
            set.add(id);
        this.data.mentions = [...set];
        return this;
    }
    /**
     * Appends one or more unique Role {@link Snowflake} IDs to `mention_roles`.
     *
     * @example
     * ```ts
     * const body = message().setContent('Alert!').addRoleMention('234567890123456789').toJSON();
     * ```
     */
    addRoleMention(...roleIds) {
        const set = new Set(this.data.mention_roles ?? []);
        for (const id of roleIds)
            set.add(id);
        this.data.mention_roles = [...set];
        return this;
    }
    /**
     * Appends one or more unique Attachment {@link Snowflake} IDs to `attachments`.
     *
     * @example
     * ```ts
     * const body = message().setContent('Files:').addAttachment(att1.id, att2.id).toJSON();
     * ```
     */
    addAttachment(...attachmentIds) {
        const set = new Set(this.data.attachments ?? []);
        for (const id of attachmentIds)
            set.add(id);
        this.data.attachments = [...set];
        return this;
    }
    /**
     * Returns a shallow clone of the built {@link CreateMessageBody} payload.
     *
     * @example
     * ```ts
     * const payload = message().setContent('Ready').toJSON();
     * ```
     */
    toJSON() {
        return {
            ...this.data,
            ...(this.data.mentions ? { mentions: [...this.data.mentions] } : {}),
            ...(this.data.mention_roles ? { mention_roles: [...this.data.mention_roles] } : {}),
            ...(this.data.attachments ? { attachments: [...this.data.attachments] } : {}),
        };
    }
}
exports.MessageBuilder = MessageBuilder;
/**
 * Creates a new {@link MessageBuilder} instance.
 *
 * @example
 * ```ts
 * const payload = message().setContent('Hello Strafe!').toJSON();
 * ```
 */
function message() {
    return new MessageBuilder();
}
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
class PermissionOverwriteBuilder {
    roleId;
    userId;
    allowBits = 0;
    denyBits = 0;
    /**
     * Sets the target `role_id` for this override and clears any previously set `user_id`.
     */
    setRole(roleId) {
        this.roleId = roleId;
        this.userId = undefined;
        return this;
    }
    /**
     * Sets the target `user_id` for this override and clears any previously set `role_id`.
     */
    setUser(userId) {
        this.userId = userId;
        this.roleId = undefined;
        return this;
    }
    /**
     * Adds the resolved permissions to `allow` and removes them from `deny`.
     */
    allow(...perms) {
        const mask = (0, util_1.resolvePermission)(perms);
        this.allowBits |= mask;
        this.denyBits &= ~mask;
        return this;
    }
    /**
     * Adds the resolved permissions to `deny` and removes them from `allow`.
     */
    deny(...perms) {
        const mask = (0, util_1.resolvePermission)(perms);
        this.denyBits |= mask;
        this.allowBits &= ~mask;
        return this;
    }
    /**
     * Clears the resolved permissions from both `allow` and `deny` so they inherit from space roles.
     */
    clear(...perms) {
        const mask = (0, util_1.resolvePermission)(perms);
        this.allowBits &= ~mask;
        this.denyBits &= ~mask;
        return this;
    }
    /**
     * Serializes the builder state into a {@link PermissionOverride} object.
     */
    toJSON() {
        const out = {
            allow: this.allowBits,
            deny: this.denyBits,
        };
        if (this.roleId !== undefined)
            out.role_id = this.roleId;
        if (this.userId !== undefined)
            out.user_id = this.userId;
        return out;
    }
}
exports.PermissionOverwriteBuilder = PermissionOverwriteBuilder;
/**
 * Creates a new {@link PermissionOverwriteBuilder} instance.
 *
 * @example
 * ```ts
 * const override = permissionOverwrite().setUser('123456789012345678').deny('SendMessages').toJSON();
 * ```
 */
function permissionOverwrite() {
    return new PermissionOverwriteBuilder();
}
/**
 * Combines an array of {@link PermissionName} strings into a single numeric bitmask via {@link resolvePermission}.
 *
 * @example
 * ```ts
 * const mask = permissions(['ViewRoom', 'SendMessages', 'AttachFiles']);
 * ```
 */
function permissions(list) {
    return (0, util_1.resolvePermission)(list);
}
/**
 * Variadic helper that resolves any combination of {@link PermissionName} strings,
 * numeric masks, or nested arrays into a single numeric permission bitmask.
 *
 * @example
 * ```ts
 * const mask = permissionMask('ViewRoom', 'SendMessages', ['AttachFiles', 'AddReactions']);
 * ```
 */
function permissionMask(...bits) {
    return new util_1.BitField().add(...bits).bitfield;
}
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
function generateOAuth2Url(opts) {
    const origin = (opts.baseUrl ?? 'https://app.strafe.chat')
        .replace(/\/+$/, '')
        .replace(/\/api$/, '');
    const url = new URL(`${origin}/oauth2/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', opts.clientId);
    const scopes = opts.scopes && opts.scopes.length > 0 ? opts.scopes : ['identify'];
    url.searchParams.set('scope', scopes.join(' '));
    if (opts.redirectUri) {
        url.searchParams.set('redirect_uri', opts.redirectUri);
    }
    if (opts.state) {
        url.searchParams.set('state', opts.state);
    }
    if (opts.permissions !== undefined) {
        const resolved = (0, util_1.resolvePermission)(opts.permissions);
        if (resolved > 0) {
            url.searchParams.set('permissions', String(resolved));
        }
    }
    if (opts.spaceId) {
        url.searchParams.set('space_id', opts.spaceId);
        if (opts.disableSpaceSelect) {
            url.searchParams.set('disable_space_select', 'true');
        }
    }
    return url.toString();
}
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
function generateBotInviteUrl(opts) {
    const extraScopes = (opts.scopes ?? []).filter((s) => s !== 'bot');
    const scopes = ['bot', ...extraScopes];
    return generateOAuth2Url({
        baseUrl: opts.baseUrl,
        clientId: opts.clientId,
        scopes,
        permissions: opts.permissions,
        spaceId: opts.spaceId,
        disableSpaceSelect: opts.disableSpaceSelect,
        redirectUri: opts.redirectUri,
        state: opts.state,
    });
}
//# sourceMappingURL=index.js.map