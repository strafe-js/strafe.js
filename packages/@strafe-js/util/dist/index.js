"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.BitField = exports.RateLimitError = exports.StrafeError = exports.GatewayOp = exports.RoomType = exports.ALL_PERMISSIONS = exports.Permission = void 0;
exports.resolvePermission = resolvePermission;
exports.isSnowflake = isSnowflake;
/**
 * Official 28-bit Strafe permission bitflags matching the Equinox permission model.
 *
 * @see https://app.strafe.chat/docs/permissions/#the-bits
 * @example
 * ```ts
 * import { Permission } from '@strafe-js/util';
 *
 * const modMask = Permission.KickMembers | Permission.BanMembers | Permission.ManageMessages;
 * ```
 */
exports.Permission = {
    /** `(1 << 0 = 1)` Allows viewing a room. Without `ViewRoom`, all other room permissions are implicitly revoked. */
    ViewRoom: 1 << 0,
    /** `(1 << 1 = 2)` Allows sending text messages in a room. Required for `AttachFiles` and `MentionEveryone`. */
    SendMessages: 1 << 1,
    /** `(1 << 2 = 4)` Allows reading historical messages in a room. */
    ReadMessageHistory: 1 << 2,
    /** `(1 << 3 = 8)` Allows adding new emoji reactions to messages. */
    AddReactions: 1 << 3,
    /** `(1 << 4 = 16)` Allows using custom emojis from external spaces. */
    UseExternalEmojis: 1 << 4,
    /** `(1 << 5 = 32)` Allows mentioning `@everyone` to notify all members in a room. Depends on `SendMessages`. */
    MentionEveryone: 1 << 5,
    /** `(1 << 6 = 64)` Allows deleting other members' messages and pinning/unpinning messages. */
    ManageMessages: 1 << 6,
    /** `(1 << 7 = 128)` Allows creating, editing, deleting, and assigning roles below the member's highest role. */
    ManageRoles: 1 << 7,
    /** `(1 << 8 = 256)` Allows creating, editing, and deleting rooms and room permission overrides. */
    ManageRooms: 1 << 8,
    /** `(1 << 9 = 512)` Allows kicking members from the space. */
    KickMembers: 1 << 9,
    /** `(1 << 10 = 1024)` Allows permanently banning and unbanning members from the space. */
    BanMembers: 1 << 10,
    /** `(1 << 11 = 2048)` Grants all permissions (`ALL_PERMISSIONS`) and bypasses all room-level permission overrides. */
    Administrator: 1 << 11,
    /** `(1 << 12 = 4096)` Allows editing space settings such as name, description, icon, and system rooms. */
    ManageSpace: 1 << 12,
    /** `(1 << 13 = 8192)` Allows creating invite links to the space. */
    CreateInvite: 1 << 13,
    /** `(1 << 13 = 8192)` Alias for {@link Permission.CreateInvite}. */
    CreateInvites: 1 << 13,
    /** `(1 << 14 = 16384)` Allows uploading, renaming, and deleting custom space emojis. */
    ManageEmojis: 1 << 14,
    /** `(1 << 15 = 32768)` Allows connecting to voice rooms. */
    Connect: 1 << 15,
    /** `(1 << 16 = 65536)` Allows speaking in voice rooms. */
    Speak: 1 << 16,
    /** `(1 << 17 = 131072)` Allows streaming video or sharing screens in voice rooms. */
    Video: 1 << 17,
    /** `(1 << 18 = 262144)` Allows server-muting members in voice rooms. */
    MuteMembers: 1 << 18,
    /** `(1 << 19 = 524288)` Allows server-deafening members in voice rooms. */
    DeafenMembers: 1 << 19,
    /** `(1 << 20 = 1048576)` Allows moving members between voice rooms. */
    MoveMembers: 1 << 20,
    /** `(1 << 21 = 2097152)` Allows using voice activity detection instead of push-to-talk. */
    UseVoiceActivity: 1 << 21,
    /** `(1 << 22 = 4194304)` Allows speaking with priority audio attenuation in voice rooms. */
    PrioritySpeaker: 1 << 22,
    /** `(1 << 23 = 8388608)` Allows uploading files and media attachments in messages. Depends on `SendMessages`. */
    AttachFiles: 1 << 23,
    /** `(1 << 24 = 16777216)` Allows creating public discussion threads in text rooms. */
    CreatePublicThreads: 1 << 24,
    /** `(1 << 25 = 33554432)` Allows creating private invite-only threads in text rooms. */
    CreatePrivateThreads: 1 << 25,
    /** `(1 << 26 = 67108864)` Allows sending messages inside active threads. */
    SendMessagesInThreads: 1 << 26,
    /** `(1 << 27 = 134217728)` Allows archiving, unarchiving, locking, and deleting threads. */
    ManageThreads: 1 << 27,
    /** Legacy alias for `UseVoiceActivity` (`1 << 21`). */
    ChangeNickname: 1 << 21,
    /** Legacy alias for `ManageRoles` (`1 << 7`). */
    ManageNicknames: 1 << 7,
    /** Legacy alias for `Speak` (`1 << 16`). */
    SendVoiceMessages: 1 << 16,
    /** Legacy alias for `UseExternalEmojis` (`1 << 4`). */
    EmbedLinks: 1 << 4,
};
/**
 * Bitwise OR combination of all 28 Strafe permissions (`0x0FFFFFFF` / `268435455`).
 * Automatically granted to Space Owners and members with `Permission.Administrator`.
 */
