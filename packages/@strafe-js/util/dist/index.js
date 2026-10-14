"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.BitField = exports.RateLimitError = exports.StrafeError = exports.GatewayOp = exports.RoomType = exports.ALL_PERMISSIONS = exports.Permission = void 0;
exports.resolvePermission = resolvePermission;
exports.isSnowflake = isSnowflake;
/**
 * Strafe permission bitflags matching https://app.strafe.chat/docs/permissions/#the-bits
 */
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
    CreateInvites: 1 << 13, // Alias for CreateInvite (8192)
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
    ChangeNickname: 1 << 21, // Legacy alias
    ManageNicknames: 1 << 7, // Legacy alias
    SendVoiceMessages: 1 << 16, // Legacy alias
};
exports.ALL_PERMISSIONS = Object.values(exports.Permission).reduce((a, b) => a | b, 0);
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
    constructor(message, status, code, body) {
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
    constructor(retryAfter, body) {
        super(`Rate limited; retry after ${retryAfter}s`, 429, 'rate_limited', body);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
const CANONICAL_PERMISSIONS = [
    ['ViewRoom', exports.Permission.ViewRoom],
    ['SendMessages', exports.Permission.SendMessages],
    ['ReadMessageHistory', exports.Permission.ReadMessageHistory],
    ['AddReactions', exports.Permission.AddReactions],
    ['UseExternalEmojis', exports.Permission.UseExternalEmojis],
    ['MentionEveryone', exports.Permission.MentionEveryone],
    ['ManageMessages', exports.Permission.ManageMessages],
    ['ManageRoles', exports.Permission.ManageRoles],
    ['ManageRooms', exports.Permission.ManageRooms],
    ['KickMembers', exports.Permission.KickMembers],
    ['BanMembers', exports.Permission.BanMembers],
    ['Administrator', exports.Permission.Administrator],
    ['ManageSpace', exports.Permission.ManageSpace],
    ['CreateInvite', exports.Permission.CreateInvite],
    ['ManageEmojis', exports.Permission.ManageEmojis],
    ['Connect', exports.Permission.Connect],
    ['Speak', exports.Permission.Speak],
    ['Video', exports.Permission.Video],
    ['MuteMembers', exports.Permission.MuteMembers],
    ['DeafenMembers', exports.Permission.DeafenMembers],
    ['MoveMembers', exports.Permission.MoveMembers],
    ['UseVoiceActivity', exports.Permission.UseVoiceActivity],
    ['PrioritySpeaker', exports.Permission.PrioritySpeaker],
    ['AttachFiles', exports.Permission.AttachFiles],
    ['CreatePublicThreads', exports.Permission.CreatePublicThreads],
    ['CreatePrivateThreads', exports.Permission.CreatePrivateThreads],
    ['SendMessagesInThreads', exports.Permission.SendMessagesInThreads],
    ['ManageThreads', exports.Permission.ManageThreads],
];
class BitField {
    bits;
    constructor(bits = 0) {
        this.bits = resolvePermission(bits);
    }
    get bitfield() {
        return this.bits;
    }
    has(perm) {
        const mask = resolvePermission(perm);
        return (this.bits & mask) === mask;
    }
    add(...perms) {
        for (const p of perms)
            this.bits |= resolvePermission(p);
        return this;
    }
    remove(...perms) {
        for (const p of perms)
            this.bits &= ~resolvePermission(p);
        return this;
    }
    toArray() {
        const out = [];
        for (const [k, v] of CANONICAL_PERMISSIONS) {
            if ((this.bits & v) === v)
                out.push(k);
        }
        return out;
    }
    toJSON() {
        return this.bits;
    }
    valueOf() {
        return this.bits;
    }
}
exports.BitField = BitField;
function resolvePermission(input) {
    if (typeof input === 'number')
        return input;
    if (typeof input === 'string') {
        const v = exports.Permission[input];
        if (v === undefined)
            throw new Error(`Unknown permission: ${input}`);
        return v;
    }
    if (Array.isArray(input)) {
        return input.reduce((acc, cur) => acc | resolvePermission(cur), 0);
    }
    return 0;
}
function isSnowflake(id) {
    return typeof id === 'string' && /^\d{16,20}$/.test(id);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
exports.sleep = sleep;
//# sourceMappingURL=index.js.map