/** Snowflake ids are always strings. */
export type Snowflake = string;

/** Full permission table from https://app.strafe.chat/docs/permissions/ */
export const Permission = {
  ViewRoom: 1 << 0,              // 1
  SendMessages: 1 << 1,          // 2
  ReadMessageHistory: 1 << 2,    // 4
  AddReactions: 1 << 3,          // 8
  UseExternalEmojis: 1 << 4,     // 16
  MentionEveryone: 1 << 5,       // 32
  ManageMessages: 1 << 6,        // 64
  ManageRoles: 1 << 7,           // 128
  ManageRooms: 1 << 8,           // 256
  KickMembers: 1 << 9,           // 512
  BanMembers: 1 << 10,           // 1024
  Administrator: 1 << 11,        // 2048
  ManageSpace: 1 << 12,          // 4096
  CreateInvite: 1 << 13,         // 8192
  ManageEmojis: 1 << 14,         // 16384
  Connect: 1 << 15,              // 32768
  Speak: 1 << 16,                // 65536
  Video: 1 << 17,                // 131072
  MuteMembers: 1 << 18,          // 262144
  DeafenMembers: 1 << 19,        // 524288
  MoveMembers: 1 << 20,          // 1048576
  UseVoiceActivity: 1 << 21,     // 2097152
  PrioritySpeaker: 1 << 22,      // 4194304
  AttachFiles: 1 << 23,          // 8388608
  CreatePublicThreads: 1 << 24,  // 16777216
  CreatePrivateThreads: 1 << 25, // 33554432
  SendMessagesInThreads: 1 << 26,// 67108864
  ManageThreads: 1 << 27,        // 134217728
} as const;

export type PermissionName = keyof typeof Permission;

export type PermissionResolvable =
  | PermissionName
  | number
  | PermissionResolvable[];

export const ALL_PERMISSIONS = Object.values(Permission).reduce((acc, val) => acc | (typeof val === 'number' ? val : 0), 0);

export const RoomType = {
  PM: 1,
  GroupPM: 2,
  Text: 3,
  Voice: 4,
  Section: 5,
  Thread: 6,
} as const;

export type RoomTypeValue = (typeof RoomType)[keyof typeof RoomType];

export const GatewayOp = {
  Heartbeat: 0,
  Subscribe: 1,
  Send: 2,
  Event: 3,
  Ready: 4,
  Unsubscribe: 5,
  Ping: 6,
  Pong: 7,
  Error: 8,
} as const;

export type GatewayOpValue = (typeof GatewayOp)[keyof typeof GatewayOp];

export class StrafeError extends Error {
  readonly status: number;
  readonly code: string | number | null;
  readonly body: unknown;

  constructor(message: string, status = 0, code: string | number | null = null, body: unknown = null) {
    super(message);
    this.name = 'StrafeError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export class RateLimitError extends StrafeError {
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number, status = 429) {
    super(message, status, 'rate_limit');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class BitField {
  bitfield: number;

  constructor(bits: PermissionResolvable = 0) {
    this.bitfield = typeof bits === 'number' ? bits : resolvePermission(bits);
  }

  has(bit: PermissionResolvable): boolean {
    const mask = resolvePermission(bit);
    return (this.bitfield & mask) === mask;
  }

  add(...bits: PermissionResolvable[]): this {
    for (const bit of bits) this.bitfield |= resolvePermission(bit);
    return this;
  }

  remove(...bits: PermissionResolvable[]): this {
    for (const bit of bits) this.bitfield &= ~resolvePermission(bit);
    return this;
  }

  toArray(): PermissionName[] {
    const names: PermissionName[] = [];
    for (const [key, val] of Object.entries(Permission)) {
      if (typeof val === 'number' && (this.bitfield & val) === val) {
        names.push(key as PermissionName);
      }
    }
    return names;
  }

  toJSON(): number {
    return this.bitfield;
  }

  valueOf(): number {
    return this.bitfield;
  }
}

export function resolvePermission(bit: PermissionResolvable): number {
  if (typeof bit === 'number') return bit;
  if (typeof bit === 'string') {
    const v = Permission[bit as PermissionName];
    if (v == null) throw new Error(`unknown permission: ${bit}`);
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

export function isSnowflake(id: unknown): id is Snowflake {
  return typeof id === 'string' && /^\d{16,20}$/.test(id);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---- API object shapes (subset used by the client) ----

export interface Presence {
  status: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';
  custom_status?: string;
}

export interface User {
  id: Snowflake;
  username: string;
  discriminator?: string;
  display_name?: string;
  email?: string;
  bio?: string;
  about_me?: string;
  pronouns?: string;
  avatar?: string;
  banner?: string;
  accent_color?: string;
  public_flags?: number;
  bot?: boolean;
  presence?: Presence;
}

export interface Role {
  id: Snowflake;
  name: string;
  permissions: number;
  position: number;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  bot_id?: Snowflake;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionOverride {
  role_id?: Snowflake;
  user_id?: Snowflake;
  allow: number;
  deny: number;
}

export interface Room {
  id: Snowflake;
  type: RoomTypeValue;
  name?: string;
  topic?: string;
  position?: number;
  parent_id?: Snowflake | null;
  space_id?: Snowflake;
  e2ee_enabled?: boolean;
  slowmode_seconds?: number;
  recipients?: Snowflake[];
  permission_overrides?: PermissionOverride[];
  user_overrides?: PermissionOverride[];
  created_at?: string;
}

export interface Space {
  id: Snowflake;
  name: string;
  name_acronym?: string;
  description?: string;
  icon?: string;
  banner?: string;
  owner_id: Snowflake;
  everyone_role_id: Snowflake;
  system_room_id?: Snowflake;
  roles: Role[];
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  id: Snowflake;
  filename?: string;
  url?: string;
  content_type?: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface Message {
  id: Snowflake;
  room_id: Snowflake;
  sender_id: Snowflake;
  sender_device_id?: string;
  plaintext?: string;
  ciphertext?: string;
  reply_to_id?: Snowflake;
  mentions?: Snowflake[];
  mention_roles?: Snowflake[];
  mention_everyone?: boolean;
  attachments?: Attachment[];
  system_type?: string;
  created_at?: string;
  updated_at?: string;
  space_id?: Snowflake;
  bot?: boolean;
}

export interface SpaceMember {
  id?: Snowflake;
  user_id?: Snowflake;
  space_id?: Snowflake;
  role_ids?: Snowflake[];
  roles?: Snowflake[];
  joined_at?: string;
  bot?: boolean;
  presence?: Presence;
  username?: string;
  display_name?: string;
  avatar?: string;
  public_flags?: number;
}

export interface CreateMessageBody {
  plaintext?: string;
  ciphertext?: string;
  reply_to_id?: Snowflake;
  mentions?: Snowflake[];
  mention_roles?: Snowflake[];
  mention_everyone?: boolean;
  attachments?: Snowflake[];
}

export interface ReadyPayload {
  user: User;
  session_id: string;
  rooms: Room[];
  relationships: unknown[];
  spaces: Space[];
  space_rooms: Record<Snowflake, Room[]>;
  voice_states?: unknown[];
  calls?: unknown[];
}

export interface GatewayEventEnvelope {
  t: string;
  room_id?: Snowflake;
  space_id?: Snowflake;
  user_id?: Snowflake;
  d: unknown;
}

export interface GatewayFrame {
  op: number;
  d?: unknown;
}