exports.ALL_PERMISSIONS = Object.values(exports.Permission).reduce((a, b) => a | b, 0);
/**
 * Enumeration of Strafe room types.
 *
 * @example
 * ```ts
 * import { RoomType } from '@strafe-js/util';
 *
 * if (room.type === RoomType.Text) {
 *   console.log('This is a standard text room');
 * }
 * ```
 */
exports.RoomType = {
    /** `(1)` 1-on-1 Direct Message room. */
    PM: 1,
    /** `(2)` Multi-user Group Direct Message room. */
    GroupPM: 2,
    /** `(3)` Standard Space text room. */
    Text: 3,
    /** `(4)` Space voice and video room. */
    Voice: 4,
    /** `(5)` Collapsible category/section header room. */
    Section: 5,
    /** `(6)` Discussion thread room attached to a parent text room. */
    Thread: 6,
};
/**
 * Stargate WebSocket Gateway protocol opcodes.
 *
 * @example
 * ```ts
 * import { GatewayOp } from '@strafe-js/util';
 *
 * gateway.send(GatewayOp.Subscribe, { space_id: spaceId });
 * ```
 */
exports.GatewayOp = {
    /** `(0)` Legacy bidirectional heartbeat frame. */
    Heartbeat: 0,
    /** `(1)` Client -> Server: Subscribe to real-time events for a `space_id` or `room_id`. */
    Subscribe: 1,
    /** `(2)` Client -> Server: Send a client action frame (e.g. typing indicator). */
    Send: 2,
    /** `(3)` Server -> Client: Dispatched real-time event envelope (`t`, `space_id`, `room_id`, `d`). */
    Event: 3,
    /** `(4)` Server -> Client: Initial session handshake `READY` payload (`user`, `spaces`, `rooms`). */
    Ready: 4,
    /** `(5)` Client -> Server: Unsubscribe from a `space_id` or `room_id`. */
    Unsubscribe: 5,
    /** `(6)` Client -> Server: Periodic heartbeat ping frame. */
    Ping: 6,
    /** `(7)` Server -> Client: Heartbeat pong acknowledgement frame. */
    Pong: 7,
    /** `(8)` Server -> Client: Gateway-level error frame (`d.message`). */
    Error: 8,
};
/**
 * Error thrown when a Strafe REST API request fails with a non-2xx HTTP status code.
 *
 * @example
 * ```ts
 * try {
 *   await client.rest.createMessage(roomId, 'Hello!');
 * } catch (err) {
 *   if (err instanceof StrafeError) {
 *     console.error(`HTTP ${err.status} (${err.code}): ${err.message}`);
 *   }
 * }
 * ```
 */
class StrafeError extends Error {
    /** HTTP status code returned by the Strafe API (e.g. `401`, `403`, `404`, `429`, `500`). */
    status;
    /** Optional API-specific machine-readable error code string. */
    code;
    /** Raw parsed JSON or text response body returned by the server. */
    body;
    /**
     * Initializes `this.name = 'StrafeError'` and attaches the HTTP status, API error code, and parsed response body.
     */
    constructor(message, status, code, body) {
        super(message);
        this.name = 'StrafeError';
        this.status = status;
        this.code = code;
        this.body = body;
    }
}
exports.StrafeError = StrafeError;
/**
 * Error thrown when HTTP `429 Too Many Requests` retries are exhausted.
 * Extends {@link StrafeError} with the `retryAfter` duration in seconds.
 *
 * @example
 * ```ts
 * try {
 *   await client.rest.createMessage(roomId, 'Hello!');
 * } catch (err) {
 *   if (err instanceof RateLimitError) {
 *     console.warn(`Rate limited! Retry after ${err.retryAfter}s`);
 *   }
 * }
 * ```
 */
