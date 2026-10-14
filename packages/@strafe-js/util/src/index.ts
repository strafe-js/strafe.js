export type Snowflake = string;

/**
 * Strafe permission bitflags matching https://app.strafe.chat/docs/permissions/#the-bits
 */
export const Permission = {
  ViewRoom: 1 << 0,               // 1
  SendMessages: 1 << 1,           // 2
  ReadMessageHistory: 1 << 2,     // 4
  AddReactions: 1 << 3,           // 8
  UseExternalEmojis: 1 << 4,      // 16
  MentionEveryone: 1 << 5,        // 32
  ManageMessages: 1 << 6,         // 64
  ManageRoles: 1 << 7,            // 128
  ManageRooms: 1 << 8,            // 256
  KickMembers: 1 << 9,            // 512
  BanMembers: 1 << 10,           // 1024
  Administrator: 1 << 11,         // 2048
  ManageSpace: 1 << 12,           // 4096
  CreateInvite: 1 << 13,          // 8192
  CreateInvites: 1 << 13,         // Alias for CreateInvite (8192)
  ManageEmojis: 1 << 14,          // 16384
  Connect: 1 << 15,               // 32768
  Speak: 1 << 16,                 // 65536
  Video: 1 << 17,                 // 131072
  MuteMembers: 1 << 18,           // 262144
  DeafenMembers: 1 << 19,         // 524288
  MoveMembers: 1 << 20,           // 1048576
  UseVoiceActivity: 1 << 21,      // 2097152
  PrioritySpeaker: 1 << 22,       // 4194304
  AttachFiles: 1 << 23,           // 8388608
  CreatePublicThreads: 1 << 24,   // 16777216
  CreatePrivateThreads: 1 << 25,  // 33554432
  SendMessagesInThreads: 1 << 26, // 67108864
  ManageThreads: 1 << 27,         // 134217728
  ChangeNickname: 1 << 21,        // Legacy alias
  ManageNicknames: 1 << 7,        // Legacy alias
  SendVoiceMessages: 1 << 16,     // Legacy alias
} as const;

export type PermissionName = keyof typeof Permission;
export type PermissionResolvable =
  | number
  | PermissionName
  | PermissionResolvable[];

export const ALL_PERMISSIONS = Object.values(Permission).reduce(
  (a, b) => a | b,
  0,
);

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
  status: number;
  code?: string;
  body?: unknown;
  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message);
    this.name = 'StrafeError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export class RateLimitError extends StrafeError {
  retryAfter: number;
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

export class BitField {
  bits: number;
  constructor(bits: PermissionResolvable = 0) {
    this.bits = resolvePermission(bits);
  }
  get bitfield(): number {
    return this.bits;
  }
  has(perm: PermissionResolvable): boolean {
    const mask = resolvePermission(perm);
    return (this.bits & mask) === mask;
  }
  add(...perms: PermissionResolvable[]): this {
    for (const p of perms) this.bits |= resolvePermission(p);
    return this;
  }
  remove(...perms: PermissionResolvable[]): this {
    for (const p of perms) this.bits &= ~resolvePermission(p);
    return this;
  }
  toArray(): PermissionName[] {
    const out: PermissionName[] = [];
    for (const [k, v] of CANONICAL_PERMISSIONS) {
      if ((this.bits & v) === v) out.push(k);
    }
    return out;
  }
  toJSON(): number {
    return this.bits;
  }
  valueOf(): number {
    return this.bits;
  }
}

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

export function isSnowflake(id: unknown): id is Snowflake {
  return typeof id === 'string' && /^\d{16,20}$/.test(id);
}

export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export interface User {
  id: Snowflake;
  email?: string;
  username: string;
  display_name?: string;
  avatar?: string;
  banner?: string;
  accent_color?: string;
  bio?: string;
  about_me?: string;
  pronouns?: string;
  birthday?: string;
  birthday_opt_in?: boolean;
  is_birthday?: boolean;
  bot?: boolean;
  public_flags?: number;
  presence?: {
    status: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline' | string;
    custom_status?: string;
  };
}

export interface Role {
  id: Snowflake;
  name: string;
  permissions: number;
  position: number;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
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

export interface ThreadMetadata {
  archived: boolean;
  archived_at?: string;
  locked: boolean;
  private: boolean;
  invitable?: boolean;
  auto_archive_minutes: number;
  owner_id: Snowflake;
  starter_message_id?: Snowflake;
  last_active_at?: string;
  message_count?: number;
  member_count?: number;
  joined?: boolean;
}

export interface Room {
  id: Snowflake;
  space_id?: Snowflake;
  parent_id?: Snowflake;
  name?: string;
  type: RoomTypeValue;
  topic?: string;
  position?: number;
  e2ee_enabled?: boolean;
  slowmode_seconds?: number;
  user_limit?: number;
  bitrate?: number;
  recipients?: Snowflake[];
  permission_overrides?: PermissionOverride[];
  user_overrides?: PermissionOverride[];
  thread?: ThreadMetadata;
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
  everyone_role_id?: Snowflake;
  system_room_id?: Snowflake;
  system_room_flags?: number;
  default_message_notifications?: number;
  afk_room_id?: Snowflake | null;
  afk_timeout?: number;
  widget_enabled?: boolean;
  widget_room_id?: Snowflake;
  birthday_channel_id?: Snowflake;
  birthday_message?: string;
  features?: string[];
  roles?: Role[];
  rooms?: Room[];
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  id: Snowflake;
  filename: string;
  size: number;
  content_type?: string;
  url: string;
  width?: number;
  height?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  me: boolean;
}

export interface Message {
  id: Snowflake;
  room_id: Snowflake;
  space_id?: Snowflake;
  sender_id: Snowflake;
  sender_device_id?: string;
  plaintext?: string;
  ciphertext?: string;
  reply_to_id?: Snowflake;
  mentions?: Snowflake[];
  mention_roles?: Snowflake[];
  mention_everyone?: boolean;
  attachments?: Attachment[];
  reactions?: MessageReaction[];
  pinned?: boolean;
  pinned_at?: string;
  pinned_by?: Snowflake;
  thread_id?: Snowflake;
  system_type?: string;
  system_payload?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  bot?: boolean;
  author?: User;
}

export interface SpaceMember {
  user_id: Snowflake;
  space_id?: Snowflake;
  user?: User;
  nickname?: string;
  role_ids: Snowflake[];
  roles?: Snowflake[];
  joined_at?: string;
  bot?: boolean;
  public_flags?: number;
  presence?: {
    status: string;
    custom_status?: string;
  };
}

export interface ReadyPayload {
  user: User;
  session_id?: string;
  spaces: Space[];
  rooms?: Room[];
  space_rooms?: Record<Snowflake, Room[]>;
  relationships?: unknown[];
  voice_states?: unknown[];
  calls?: unknown[];
}

export interface CreateMessageBody {
  plaintext?: string;
  reply_to_id?: Snowflake;
  mentions?: Snowflake[];
  mention_roles?: Snowflake[];
  mention_everyone?: boolean;
  attachments?: Snowflake[];
}

export interface EditMessageBody {
  plaintext: string;
}

export interface GatewayEventEnvelope<T = unknown> {
  t: string;
  room_id?: Snowflake;
  space_id?: Snowflake;
  user_id?: Snowflake;
  d: T;
}

export interface GatewayFrame<T = unknown> {
  op: GatewayOpValue;
  t?: string;
  d?: T;
  room_id?: Snowflake;
  space_id?: Snowflake;
  user_id?: Snowflake;
}
