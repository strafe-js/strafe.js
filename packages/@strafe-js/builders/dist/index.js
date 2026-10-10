"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBuilder = void 0;
exports.message = message;
exports.permissions = permissions;
exports.permissionMask = permissionMask;
const util_1 = require("@strafe-js/util");
class MessageBuilder {
    data = {};
    setContent(text) {
        this.data.plaintext = text;
        return this;
    }
    setReply(messageId) {
        this.data.reply_to_id = messageId;
        return this;
    }
    setMentions(userIds) {
        this.data.mentions = userIds;
        return this;
    }
    setRoleMentions(roleIds) {
        this.data.mention_roles = roleIds;
        return this;
    }
    mentionEveryone(value = true) {
        this.data.mention_everyone = value;
        return this;
    }
    setAttachments(ids) {
        this.data.attachments = ids;
        return this;
    }
    toJSON() {
        return { ...this.data };
    }
}
exports.MessageBuilder = MessageBuilder;
function message() {
    return new MessageBuilder();
}
function permissions(list) {
    return (0, util_1.resolvePermission)(list);
}
function permissionMask(...bits) {
    return new util_1.BitField().add(...bits).bitfield;
}
//# sourceMappingURL=index.js.map