class RateLimitError extends StrafeError {
    /** Number of seconds to wait before retrying the request. */
    retryAfter;
    /**
     * Initializes a `429` `StrafeError` with `code: 'rate_limited'` and the retry cooldown in seconds.
     */
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
/**
 * Wrapper around a 32-bit numeric permission mask providing fluent methods for inspecting
 * and mutating Strafe permissions.
 *
 * @example
 * ```ts
 * import { BitField, Permission } from '@strafe-js/util';
 *
 * const perms = new BitField(['ViewRoom', 'SendMessages']);
 * perms.add('AddReactions', Permission.AttachFiles);
 *
 * if (perms.has(['ViewRoom', 'SendMessages'])) {
 *   console.log(perms.toArray()); // ['ViewRoom', 'SendMessages', 'AddReactions', 'AttachFiles']
 * }
 * ```
 */
class BitField {
    /** Underlying 32-bit numeric permission bitmask. */
    bits;
    /**
     * Resolves `bits` via {@link resolvePermission} into a numeric mask (defaults to `0`).
     */
    constructor(bits = 0) {
        this.bits = resolvePermission(bits);
    }
    /**
     * Read-only accessor returning `this.bits`.
     */
    get bitfield() {
        return this.bits;
    }
    /**
     * Checks whether every permission bit in `perm` is set (`(this.bits & mask) === mask`).
     *
     * @example
     * ```ts
     * perms.has('ManageMessages');
     * perms.has(['ViewRoom', 'SendMessages']);
     * ```
     */
    has(perm) {
        const mask = resolvePermission(perm);
        return (this.bits & mask) === mask;
    }
    /**
     * Mutates this `BitField` in place by bitwise-ORing (`|=`) all resolved permissions.
     *
     * @example
     * ```ts
     * perms.add('AddReactions', 'AttachFiles');
     * ```
     */
    add(...perms) {
        for (const p of perms)
            this.bits |= resolvePermission(p);
        return this;
    }
    /**
     * Mutates this `BitField` in place by clearing (`&= ~`) all resolved permissions.
     *
     * @example
     * ```ts
     * perms.remove('AttachFiles');
     * ```
     */
    remove(...perms) {
        for (const p of perms)
            this.bits &= ~resolvePermission(p);
        return this;
    }
    /**
     * Returns all active bits in this `BitField` as an array of canonical 28-bit {@link PermissionName} strings
     * (excluding legacy alias keys).
     *
     * @example
     * ```ts
     * const names = perms.toArray(); // ['ViewRoom', 'SendMessages']
     * ```
     */
    toArray() {
        const out = [];
        for (const [k, v] of CANONICAL_PERMISSIONS) {
            if ((this.bits & v) === v)
                out.push(k);
        }
        return out;
    }
    /**
     * Serializes the bitfield to its numeric bitmask value when passed to `JSON.stringify()`.
     */
    toJSON() {
        return this.bits;
    }
    /**
     * Returns the numeric bitmask for primitive coercion.
     */
    valueOf() {
        return this.bits;
    }
}
exports.BitField = BitField;
/**
 * Resolves a {@link PermissionName}, numeric bitmask, or nested array of {@link PermissionResolvable}
 * values into a single bitwise-OR numeric mask.
 *
 * @throws {Error} When an unrecognized permission name string is passed.
 * @example
 * ```ts
 * const mask = resolvePermission(['ViewRoom', 'SendMessages']); // 3
 * ```
 */
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
/**
 * Type guard that checks whether `id` is a string of 16 to 20 ASCII digits (`/^\d{16,20}$/`).
 *
 * @example
 * ```ts
 * if (isSnowflake(input)) {
 *   // input is narrowed to Snowflake
 * }
 * ```
 */
function isSnowflake(id) {
    return typeof id === 'string' && /^\d{16,20}$/.test(id);
}
/**
 * Resolves after `ms` milliseconds using `setTimeout`.
 *
 * @example
 * ```ts
 * await sleep(1000);
 * ```
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
exports.sleep = sleep;
//# sourceMappingURL=index.js.map