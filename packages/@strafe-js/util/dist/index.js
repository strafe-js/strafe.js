"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitField = exports.RateLimitError = exports.StrafeError = exports.GatewayOp = exports.RoomType = exports.ALL_PERMISSIONS = exports.Permission = void 0;
exports.resolvePermission = resolvePermission;
exports.isSnowflake = isSnowflake;
exports.sleep = sleep;
/** Full permission table from https://app.strafe.chat/docs/permissions/ */
exports.Permission = {
    ViewRoom: 1 << 0, // 1
    SendMessages: 1 << 1, // 2
    ReadMessageHistory: 1 << 2, // 4
    AddReactions: 1 << 3, // 8
    UseExternalEmojis: 1 << 4, // 16
    MentionEveryone: 1 << 5, // 32
    ManageMessages: 1 << 6, // 64
    ManageRoles: 1 << 7, // 128
    ManageRooms: 1 << 8, // 256
    KickMembers: 1 << 9, // 512
    BanMembers: 1 << 10, // 1024
    Administrator: 1 << 11, // 2048
    ManageSpace: 1 << 12, // 4096
    CreateInvite: 1 << 13, // 8192
    ManageEmojis: 1 << 14, // 16384
    Connect: 1 << 15, // 32768
    Speak: 1 << 16, // 65536
    Video: 1 << 17, // 131072
    MuteMembers: 1 << 18, // 262144
    DeafenMembers: 1 << 19, // 524288
    MoveMembers: 1 << 20, // 1048576
    UseVoiceActivity: 1 << 21, // 2097152
    PrioritySpeaker: 1 << 22, // 4194304
    AttachFiles: 1 << 23, // 8388608
    CreatePublicThreads: 1 << 24, // 16777216
    CreatePrivateThreads: 1 << 25, // 33554432
    SendMessagesInThreads: 1 << 26, // 67108864
    ManageThreads: 1 << 27, // 134217728
};
exports.ALL_PERMISSIONS = Object.values(exports.Permission).reduce((acc, val) => acc | (typeof val === 'number' ? val : 0), 0);
exports.RoomType = {
    PM: 1,
    GroupPM: 2,
    Text: 3,
    Voice: 4,
    Section: 5,
    Thread: 6,
};
exports.GatewayOp = {
    Heartbeat: 0,
    Subscribe: 1,
    Send: 2,
    Event: 3,
    Ready: 4,
    Unsubscribe: 5,
    Ping: 6,
    Pong: 7,
    Error: 8,
};
class StrafeError extends Error {
    status;
    code;
    body;
    constructor(message, status = 0, code = null, body = null) {
        super(message);
        this.name = 'StrafeError';
        this.status = status;
        this.code = code;
        this.body = body;
    }
}
exports.StrafeError = StrafeError;
class RateLimitError extends StrafeError {
    retryAfter;
    constructor(message, retryAfter, status = 429) {
        super(message, status, 'rate_limit');
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
class BitField {
    bitfield;
    constructor(bits = 0) {
        this.bitfield = typeof bits === 'number' ? bits : resolvePermission(bits);
    }
    has(bit) {
        const mask = resolvePermission(bit);
        return (this.bitfield & mask) === mask;
    }
    add(...bits) {
        for (const bit of bits)
            this.bitfield |= resolvePermission(bit);
        return this;
    }
    remove(...bits) {
        for (const bit of bits)
            this.bitfield &= ~resolvePermission(bit);
        return this;
    }
    toArray() {
        const names = [];
        for (const [key, val] of Object.entries(exports.Permission)) {
            if (typeof val === 'number' && (this.bitfield & val) === val) {
                names.push(key);
            }
        }
        return names;
    }
    toJSON() {
        return this.bitfield;
    }
    valueOf() {
        return this.bitfield;
    }
}
exports.BitField = BitField;
function resolvePermission(bit) {
    if (typeof bit === 'number')
        return bit;
    if (typeof bit === 'string') {
        const v = exports.Permission[bit];
        if (v == null)
            throw new Error(`unknown permission: ${bit}`);
        return v;
    }
    if (Array.isArray(bit)) {
        let mask = 0;
        for (const item of bit) {
            mask |= resolvePermission(item);
        }
        return mask;
    }
    throw new Error(`invalid permission resolvable: ${String(bit)}`);
}
function isSnowflake(id) {
    return typeof id === 'string' && /^\d{16,20}$/.test(id);
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
//# sourceMappingURL=index.js.map