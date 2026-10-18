/**
 * A 64-bit unsigned integer ID serialized as a 16 to 20 digit numeric string across the Strafe API.
 *
 * @example
 * ```ts
 * const userId: Snowflake = '123456789012345678';
 * ```
 */
export type Snowflake = string;

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
export const Permission = {
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
} as const;

/**
 * Union of all valid Strafe permission flag names (`'ViewRoom' | 'SendMessages' | ...`).
 */
export type PermissionName = keyof typeof Permission;

/**
 * Any value that can be resolved to a numeric permission bitmask:
 * a numeric bitmask, a {@link PermissionName} string, or a nested array of resolvables.
 *
 * @example
 * ```ts
 * const p1: PermissionResolvable = 'ManageMessages';
 * const p2: PermissionResolvable = ['ViewRoom', 'SendMessages'];
 * const p3: PermissionResolvable = Permission.KickMembers | Permission.BanMembers;
 * ```
 */
export type PermissionResolvable =
  | number
  | PermissionName
  | PermissionResolvable[];

/**
 * Bitmask for basic text room reading and posting (`Permission.ViewRoom | Permission.SendMessages | Permission.ReadMessageHistory` = `7`).
 */
export const READ_AND_POST_PERMISSIONS =
  Permission.ViewRoom | Permission.SendMessages | Permission.ReadMessageHistory;

/**
 * Default `@everyone` permission bitmask in a newly created space (`10723359`).
 */
export const DEFAULT_EVERYONE_PERMISSIONS = 10723359;

/**
 * Bitmask combining all room-scoped permission bits (`0..6` and `15..27`).
 */
export const ALL_ROOM_PERMISSIONS =
  Permission.ViewRoom |
  Permission.SendMessages |
  Permission.ReadMessageHistory |
  Permission.AddReactions |
  Permission.UseExternalEmojis |
  Permission.MentionEveryone |
  Permission.ManageMessages |
  Permission.Connect |
  Permission.Speak |
  Permission.Video |
  Permission.MuteMembers |
  Permission.DeafenMembers |
  Permission.MoveMembers |
  Permission.UseVoiceActivity |
  Permission.PrioritySpeaker |
  Permission.AttachFiles |
  Permission.CreatePublicThreads |
  Permission.CreatePrivateThreads |
  Permission.SendMessagesInThreads |
  Permission.ManageThreads;

/**
 * Bitwise OR combination of all 28 Strafe permissions (`0x0FFFFFFF` / `268435455`).
 * Automatically granted to Space Owners and members with `Permission.Administrator`.
 */
export const ALL_PERMISSIONS = Object.values(Permission).reduce(
  (a, b) => a | b,
  0,
);

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
export const RoomType = {
  /** `(1)` 1-on-1 Direct Message room. */
  PM: 1,
  /** `(2)` Multi-user Group Direct Message room. */
  GroupPM: 2,
  /** `(3)` Standard Space text room. */
  Text: 3,
  /** `(3)` Alias for `RoomType.Text`. */
  SpaceText: 3,
  /** `(4)` Space voice and video room. */
  Voice: 4,
  /** `(4)` Alias for `RoomType.Voice`. */
  SpaceVoice: 4,
  /** `(5)` Collapsible category/section header room. */
  Section: 5,
  /** `(5)` Alias for `RoomType.Section`. */
  SpaceSection: 5,
  /** `(6)` Discussion thread room attached to a parent text room. */
  Thread: 6,
} as const;

/**
 * Numeric union of valid room type values (`1 | 2 | 3 | 4 | 5 | 6`).
 */
export type RoomTypeValue = (typeof RoomType)[keyof typeof RoomType];

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
export const GatewayOp = {
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
} as const;

/**
 * Numeric union of valid Gateway opcode values (`0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8`).
 */
export type GatewayOpValue = (typeof GatewayOp)[keyof typeof GatewayOp];

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
export class StrafeError extends Error {
  /** HTTP status code returned by the Strafe API (e.g. `401`, `403`, `404`, `429`, `500`). */
  status: number;
  /** Optional API-specific machine-readable error code string. */
  code?: string;
  /** Raw parsed JSON or text response body returned by the server. */
  body?: unknown;

  /**
   * Initializes `this.name = 'StrafeError'` and attaches the HTTP status, API error code, and parsed response body.
   */
  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message);
    this.name = 'StrafeError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

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
export class RateLimitError extends StrafeError {
  /** Number of seconds to wait before retrying the request. */
  retryAfter: number;

