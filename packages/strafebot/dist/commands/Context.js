"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.Context = void 0;
const util_1 = require("@strafe-js/util");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return util_1.Permission; } });
const CommandArgument_js_1 = require("./CommandArgument.js");
/**
 * Execution context passed to a command's `run(ctx)` and `onError(err, ctx)` callbacks.
 * Provides shortcuts for replying, sending messages, reacting, checking permissions, and accessing
 * both positional (`ctx.args`) and schema-validated (`ctx.arguments`) command arguments.
 *
 * @example
 * ```ts
 * async run(ctx) {
 *   await ctx.typing();
 *   await ctx.reply(`Hello <@${ctx.authorId}>!`);
 * }
 * ```
 */
class Context {
    /** Active {@link Client} instance. */
    client;
    /** Incoming {@link Message} that triggered the command. */
    message;
    /** Tokenized positional arguments (double-quotes unwrapped). */
    args;
    /** Matched command prefix string. */
    prefix;
    /** Invoked command or alias name (lowercase). */
    commandName;
    /** Resolved {@link Command} definition. */
    command;
    /** Cached {@link Space} if invoked inside a space, or `null` in DMs. */
    space;
    /** Cached {@link Room} where the message was sent, or `null` if not in cache. */
    room;
    /** Caller's effective numeric permission bitmask in this room. */
    memberPermissions;
    /** Bot's effective numeric permission bitmask in this room. */
    botPermissions;
    /** Validated schema arguments container. Prefer the {@link Context.arguments} alias. */
    parsedArguments;
    /**
     * Creates a new {@link Context} for a single command invocation.
     */
    constructor(opts) {
        this.client = opts.client;
        this.message = opts.message;
        this.args = opts.args;
        this.prefix = opts.prefix;
        this.commandName = opts.commandName;
        this.command = opts.command;
        this.space = opts.space;
        this.room = opts.room;
        this.memberPermissions = opts.memberPermissions;
        this.botPermissions = opts.botPermissions;
        this.parsedArguments = opts.parsedArguments ?? new CommandArgument_js_1.ParsedArguments();
    }
    /**
     * Typed schema arguments container (`ctx.arguments.get('key')`).
     */
    get arguments() {
        return this.parsedArguments;
    }
    /**
     * Snowflake ID of the user who sent the triggering message (`this.message.sender_id`).
     */
    get authorId() {
        return this.message.sender_id;
    }
    /**
     * Cached {@link User} object if the author is the bot itself, otherwise `null`.
     */
    get author() {
        return this.client.user?.id === this.authorId ? this.client.user : null;
    }
    /**
     * Snowflake ID of the room where the command was invoked (`this.message.room_id`).
     */
    get roomId() {
        return this.message.room_id;
    }
    /**
     * Snowflake ID of the space where the command was invoked, or `null` in Direct Messages.
     */
    get spaceId() {
        return this.space?.id ?? this.message.space_id ?? null;
    }
    /**
     * Raw plaintext content of the triggering message (`''` when empty).
     */
    get content() {
        return this.message.plaintext ?? '';
    }
    /**
     * Cached {@link SpaceMember} record for the caller in the current space, or `null` in DMs / if uncached.
     */
    get member() {
        if (!this.spaceId)
            return null;
        return this.client.members.get(this.spaceId)?.get(this.authorId) ?? null;
    }
    /**
     * Cached {@link SpaceMember} record for the bot user in the current space, or `null` in DMs / if uncached.
     */
    get botMember() {
        if (!this.spaceId || !this.client.user?.id)
            return null;
        return this.client.members.get(this.spaceId)?.get(this.client.user.id) ?? null;
    }
    /**
     * Sends a message in the current room replying to the triggering message (`reply_to_id` defaults to `this.message.id`).
     *
     * @example
     * ```ts
     * await ctx.reply('Command executed!');
     * await ctx.reply('With attachment', { attachments: [att.id] });
     * ```
     */
    async reply(content, extra = {}) {
        const body = typeof content === 'string'
            ? { plaintext: content, ...extra }
            : { ...content, ...extra };
        if (body.reply_to_id === undefined) {
            body.reply_to_id = this.message.id;
        }
        return this.client.rest.createMessage(this.roomId, body);
    }
    /**
     * Sends a standalone message in the current room without setting `reply_to_id`.
     */
    async send(content, extra = {}) {
        const body = typeof content === 'string'
            ? { plaintext: content, ...extra }
            : { ...content, ...extra };
        return this.client.rest.createMessage(this.roomId, body);
    }
    /**
     * Triggers a typing indicator in the current room via `POST /rooms/:roomId/typing`.
     */
    async typing() {
        await this.client.rest.triggerTyping(this.roomId);
        return null;
    }
    /**
     * Adds an emoji reaction to the triggering message (`PUT /rooms/:roomId/messages/:messageId/reactions/:emoji`).
     */
    async react(emoji) {
        await this.client.rest.addReaction(this.roomId, this.message.id, emoji);
        return null;
    }
    /**
     * Checks whether the caller has all permissions specified in `required` within the current room.
     * If `this.memberPermissions` was not precomputed by a command guard, resolves permissions on demand.
     */
    hasPermissions(required) {
        const mask = (0, util_1.resolvePermission)(required);
        return (this.memberPermissions & mask) === mask;
    }
    /**
     * Checks whether the bot user has all permissions specified in `required` within the current room.
     */
    hasBotPermissions(required) {
        const mask = (0, util_1.resolvePermission)(required);
        return (this.botPermissions & mask) === mask;
    }
    /**
     * Returns `true` if `this.authorId` is included in `client.commands.owners`.
     */
    isBotOwner() {
        return this.client.commands.owners.has(this.authorId);
    }
    /**
     * Alias for {@link Context.isBotOwner}.
     */
    isOwner() {
        return this.isBotOwner();
    }
    /**
     * Returns `true` if the command was invoked in a space and `this.authorId === this.space.owner_id`.
     */
    isSpaceOwner() {
        if (!this.space)
            return false;
        return this.space.owner_id === this.authorId;
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map