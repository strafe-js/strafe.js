/** Snowflake ids are always strings. */
export type Snowflake = string;
/** Full permission table from https://app.strafe.chat/docs/permissions/ */
export declare const Permission: {
    readonly ViewRoom: number;
    readonly SendMessages: number;
    readonly ReadMessageHistory: number;
    readonly AddReactions: number;
    readonly UseExternalEmojis: number;
    readonly MentionEveryone: number;
    readonly ManageMessages: number;
    readonly ManageRoles: number;
    readonly ManageRooms: number;
    readonly KickMembers: number;
    readonly BanMembers: number;
    readonly Administrator: number;
    readonly ManageSpace: number;
    readonly CreateInvite: number;
    readonly ManageEmojis: number;
    readonly Connect: number;
    readonly Speak: number;
    readonly Video: number;
    readonly MuteMembers: number;
    readonly DeafenMembers: number;
    readonly MoveMembers: number;
    readonly UseVoiceActivity: number;
    readonly PrioritySpeaker: number;
    readonly AttachFiles: number;
    readonly CreatePublicThreads: number;
    readonly CreatePrivateThreads: number;
    readonly SendMessagesInThreads: number;
    readonly ManageThreads: number;
};
export type PermissionName = keyof typeof Permission;
export type PermissionResolvable = PermissionName | number | PermissionName[];
export declare const RoomType: {
    readonly PM: 1;
    readonly GroupPM: 2;
    readonly Text: 3;
    readonly Voice: 4;
    readonly Section: 5;
    readonly Thread: 6;
};
export type RoomTypeValue = (typeof RoomType)[keyof typeof RoomType];
export declare const GatewayOp: {
    readonly Heartbeat: 0;
    readonly Subscribe: 1;
    readonly Send: 2;
    readonly Event: 3;
    readonly Ready: 4;
    readonly Unsubscribe: 5;
    readonly Ping: 6;
    readonly Pong: 7;
    readonly Error: 8;
};
export type GatewayOpValue = (typeof GatewayOp)[keyof typeof GatewayOp];
export declare class StrafeError extends Error {
    readonly status: number;
    readonly code: string | number | null;
    readonly body: unknown;
    constructor(message: string, status?: number, code?: string | number | null, body?: unknown);
}
export declare class RateLimitError extends StrafeError {
    readonly retryAfter: number;
    constructor(message: string, retryAfter: number, status?: number);
}
export declare class BitField {
    bitfield: number;
    constructor(bits?: number | BitField);
    has(bit: PermissionResolvable): boolean;
    add(...bits: PermissionResolvable[]): this;
    remove(...bits: PermissionResolvable[]): this;
    toJSON(): number;
    valueOf(): number;
}
export declare function resolvePermission(bit: PermissionResolvable): number;
export declare function isSnowflake(id: unknown): id is Snowflake;
export declare function sleep(ms: number): Promise<void>;
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
//# sourceMappingURL=index.d.ts.map