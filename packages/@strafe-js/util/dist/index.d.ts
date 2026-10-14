export type Snowflake = string;
/**
 * Strafe permission bitflags matching https://app.strafe.chat/docs/permissions/#the-bits
 */
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
    readonly CreateInvites: number;
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
    readonly ChangeNickname: number;
    readonly ManageNicknames: number;
    readonly SendVoiceMessages: number;
};
export type PermissionName = keyof typeof Permission;
export type PermissionResolvable = number | PermissionName | PermissionResolvable[];
export declare const ALL_PERMISSIONS: number;
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
    status: number;
    code?: string;
    body?: unknown;
    constructor(message: string, status: number, code?: string, body?: unknown);
}
export declare class RateLimitError extends StrafeError {
    retryAfter: number;
    constructor(retryAfter: number, body?: unknown);
}
export declare class BitField {
    bits: number;
    constructor(bits?: PermissionResolvable);
    get bitfield(): number;
    has(perm: PermissionResolvable): boolean;
    add(...perms: PermissionResolvable[]): this;
    remove(...perms: PermissionResolvable[]): this;
    toArray(): PermissionName[];
    toJSON(): number;
    valueOf(): number;
}
export declare function resolvePermission(input: PermissionResolvable): number;
export declare function isSnowflake(id: unknown): id is Snowflake;
export declare const sleep: (ms: number) => Promise<void>;
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
//# sourceMappingURL=index.d.ts.map