"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.Context = void 0;
const util_1 = require("@strafe-js/util");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return util_1.Permission; } });
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
    }
    get authorId() {
        return this.message.sender_id;
    }
    get roomId() {
        return this.message.room_id;
    }
    get content() {
        return this.message.plaintext ?? '';
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
    isOwner() {
        return this.client.commands.owners.has(this.authorId);
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map