export type Snowflake = string;

export const Permission = {
  ViewRoom: 1 << 0,
  SendMessages: 1 << 1,
  ReadMessageHistory: 1 << 2,
  AddReactions: 1 << 3,
  UseExternalEmojis: 1 << 4,
  MentionEveryone: 1 << 5,
  ManageMessages: 1 << 6,
  ManageRoles: 1 << 7,
  ManageRooms: 1 << 8,
  KickMembers: 1 << 9,
  BanMembers: 1 << 10,
  Administrator: 1 << 11,
  ManageSpace: 1 << 12,
  CreateInvite: 1 << 13,
  CreateInvites: 1 << 13,
  ManageEmojis: 1 << 14,
  Connect: 1 << 15,
  Speak: 1 << 16,
  Video: 1 << 17,
  MuteMembers: 1 << 18,
  DeafenMembers: 1 << 19,
  MoveMembers: 1 << 20,
  UseVoiceActivity: 1 << 21,
  PrioritySpeaker: 1 << 22,
  AttachFiles: 1 << 23,
  CreatePublicThreads: 1 << 24,
  CreatePrivateThreads: 1 << 25,
  SendMessagesInThreads: 1 << 26,
  ManageThreads: 1 << 27,
} as const;

export type PermissionName = keyof typeof Permission;

export type PermissionResolvable =
  | number
  | PermissionName
  | PermissionResolvable[];

export const READ_AND_POST_PERMISSIONS =
  Permission.ViewRoom | Permission.SendMessages | Permission.ReadMessageHistory;

export const DEFAULT_EVERYONE_PERMISSIONS = 10723359;

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

export const ALL_PERMISSIONS = Object.values(Permission).reduce(
  (a, b) => a | b,
  0,
);

