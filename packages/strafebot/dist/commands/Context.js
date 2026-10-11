"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.Context = void 0;
const util_1 = require("@strafe-js/util");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return util_1.Permission; } });
const CommandArgument_js_1 = require("./CommandArgument.js");
class Context {
    client;
    message;
    args;
    prefix;
    commandName;
    command;
    space;
    room;
    memberPermissions;
    botPermissions;
    parsedArguments;
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
    get arguments() {
        return this.parsedArguments;
    }
    get authorId() {
        return this.message.sender_id;
    }
    get author() {
        return this.client.user?.id === this.authorId ? this.client.user : null;
    }
    get roomId() {
        return this.message.room_id;
    }
    get spaceId() {
        return this.space?.id ?? this.message.space_id ?? null;
    }
    get content() {
        return this.message.plaintext ?? '';
    }
    get member() {
        if (!this.spaceId)
            return null;
        return this.client.members.get(this.spaceId)?.get(this.authorId) ?? null;
    }
    get botMember() {
        if (!this.spaceId || !this.client.user?.id)
            return null;
        return this.client.members.get(this.spaceId)?.get(this.client.user.id) ?? null;
    }
    async reply(content, extra = {}) {
        const body = typeof content === 'string'
            ? { plaintext: content, ...extra }
            : { ...content, ...extra };
        if (body.reply_to_id === undefined) {
            body.reply_to_id = this.message.id;
        }
        return this.client.rest.createMessage(this.roomId, body);
    }
    async send(content, extra = {}) {
        const body = typeof content === 'string'
            ? { plaintext: content, ...extra }
            : { ...content, ...extra };
        return this.client.rest.createMessage(this.roomId, body);
    }
    async typing() {
        return this.client.rest.triggerTyping(this.roomId);
    }
    async react(emoji) {
        return this.client.rest.addReaction(this.roomId, this.message.id, emoji);
    }
    hasPermissions(required) {
        const mask = (0, util_1.resolvePermission)(required);
        return (this.memberPermissions & mask) === mask;
    }
    hasBotPermissions(required) {
        const mask = (0, util_1.resolvePermission)(required);
        return (this.botPermissions & mask) === mask;
    }
    isBotOwner() {
        return this.client.commands.owners.has(this.authorId);
    }
    isOwner() {
        return this.isBotOwner();
    }
    isSpaceOwner() {
        if (!this.space)
            return false;
        return this.space.owner_id === this.authorId;
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map