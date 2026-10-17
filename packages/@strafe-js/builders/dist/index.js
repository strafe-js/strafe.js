"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBuilder = void 0;
exports.message = message;
exports.permissions = permissions;
exports.permissionMask = permissionMask;
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
     * Returns a shallow clone of the built {@link CreateMessageBody} payload.
     *
     * @example
     * ```ts
     * const payload = message().setContent('Ready').toJSON();
     * ```
     */
    toJSON() {
        return { ...this.data };
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
//# sourceMappingURL=index.js.map