export const RoomType = {
  PM: 1,
  GroupPM: 2,
  Text: 3,
  SpaceText: 3,
  Voice: 4,
  SpaceVoice: 4,
  Section: 5,
  SpaceSection: 5,
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
  Activity: 9,
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

export const STRAFE_EPOCH = 1704067200000n;

export interface DeconstructedSnowflake {
  id: Snowflake;
  timestamp: number;
  date: Date;
  workerId: number;
  processId: number;
  increment: number;
}

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

export function snowflakeTimestamp(
  id: Snowflake,
  epoch: bigint = STRAFE_EPOCH,
): number {
  return deconstructSnowflake(id, epoch).timestamp;
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
  bot?: boolean;
  public_flags?: number;
  presence?: { status?: string; activities?: unknown[] };
  created_at?: string;
}

export interface Role {
  id: Snowflake;
  name: string;
  permissions: number;
  position?: number;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
}

export interface PermissionOverride {
  role_id?: Snowflake;
  user_id?: Snowflake;
  allow: number;
  deny: number;
}

export interface ThreadMetadata {
  private?: boolean;
  owner_id?: Snowflake;
  joined?: boolean;
  archived?: boolean;
  locked?: boolean;
  auto_archive_duration?: number;
}

export interface Room {
  id: Snowflake;
  type: RoomTypeValue;
  name?: string;
  topic?: string;
  position?: number;
  parent_id?: Snowflake;
  space_id?: Snowflake;
  e2ee_enabled?: boolean;
  slowmode_seconds?: number;
  permission_overrides?: PermissionOverride[];
  user_overrides?: PermissionOverride[];
  recipients?: Snowflake[];
  thread?: ThreadMetadata;
  created_at?: string;
}

export interface Space {
  id: Snowflake;
  name: string;
  icon?: string;
  owner_id: Snowflake;
  everyone_role_id?: Snowflake;
  roles?: Role[];
  system_room_id?: Snowflake;
  default_message_notifications?: number;
  afk_timeout?: number;
  rooms?: Room[];
}

export interface SpaceMember {
  user_id: Snowflake;
  role_ids?: Snowflake[];
  roles?: Snowflake[];
  nick?: string;
  joined_at?: string;
  bot?: boolean;
  presence?: { status?: string; activities?: unknown[] };
  space_avatar?: string | null;
  space_banner?: string | null;
  space_about_me?: string | null;
  space_bio?: string | null;
  space_pronouns?: string | null;
}

export interface Attachment {
  id: Snowflake;
  filename?: string;
  url?: string;
  size?: number;
  content_type?: string;
}

export interface MessageReaction {
  emoji: string;
  count?: number;
  me?: boolean;
}

export interface Message {
  id: Snowflake;
  room_id: Snowflake;
  space_id?: Snowflake;
  sender_id: Snowflake;
  plaintext?: string;
  ciphertext?: string;
  reply_to_id?: Snowflake;
  attachments?: Attachment[];
  mentions?: Snowflake[];
  reactions?: MessageReaction[];
  pinned?: boolean;
  bot?: boolean;
  system_type?: string;
  created_at?: string;
  edited_at?: string;
}

export interface CreateMessageBody {
  plaintext?: string;
  reply_to_id?: Snowflake;
  mentions?: Snowflake[];
  attachments?: Snowflake[];
}

export interface EditMessageBody {
  plaintext?: string;
}

export interface ReadyPayload {
  user: User;
  session_id?: string;
  rooms?: Room[];
  relationships?: unknown[];
  spaces?: Space[];
  space_rooms?: Record<string, Room[]>;
  voice_states?: unknown[];
  calls?: unknown[];
}

export interface GatewayFrame<T = unknown> {
  op: number;
  d?: T;
  t?: string;
  space_id?: Snowflake;
  room_id?: Snowflake;
  user_id?: Snowflake;
}

export function isEncryptedRoom(room?: Room | null): boolean {
  return !!room?.e2ee_enabled;
}

export function isEncryptedMessage(msg?: Message | null): boolean {
  return !!(msg && msg.ciphertext && !msg.plaintext);
}

export type OAuth2Scope =
  | 'identify'
  | 'email'
  | 'spaces'
  | 'spaces.join'
  | 'bot'
  | string;

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: 'Bearer' | string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface OAuth2ApplicationPublic {
  id: Snowflake;
  name: string;
  description?: string;
  icon?: string;
  has_bot: boolean;
  bot_public: boolean;
  bot?: User;
}

export interface OAuth2Application extends OAuth2ApplicationPublic {
  redirect_uris?: string[];
  client_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OAuth2TokenInfo {
  application: OAuth2ApplicationPublic;
  scopes: OAuth2Scope[];
  expires: string;
  user?: User;
}

export interface OAuth2Grant {
  application: OAuth2ApplicationPublic;
  scopes: OAuth2Scope[];
  created_at?: string;
}

export interface OAuth2UrlOptions {
  baseUrl?: string;
  clientId: Snowflake;
  scopes?: OAuth2Scope[];
  redirectUri?: string;
  state?: string;
  permissions?: PermissionResolvable;
  spaceId?: Snowflake;
  disableSpaceSelect?: boolean;
}

export interface BotInviteUrlOptions {
  baseUrl?: string;
  clientId: Snowflake;
  permissions?: PermissionResolvable;
  spaceId?: Snowflake;
  disableSpaceSelect?: boolean;
  scopes?: OAuth2Scope[];
  redirectUri?: string;
  state?: string;
}

export type PushTransportKind = 'fcm' | 'apns' | 'unifiedpush' | 'web';

export interface PushPreferences {
  preview?: boolean;
  pm?: 'all' | 'none';
  space?: 'all' | 'mentions' | 'none';
  calls?: boolean;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  kind: PushTransportKind;
  prefs?: PushPreferences;
}

export interface PushSubscriptionRecord {
  kind: PushTransportKind;
  endpoint_host: string;
  prefs: Required<PushPreferences>;
  created_at: string;
  updated_at: string;
  last_success_at?: string;
  last_error: string;
  failures: number;
}

export interface PushPayload {
  v: 1;
  t: 'msg' | 'read' | 'call' | 'call_end' | 'test';
  uid: Snowflake;
  ts: number;
  rid?: Snowflake;
  rt?: RoomTypeValue;
  sid?: Snowflake;
  mid?: Snowflake;
  a?: { id: Snowflake; n: string; av?: string };
  rn?: string;
  pn?: string;
  sn?: string;
  e?: boolean;
  b?: string;
  att?: number;
  m?: boolean;
  vid?: boolean;
}
