"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = exports.customReactionEmoji = exports.customEmoji = exports.roomMention = exports.roleMention = exports.userMention = void 0;
const userMention = (id) => `<@${id}>`;
exports.userMention = userMention;
const roleMention = (id) => `<@&${id}>`;
exports.roleMention = roleMention;
const roomMention = (id) => `<#${id}>`;
exports.roomMention = roomMention;
const customEmoji = (name, id, animated = false) => `<${animated ? 'a' : ''}:${name}:${id}>`;
exports.customEmoji = customEmoji;
const customReactionEmoji = (id) => `custom:${id}`;
exports.customReactionEmoji = customReactionEmoji;
const escapeMarkdown = (text) => text.replace(/([*_`~|\\])/g, '\\$1');
exports.escapeMarkdown = escapeMarkdown;
//# sourceMappingURL=index.js.map