  /**
   * Initializes a `429` `StrafeError` with `code: 'rate_limited'` and the retry cooldown in seconds.
   */
  constructor(retryAfter: number, body?: unknown) {
    super(`Rate limited; retry after ${retryAfter}s`, 429, 'rate_limited', body);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

const CANONICAL_PERMISSIONS: [PermissionName, number][] = [
  ['ViewRoom', Permission.ViewRoom],
  ['SendMessages', Permission.SendMessages],
  ['ReadMessageHistory', Permission.ReadMessageHistory],
  ['AddReactions', Permission.AddReactions],
  ['UseExternalEmojis', Permission.UseExternalEmojis],
  ['MentionEveryone', Permission.MentionEveryone],
  ['ManageMessages', Permission.ManageMessages],
  ['ManageRoles', Permission.ManageRoles],
  ['ManageRooms', Permission.ManageRooms],
  ['KickMembers', Permission.KickMembers],
  ['BanMembers', Permission.BanMembers],
  ['Administrator', Permission.Administrator],
  ['ManageSpace', Permission.ManageSpace],
  ['CreateInvite', Permission.CreateInvite],
  ['ManageEmojis', Permission.ManageEmojis],
  ['Connect', Permission.Connect],
  ['Speak', Permission.Speak],
  ['Video', Permission.Video],
  ['MuteMembers', Permission.MuteMembers],
  ['DeafenMembers', Permission.DeafenMembers],
  ['MoveMembers', Permission.MoveMembers],
  ['UseVoiceActivity', Permission.UseVoiceActivity],
  ['PrioritySpeaker', Permission.PrioritySpeaker],
  ['AttachFiles', Permission.AttachFiles],
  ['CreatePublicThreads', Permission.CreatePublicThreads],
  ['CreatePrivateThreads', Permission.CreatePrivateThreads],
  ['SendMessagesInThreads', Permission.SendMessagesInThreads],
  ['ManageThreads', Permission.ManageThreads],
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
export class BitField {
  /** Underlying 32-bit numeric permission bitmask. */
  bits: number;

  /**
   * Resolves `bits` via {@link resolvePermission} into a numeric mask (defaults to `0`).
   */
  constructor(bits: PermissionResolvable = 0) {
    this.bits = resolvePermission(bits);
  }

  /**
   * Read-only accessor returning `this.bits`.
   */
  get bitfield(): number {
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
  has(perm: PermissionResolvable): boolean {
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
  add(...perms: PermissionResolvable[]): this {
    for (const p of perms) this.bits |= resolvePermission(p);
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
  remove(...perms: PermissionResolvable[]): this {
    for (const p of perms) this.bits &= ~resolvePermission(p);
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
  toArray(): PermissionName[] {
    const out: PermissionName[] = [];
    for (const [k, v] of CANONICAL_PERMISSIONS) {
      if ((this.bits & v) === v) out.push(k);
    }
    return out;
  }

  /**
   * Serializes the bitfield to its numeric bitmask value when passed to `JSON.stringify()`.
   */
  toJSON(): number {
    return this.bits;
  }

  /**
   * Returns the numeric bitmask for primitive coercion.
   */
  valueOf(): number {
    return this.bits;
  }
}

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
export function resolvePermission(input: PermissionResolvable): number {
  if (typeof input === 'number') return input;
  if (typeof input === 'string') {
    const v = Permission[input];
    if (v === undefined) throw new Error(`Unknown permission: ${input}`);
    return v;
  }
  if (Array.isArray(input)) {
    return input.reduce<number>((acc, cur) => acc | resolvePermission(cur), 0);
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
export function isSnowflake(id: unknown): id is Snowflake {
  return typeof id === 'string' && /^\d{16,20}$/.test(id);
}

/**
 * Default epoch in milliseconds UNIX (`2024-01-01T00:00:00.000Z`) used to decode Snowflake timestamps.
 */
export const STRAFE_EPOCH = 1704067200000n;

/**
 * Decoded components extracted from a 64-bit {@link Snowflake} ID.
 */
export interface DeconstructedSnowflake {
  /** Original Snowflake string. */
  id: Snowflake;
  /** Creation timestamp in UNIX milliseconds (`Number((BigInt(id) >> 22n) + epoch)`). */
  timestamp: number;
  /** `Date` instance constructed from `timestamp`. */
  date: Date;
  /** 5-bit internal worker ID (`Number((BigInt(id) >> 17n) & 0x1fn)`). */
  workerId: number;
  /** 5-bit internal process ID (`Number((BigInt(id) >> 12n) & 0x1fn)`). */
  processId: number;
  /** 12-bit per-millisecond sequence counter (`Number(BigInt(id) & 0xfffn)`). */
  increment: number;
}

/**
 * Extracts the UNIX millisecond timestamp, `Date`, worker ID, process ID, and sequence increment
 * from a 64-bit {@link Snowflake} string.
 *
 * @throws {Error} When `id` is not a numeric string.
 * @example
 * ```ts
 * const info = deconstructSnowflake('2104652899186380800');
 * console.log(info.date.toISOString());
 * ```
 */
export function deconstructSnowflake(
  id: Snowflake,
  epoch: bigint = STRAFE_EPOCH,
): DeconstructedSnowflake {
  if (typeof id !== 'string' || !/^\d+$/.test(id)) {
    throw new Error(`Invalid Snowflake ID: ${String(id)}`);
  }
  const big = BigInt(id);
  const timestamp = Number((big >> 22n) + epoch);
  return {
    id,
    timestamp,
    date: new Date(timestamp),
    workerId: Number((big >> 17n) & 0x1fn),
    processId: Number((big >> 12n) & 0x1fn),
    increment: Number(big & 0xfffn),
  };
}

/**
 * Computes the creation timestamp in UNIX milliseconds from a 64-bit {@link Snowflake} string.
 *
 * @throws {Error} When `id` is not a numeric string.
 * @example
 * ```ts
 * const createdAtMs = snowflakeTimestamp('2104652899186380800');
 * ```
 */
export function snowflakeTimestamp(
  id: Snowflake,
  epoch: bigint = STRAFE_EPOCH,
): number {
  return deconstructSnowflake(id, epoch).timestamp;
}

/**
 * Resolves after `ms` milliseconds using `setTimeout`.
 *
 * @example
 * ```ts
 * await sleep(1000);
 * ```
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/**
 * Represents a Strafe user or bot account.
 */
export interface User {
  /** Unique Snowflake ID of the user. */
  id: Snowflake;
  /** Email address (only present on `/users/@me` when applicable). */
  email?: string;
  /** Unique account handle/username. */
  username: string;
  /** Optional custom display name. */
  display_name?: string;
  /** Avatar URL or asset hash. */
  avatar?: string;
  /** Profile banner URL or asset hash. */
  banner?: string;
  /** Hex accent color string (e.g. `'#5865F2'`). */
  accent_color?: string;
  /** Short profile bio. */
  bio?: string;
  /** Extended profile description. */
  about_me?: string;
  /** Public user pronouns string (max 40 characters). */
  pronouns?: string;
  /** User birthday string in `MM-DD` format with no year (returned when opted in or on `/users/@me`). */
  birthday?: string;
  /** Whether the user has opted into daily space birthday announcements. */
  birthday_opt_in?: boolean;
  /** Whether today is the user's birthday (UTC, only present when `birthday_opt_in` is `true`). */
  is_birthday?: boolean;
  /** `true` if this account is a bot. */
  bot?: boolean;
  /** Public badge/flag bitfield on the user account. */
  public_flags?: number;
  /** Current online presence and custom status. */
  presence?: {
    /** Online status indicator (`'online' | 'idle' | 'dnd' | 'invisible' | 'offline'`). */
    status: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline' | string;
    /** Optional custom status text. */
    custom_status?: string;
  };
}

/**
 * Represents a role within a Strafe {@link Space}.
 */
export interface Role {
  /** Unique Snowflake ID of the role. */
  id: Snowflake;
  /** Display name of the role. */
  name: string;
  /** Numeric permission bitmask granted by this role. */
  permissions: number;
  /** Hierarchy position of the role (higher numbers have higher priority). */
  position: number;
  /** Optional integer RGB color value. */
  color?: number;
  /** Whether members with this role are displayed separately in the member list. */
  hoist?: boolean;
  /** Whether this role can be mentioned by anyone. */
  mentionable?: boolean;
  /** Managed bot user ID if this role belongs to an integration/bot. */
  bot_id?: Snowflake;
  /** ISO-8601 creation timestamp. */
  created_at?: string;
  /** ISO-8601 last update timestamp. */
  updated_at?: string;
}

/**
 * Room-level permission override for a specific role or user.
 */
export interface PermissionOverride {
  /** Target Role ID if this override applies to a role. */
  role_id?: Snowflake;
  /** Target User ID if this override applies to an individual member. */
  user_id?: Snowflake;
  /** Bitmask of explicitly allowed permissions (`|= allow`). */
  allow: number;
  /** Bitmask of explicitly denied permissions (`&= ~deny`). */
  deny: number;
}

/**
 * Metadata attached to a thread {@link Room} (`type === RoomType.Thread`).
 */
export interface ThreadMetadata {
  /** Whether the thread is currently archived. */
  archived: boolean;
  /** ISO-8601 timestamp when the thread was archived. */
  archived_at?: string;
  /** Whether the thread is locked (only moderators with `ManageThreads` can unarchive/send). */
  locked: boolean;
  /** Whether the thread is private (invite-only). */
  private: boolean;
  /** Whether non-moderators can invite other members to a private thread. */
  invitable?: boolean;
  /** Inactivity duration in minutes (`60`, `1440`, `4320`, `10080`) before automatic archiving. */
  auto_archive_minutes: number;
  /** Snowflake ID of the user who created the thread. */
  owner_id: Snowflake;
  /** Snowflake ID of the starter message from which the thread was spawned. */
  starter_message_id?: Snowflake;
  /** ISO-8601 timestamp of the most recent message in the thread. */
  last_active_at?: string;
  /** Approximate number of messages in the thread. */
  message_count?: number;
  /** Approximate number of members joined to the thread. */
  member_count?: number;
  /** Whether the current bot user has joined the thread. */
  joined?: boolean;
}

/**
 * Represents a Strafe room (DM, Group DM, Space text/voice room, section, or thread).
 */
export interface Room {
  /** Unique Snowflake ID of the room. */
  id: Snowflake;
  /** Parent Space ID (undefined for DM and Group DM rooms). */
  space_id?: Snowflake;
  /** Parent section ID (`RoomType.Section`) or parent text room ID (for `RoomType.Thread`). */
  parent_id?: Snowflake;
  /** Display name of the room (omitted on 1-on-1 `RoomType.PM` rooms). */
  name?: string;
  /** Numeric room type discriminant ({@link RoomType}). */
  type: RoomTypeValue;
  /** Optional header topic or description text configured on the room. */
  topic?: string;
  /** Zero-based ordering index within the space room list. */
  position?: number;
  /** Whether end-to-end encryption (E2EE) is enabled for messages in this room. */
  e2ee_enabled?: boolean;
  /** Per-user message cooldown (slowmode) in seconds (`0` when disabled). */
  slowmode_seconds?: number;
  /** Maximum number of simultaneous voice participants (`0` or `undefined` when unlimited). */
  user_limit?: number;
  /** Target audio bitrate in bits per second for `RoomType.Voice` rooms. */
  bitrate?: number;
  /** Participant User IDs for `RoomType.PM` and `RoomType.GroupPM` rooms. */
  recipients?: Snowflake[];
  /** Role and user permission overrides evaluated in step 4 of the Equinox permission cascade. */
  permission_overrides?: PermissionOverride[];
  /** Member-specific permission overrides evaluated after role overrides. */
  user_overrides?: PermissionOverride[];
  /** Thread state metadata populated when `type === RoomType.Thread`. */
  thread?: ThreadMetadata;
  /** ISO-8601 creation timestamp. */
  created_at?: string;
}

/**
 * Represents a Strafe Space (server/guild).
 */
export interface Space {
  /** Unique Snowflake ID of the space. */
  id: Snowflake;
  /** Display name of the space. */
  name: string;
  /** Abbreviated initials derived from `name` for fallback icon rendering. */
  name_acronym?: string;
  /** Public summary text shown in space discovery and invite previews. */
  description?: string;
  /** Space icon CDN URL or asset hash. */
  icon?: string;
  /** Space header banner CDN URL or asset hash. */
  banner?: string;
  /** Snowflake ID of the space owner (always granted {@link ALL_PERMISSIONS}). */
  owner_id: Snowflake;
  /** Snowflake ID of the default `@everyone` role used as the base permission mask. */
  everyone_role_id?: Snowflake;
  /** Room ID where automated join and boost notifications are posted. */
  system_room_id?: Snowflake;
  /** Bitflags controlling which automated events are posted to `system_room_id`. */
  system_room_flags?: number;
  /** Default member notification level (`0` = all messages, `1` = only `@mentions`). */
  default_message_notifications?: number;
  /** Voice room ID where inactive voice members are moved (`null` when unset). */
  afk_room_id?: Snowflake | null;
  /** Inactivity timeout in seconds (`60`, `300`, `900`, `1800`, `3600`) before moving to `afk_room_id`. */
  afk_timeout?: number;
  /** Whether the public embeddable space widget is enabled. */
  widget_enabled?: boolean;
  /** Room ID used to generate instant invites from the public widget. */
  widget_room_id?: Snowflake;
  /** Room ID where automated member birthday announcements are posted. */
  birthday_channel_id?: Snowflake;
  /** Custom template string used for birthday announcements in `birthday_channel_id`. */
  birthday_message?: string;
  /** Feature capability flags enabled on this space. */
  features?: string[];
  /** Roles configured in this space, including the `@everyone` role. */
  roles?: Role[];
  /** Rooms belonging to this space when hydrated in `READY` or `GET /spaces/:spaceId`. */
  rooms?: Room[];
  /** ISO-8601 creation timestamp. */
  created_at?: string;
  /** ISO-8601 last update timestamp. */
  updated_at?: string;
}

/**
 * Represents a file or media attachment uploaded to Strafe.
 */
export interface Attachment {
  /** Unique Snowflake ID of the uploaded attachment. */
  id: Snowflake;
  /** Original filename (e.g. `'image.png'`). */
  filename: string;
  /** File size in bytes. */
  size: number;
  /** MIME content type (e.g. `'image/png'`). */
  content_type?: string;
  /** CDN URL to download the attachment. */
  url: string;
  /** Image/video width in pixels if applicable. */
  width?: number;
  /** Image/video height in pixels if applicable. */
  height?: number;
}

/**
 * Aggregated emoji reaction counter on a {@link Message}.
 */
export interface MessageReaction {
  /** Unicode emoji character or `custom:<emoji_id>` identifier. */
  emoji: string;
  /** Total number of users who reacted with this emoji. */
  count: number;
  /** Whether the current bot user has reacted with this emoji. */
  me: boolean;
}

/**
 * Represents a chat message sent in a Strafe {@link Room}.
 */
export interface Message {
  /** Unique Snowflake ID of the message. */
  id: Snowflake;
  /** Snowflake ID of the room where the message was sent. */
  room_id: Snowflake;
  /** Snowflake ID of the space (omitted in DMs). */
  space_id?: Snowflake;
  /** Snowflake ID of the user who sent the message. */
  sender_id: Snowflake;
  /** Sender device identifier (used for E2EE). */
  sender_device_id?: string;
  /** Plaintext message content. */
  plaintext?: string;
  /** Encrypted message payload when E2EE is used. */
  ciphertext?: string;
  /** Snowflake ID of the message being replied to. */
  reply_to_id?: Snowflake;
  /** Array of mentioned User IDs. */
  mentions?: Snowflake[];
  /** Array of mentioned Role IDs. */
  mention_roles?: Snowflake[];
  /** Whether `@everyone` was mentioned. */
  mention_everyone?: boolean;
  /** Uploaded file attachments included with the message. */
  attachments?: Attachment[];
  /** Emoji reactions on the message. */
  reactions?: MessageReaction[];
  /** Whether the message is pinned in its room. */
  pinned?: boolean;
  /** ISO-8601 timestamp when the message was pinned. */
  pinned_at?: string;
  /** User ID who pinned the message. */
  pinned_by?: Snowflake;
  /** ID of the thread started from this message, if any. */
  thread_id?: Snowflake;
  /** System message type identifier, if this is a system event message. */
  system_type?: string;
  /** Additional metadata for system messages. */
  system_payload?: Record<string, unknown>;
  /** ISO-8601 timestamp when the message was created. */
  created_at: string;
  /** ISO-8601 timestamp when the message was last edited. */
  updated_at?: string;
  /** ISO-8601 timestamp if the message was soft-deleted. */
  deleted_at?: string;
  /** `true` if the message was sent by a bot account. */
  bot?: boolean;
  /** Optional hydrated author {@link User} object. */
  author?: User;
}

/**
 * Represents a user's membership record within a {@link Space}.
 */
export interface SpaceMember {
  /** Snowflake ID of the member user. */
  user_id: Snowflake;
  /** Snowflake ID of the space. */
  space_id?: Snowflake;
  /** Optional nested {@link User} profile object. */
  user?: User;
  /** Space-specific nickname for this member. */
  nickname?: string;
  /** Array of Role IDs assigned to this member. */
  role_ids: Snowflake[];
  /** Legacy alias for `role_ids` returned by some endpoints. */
  roles?: Snowflake[];
  /** ISO-8601 timestamp when the member joined the space. */
  joined_at?: string;
  /** `true` if the member is a bot. */
  bot?: boolean;
  /** Public user flags bitfield. */
  public_flags?: number;
  /** Member presence snapshot. */
  presence?: {
    status: string;
    custom_status?: string;
  };
}

/**
 * Payload received in the Gateway `READY` (`op: 4`) frame upon authentication.
 */
export interface ReadyPayload {
  /** Authenticated bot {@link User} profile. */
  user: User;
  /** Active Gateway session identifier. */
  session_id?: string;
  /** Initial list of spaces the bot belongs to. */
  spaces: Space[];
  /** Initial list of DM or standalone rooms. */
  rooms?: Room[];
  /** Optional map of `spaceId -> Room[]` provided during handshake. */
  space_rooms?: Record<Snowflake, Room[]>;
  /** User relationships list (empty for bots). */
  relationships?: unknown[];
  /** Active voice states across spaces. */
  voice_states?: unknown[];
  /** Active call states. */
  calls?: unknown[];
}

/**
 * Request body for creating a new message via `POST /rooms/:roomId/messages`.
 * Can be constructed fluently using `message()` from `@strafe-js/builders`.
 */
export interface CreateMessageBody {
  /** Plaintext message content. */
  plaintext?: string;
  /** ID of an existing message in the same room to reply to. */
  reply_to_id?: Snowflake;
  /** Explicit array of User IDs to notify. */
  mentions?: Snowflake[];
  /** Explicit array of Role IDs to notify. */
  mention_roles?: Snowflake[];
  /** Whether to trigger an `@everyone` notification. */
  mention_everyone?: boolean;
  /** Array of uploaded Attachment IDs (from `rest.uploadAttachment`) to include. */
  attachments?: Snowflake[];
}

/**
 * Request body for editing an existing message via `PATCH /rooms/:roomId/messages/:messageId`.
 */
export interface EditMessageBody {
  /** Updated plaintext content for the message. */
  plaintext: string;
}

/**
 * Inner event envelope carried inside a Gateway `Event` (`op: 3`) frame.
 */
export interface GatewayEventEnvelope<T = unknown> {
  /** Raw `SNAKE_CASE` event type name (e.g. `'MESSAGE_CREATE'`, `'SPACE_MEMBER_ADD'`). */
  t: string;
  /** Target Room ID if the event is scoped to a room. */
  room_id?: Snowflake;
  /** Target Space ID if the event is scoped to a space. */
  space_id?: Snowflake;
  /** Associated User ID if applicable. */
  user_id?: Snowflake;
  /** Event data payload. */
  d: T;
}

/**
 * Raw WebSocket frame sent or received over the Strafe Stargate Gateway.
 */
export interface GatewayFrame<T = unknown> {
  /** Gateway opcode ({@link GatewayOp}). */
  op: GatewayOpValue;
  /** Event type name when using flat `op: 3` envelopes. */
  t?: string;
  /** Frame payload data. */
  d?: T;
  /** Optional Room ID metadata on the frame envelope. */
  room_id?: Snowflake;
  /** Optional Space ID metadata on the frame envelope. */
  space_id?: Snowflake;
  /** Optional User ID metadata on the frame envelope. */
  user_id?: Snowflake;
}

/**
 * Checks whether a {@link Room} has end-to-end encryption (`e2ee_enabled`) turned on.
 * Bots cannot read or send plaintext messages in encrypted rooms (`https://app.strafe.chat/docs/bots/#encryption-and-what-a-bot-can-see`).
 *
 * @example
 * ```ts
 * if (isEncryptedRoom(room)) return;
 * ```
 */
export function isEncryptedRoom(
  room: Pick<Room, 'e2ee_enabled'> | null | undefined,
): boolean {
  return Boolean(room?.e2ee_enabled);
}

/**
 * Checks whether a {@link Message} was sent in an end-to-end encrypted room (`ciphertext` present without `plaintext`).
 *
 * @example
 * ```ts
 * if (isEncryptedMessage(msg)) return;
 * ```
 */
export function isEncryptedMessage(
  msg: Pick<Message, 'plaintext' | 'ciphertext'> | null | undefined,
): boolean {
  return Boolean(msg && Boolean(msg.ciphertext) && !msg.plaintext);
}

/**
 * Checks whether a {@link Message} is a server-generated system notice (`sender_id === "0"` or `system_type` set).
 */
export function isSystemMessage(
  msg: Pick<Message, 'sender_id' | 'system_type'> | null | undefined,
): boolean {
  return Boolean(msg && (msg.sender_id === '0' || Boolean(msg.system_type)));
}

/**
 * Valid OAuth2 scope identifiers supported by Strafe authorization servers (`/oauth2/authorize`).
 */
export type OAuth2Scope =
  | 'identify'
  | 'email'
  | 'spaces'
  | 'spaces.join'
  | 'bot';

/**
 * Token pair returned by `POST /oauth2/token` when exchanging an authorization code or refresh token.
 */
export interface OAuth2TokenResponse {
  /** Bearer access token valid for 7 days (`604800` seconds). */
  access_token: string;
  /** Token type prefix (`'Bearer'`). */
  token_type: 'Bearer' | string;
  /** Lifetime of `access_token` in seconds (`604800`). */
  expires_in: number;
  /** Single-use refresh token used to obtain a new token pair. */
  refresh_token: string;
  /** Space-separated list of granted {@link OAuth2Scope} strings. */
  scope: string;
}

/**
 * Public metadata of a Strafe developer application (`GET /applications/:id/public` or `GET /oauth2/@me`).
 */
export interface OAuth2ApplicationPublic {
  /** Application Snowflake ID (also equals the bot's User ID when `has_bot` is `true`). */
  id: Snowflake;
  /** Display name shown on the OAuth2 consent screen. */
  name: string;
  /** Public application description shown on the consent screen. */
  description?: string;
  /** Application icon URL or asset hash. */
  icon?: string;
  /** Whether a bot account has been attached to this application. */
  has_bot: boolean;
  /** Whether any user with `ManageSpace` can install this bot (`true`), or only the application owner (`false`). */
  bot_public: boolean;
  /** Hydrated bot {@link User} profile when present. */
  bot?: User;
}

/**
 * Full developer application record returned to the owner (`GET /applications/:id`).
 */
export interface OAuth2Application extends OAuth2ApplicationPublic {
  /** Registered OAuth2 redirect URIs (up to 10 exact `http(s)` URLs). */
  redirect_uris?: string[];
  /** Client secret (returned once upon creation or `POST /applications/:id/secret`). */
  client_secret?: string;
  /** ISO-8601 creation timestamp. */
  created_at?: string;
  /** ISO-8601 last update timestamp. */
  updated_at?: string;
}

/**
 * Token inspection payload returned by `GET /oauth2/@me`.
 */
export interface OAuth2TokenInfo {
  /** Application that owns the inspected token. */
  application: OAuth2ApplicationPublic;
  /** Array of granted {@link OAuth2Scope} values. */
  scopes: OAuth2Scope[];
  /** ISO-8601 expiration timestamp of the access token. */
  expires: string;
  /** Authenticated user profile (included when `scopes` contains `'identify'` or `'email'`). */
  user?: User;
}

/**
 * Authorized application grant entry returned by `GET /oauth2/@me/grants`.
 */
export interface OAuth2Grant {
  /** Application that was granted access. */
  application: OAuth2ApplicationPublic;
  /** Approved scopes for this grant. */
  scopes: OAuth2Scope[];
  /** ISO-8601 timestamp when access was granted. */
  created_at?: string;
}

/**
 * Options for constructing an OAuth2 authorization URL (`/oauth2/authorize`).
 */
export interface OAuth2UrlOptions {
  /** Instance base URL or API URL (defaults to `'https://app.strafe.chat'`). Trailing `/api` is stripped automatically. */
  baseUrl?: string;
  /** Application client ID (`client_id`). */
  clientId: Snowflake;
  /** Requested OAuth2 scopes (defaults to `['identify']`). */
  scopes?: OAuth2Scope[];
  /** Registered callback URI (`redirect_uri`), required when scopes other than `'bot'` are requested. */
  redirectUri?: string;
  /** Opaque CSRF token returned unchanged to `redirectUri`. */
  state?: string;
  /** Requested bot permissions when `'bot'` is included in `scopes`. */
  permissions?: PermissionResolvable;
  /** Optional space ID to preselect in the space picker. */
  spaceId?: Snowflake;
  /** When `true` (with `spaceId`), locks the space picker to `spaceId`. */
  disableSpaceSelect?: boolean;
}

/**
 * Options for constructing a bot installation URL (`/oauth2/authorize?scope=bot...`).
 */
export interface BotInviteUrlOptions {
  /** Instance base URL or API URL (defaults to `'https://app.strafe.chat'`). Trailing `/api` is stripped automatically. */
  baseUrl?: string;
  /** Application client ID / bot user ID (`client_id`). */
  clientId: Snowflake;
  /** Permission bitmask or array of {@link PermissionName} flags requested for the bot's managed role. */
  permissions?: PermissionResolvable;
  /** Optional space ID to preselect in the space picker. */
  spaceId?: Snowflake;
  /** When `true` (with `spaceId`), locks the space picker to `spaceId`. */
  disableSpaceSelect?: boolean;
  /** Optional additional scopes to request alongside `'bot'` (for example `['identify']`). */
  scopes?: OAuth2Scope[];
  /** Optional callback URI (`redirect_uri`), required if additional scopes are requested. */
  redirectUri?: string;
  /** Optional CSRF state parameter. */
  state?: string;
}

/**
 * Web Push transport kind identifier (`PUT /users/@me/push`).
 */
export type PushTransportKind = 'fcm' | 'apns' | 'unifiedpush' | 'web';

/**
 * Notification delivery preferences for a Web Push subscription (`PUT / PATCH /users/@me/push`).
 */
export interface PushPreferences {
  /** Include a plaintext message preview for non-E2EE rooms (default `true`). */
  preview?: boolean;
  /** Delivery filter for 1-on-1 PMs and group PMs (`'all'` or `'none'`, default `'all'`). */
  pm?: 'all' | 'none';
  /** Delivery filter for space rooms (`'all'`, `'mentions'`, or `'none'`, default `'mentions'`). */
  space?: 'all' | 'mentions' | 'none';
  /** Ring for incoming voice/video calls (default `true`). */
  calls?: boolean;
}

/**
 * Request body for registering a Web Push subscription via `PUT /users/@me/push`.
 */
export interface PushSubscriptionInput {
  /** Absolute `https://` Web Push endpoint URL (max 2048 characters). */
  endpoint: string;
  /** Client P-256 public key and 16-byte authentication secret (base64url encoded). */
  keys: {
    /** Base64url-encoded 65-byte uncompressed P-256 public key. */
    p256dh: string;
    /** Base64url-encoded 16-byte random authentication secret. */
    auth: string;
  };
  /** Push transport type (`'fcm' | 'apns' | 'unifiedpush' | 'web'`). */
  kind: PushTransportKind;
  /** Optional notification delivery preferences. */
  prefs?: PushPreferences;
}

/**
 * Push subscription status returned by `GET`, `PUT`, and `PATCH /users/@me/push`.
 */
export interface PushSubscriptionRecord {
  /** Configured transport type. */
  kind: PushTransportKind;
  /** Hostname of the registered push endpoint. */
  endpoint_host: string;
  /** Effective notification preferences. */
  prefs: Required<PushPreferences>;
  /** ISO-8601 creation timestamp. */
  created_at: string;
  /** ISO-8601 last update timestamp. */
  updated_at: string;
  /** ISO-8601 timestamp of the last successful push delivery. */
  last_success_at?: string;
  /** Error description from the most recent failed delivery (`''` when none). */
  last_error: string;
  /** Consecutive delivery failure count. */
  failures: number;
}

/**
 * Decrypted RFC 8291 Web Push JSON payload delivered by a Strafe instance.
 */
export interface PushPayload {
  /** Payload schema version (`1`). */
  v: 1;
  /** Push event type (`'msg' | 'read' | 'call' | 'call_end' | 'test'`). */
  t: 'msg' | 'read' | 'call' | 'call_end' | 'test';
  /** Target account Snowflake ID. */
  uid: Snowflake;
  /** Event timestamp in Unix milliseconds. */
  ts: number;
  /** Room Snowflake ID. */
  rid?: Snowflake;
  /** Room type discriminant ({@link RoomType}). */
  rt?: RoomTypeValue;
  /** Space Snowflake ID (for space rooms and threads). */
  sid?: Snowflake;
  /** Message ID (`msg`: created message ID; `read`: last read message ID). */
  mid?: Snowflake;
  /** Message author (`msg`) or caller (`call`) summary. */
  a?: {
    /** Author or caller Snowflake ID. */
    id: Snowflake;
    /** Display name or username. */
    n: string;
    /** Optional avatar CDN URL. */
    av?: string;
  };
  /** Room, thread, or group PM name (omitted for 1-on-1 PMs). */
  rn?: string;
  /** Parent channel name when `rid` is a thread. */
  pn?: string;
  /** Space display name. */
  sn?: string;
  /** `true` when the room is end-to-end encrypted (`b` is always omitted). */
  e?: boolean;
  /** Plaintext preview (up to 300 characters, omitted when encrypted or `preview: false`). */
  b?: string;
  /** Number of file attachments on the message. */
  att?: number;
  /** `true` when the message mentions the recipient (`@user`, `@role`, or `@everyone`). */
  m?: boolean;
  /** Reserved flag for video calls. */
  vid?: boolean;
}

