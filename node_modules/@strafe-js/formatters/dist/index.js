"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMention = userMention;
exports.roleMention = roleMention;
exports.roomMention = roomMention;
exports.customEmoji = customEmoji;
exports.escapeMarkdown = escapeMarkdown;
function userMention(id) {
    return `<@${id}>`;
}
function roleMention(id) {
    return `<@&${id}>`;
}
function roomMention(id) {
    return `<#${id}>`;
}
function customEmoji(name, id, animated = false) {
    return animated ? `<a:${name}:${id}>` : `<:${name}:${id}>`;
}
function escapeMarkdown(text) {
    return String(text).replace(/([*_`~|\\])/g, '\\$1');
}
//# sourceMappingURL=index.js.map