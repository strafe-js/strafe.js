import { Attachment, Message, Role, Room, RoomTypeValue, Snowflake, Space, SpaceMember, ThreadMetadata, User } from '@strafe-js/util';
export interface RESTOptions {
    baseUrl: string;
    token?: string;
    authScheme?: 'Bot' | 'Bearer';
    retries?: number;
    userAgent?: string;
}
export interface RequestOptions {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
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
export interface Invite {
    code: string;
    space_id?: Snowflake;
    inviter_id?: Snowflake;
    max_uses?: number;
    current_uses?: number;
    expires_at?: string;
    created_at?: string;
}
export interface AuditLogEntry {
    id: Snowflake;
    action_type: string;
    user_id: Snowflake;
    target_id?: Snowflake;
    changes?: unknown;
    reason?: string;
    created_at: string;
}
export declare class REST {
    private baseUrl;
    private token?;
    private authScheme;
    private retries;
    private userAgent;
    constructor(opts: RESTOptions);
    setToken(token: string): this;
    request<T = unknown>(opts: RequestOptions): Promise<T>;
    get<T = unknown>(path: string, query?: RequestOptions['query']): Promise<T>;
    post<T = unknown>(path: string, body?: unknown): Promise<T>;
    patch<T = unknown>(path: string, body?: unknown): Promise<T>;
    put<T = unknown>(path: string, body?: unknown): Promise<T>;
    delete<T = unknown>(path: string, body?: unknown): Promise<T>;
    getMe(): Promise<User>;
    updateProfile(body: {
        display_name?: string;
        bio?: string;
        about_me?: string;
        pronouns?: string;
        birthday_opt_in?: boolean;
        accent_color?: string;
        presence?: {
            status: 'online' | 'idle' | 'dnd' | 'invisible';
            custom_status?: string;
        };
    }): Promise<User>;
    getMySpaces(): Promise<Space[]>;
    getSpaces(): Promise<Space[]>;
    getSpace(spaceId: Snowflake): Promise<Space>;
    editSpace(spaceId: Snowflake, body: {
        name?: string;
        description?: string;
        system_room_id?: Snowflake | '';
        system_room_flags?: number;
        default_message_notifications?: 0 | 1;
        afk_room_id?: Snowflake | '';
        afk_timeout?: 60 | 300 | 900 | 1800 | 3600;
        widget_enabled?: boolean;
        widget_room_id?: Snowflake | '';
        birthday_channel_id?: Snowflake | '';
        birthday_message?: string;
    }): Promise<Space>;
    leaveSpace(spaceId: Snowflake): Promise<void>;
    getAuditLog(spaceId: Snowflake, params?: {
        limit?: number;
        before?: Snowflake;
        action?: string;
    }): Promise<{
        entries: AuditLogEntry[];
        users: Record<Snowflake, User>;
    }>;
    getSpaceRooms(spaceId: Snowflake): Promise<Room[]>;
    createRoom(spaceId: Snowflake, body: {
        name: string;
        type: RoomTypeValue;
        parent_id?: Snowflake;
        e2ee_enabled?: boolean;
        user_limit?: number;
        bitrate?: number;
    }): Promise<Room>;
    editRoom(spaceId: Snowflake, roomId: Snowflake, body: {
        name?: string;
        topic?: string;
        slowmode_seconds?: number;
        e2ee_enabled?: boolean;
        user_limit?: number;
        bitrate?: number;
        position?: number;
    }): Promise<Room>;
    deleteRoom(spaceId: Snowflake, roomId: Snowflake): Promise<void>;
    getRoom(roomId: Snowflake): Promise<Room>;
    getPMRooms(): Promise<Room[]>;
    openPM(body: {
        recipient_id?: Snowflake;
        recipient_handle?: string;
        name?: string;
        recipient_ids?: Snowflake[];
    }): Promise<Room>;
    ackRoom(roomId: Snowflake, messageId: Snowflake): Promise<void>;
    getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]>;
    getSpaceMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember>;
    setMemberRoles(spaceId: Snowflake, userId: Snowflake, roleIds: Snowflake[]): Promise<void>;
    kickMember(spaceId: Snowflake, userId: Snowflake): Promise<void>;
    banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<void>;
    unbanMember(spaceId: Snowflake, userId: Snowflake): Promise<void>;
    getSpaceBans(spaceId: Snowflake): Promise<{
        bans: {
            user_id: Snowflake;
            reason?: string;
            banned_by: Snowflake;
            created_at: string;
        }[];
        users: Record<Snowflake, User>;
    }>;
    getSpaceRoles(spaceId: Snowflake): Promise<Role[]>;
    createRole(spaceId: Snowflake, body: {
        name: string;
        permissions?: number;
        color?: number;
        hoist?: boolean;
        mentionable?: boolean;
    }): Promise<Role>;
    editRole(spaceId: Snowflake, roleId: Snowflake, body: {
        name?: string;
        permissions?: number;
        color?: number;
        hoist?: boolean;
        mentionable?: boolean;
        position?: number;
    }): Promise<Role>;
    deleteRole(spaceId: Snowflake, roleId: Snowflake): Promise<void>;
    createMessage(roomId: Snowflake, body: CreateMessageBody | string): Promise<Message>;
    editMessage(roomId: Snowflake, messageId: Snowflake, body: EditMessageBody | string): Promise<Message>;
    deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<void>;
    listMessages(roomId: Snowflake, params?: {
        limit?: number;
        before?: Snowflake;
        after?: Snowflake;
    }): Promise<Message[]>;
    getMessage(roomId: Snowflake, messageId: Snowflake): Promise<Message>;
    searchRoomMessages(roomId: Snowflake, params: {
        q?: string;
        has?: 'link' | 'file' | 'image' | 'video' | 'audio';
        limit?: number;
    }): Promise<Message[]>;
    searchSpaceMessages(spaceId: Snowflake, params: {
        q?: string;
        has?: 'link' | 'file' | 'image' | 'video' | 'audio';
        limit?: number;
    }): Promise<Message[]>;
    triggerTyping(roomId: Snowflake): Promise<void>;
    addReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<void>;
    removeReaction(roomId: Snowflake, messageId: Snowflake, emoji: string, userId?: Snowflake): Promise<void>;
    getReactions(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<User[]>;
    pinMessage(roomId: Snowflake, messageId: Snowflake): Promise<void>;
    unpinMessage(roomId: Snowflake, messageId: Snowflake): Promise<void>;
    getPinnedMessages(roomId: Snowflake): Promise<{
        items: {
            pinned_at: string;
            pinned_by: Snowflake;
            message: Message;
        }[];
        has_more: boolean;
    }>;
    createThreadFromMessage(roomId: Snowflake, messageId: Snowflake, body: {
        name: string;
        auto_archive_minutes?: 60 | 1440 | 4320 | 10080;
    }): Promise<Room>;
    createThread(roomId: Snowflake, body: {
        name: string;
        auto_archive_minutes?: 60 | 1440 | 4320 | 10080;
        private?: boolean;
        invitable?: boolean;
    }): Promise<Room>;
    getThread(threadId: Snowflake): Promise<Room & {
        thread: ThreadMetadata;
    }>;
    editThread(threadId: Snowflake, body: {
        name?: string;
        archived?: boolean;
        locked?: boolean;
        invitable?: boolean;
        auto_archive_minutes?: 60 | 1440 | 4320 | 10080;
        slowmode_seconds?: number;
    }): Promise<Room>;
    deleteThread(threadId: Snowflake): Promise<void>;
    getThreadMembers(threadId: Snowflake): Promise<{
        user_id: Snowflake;
        joined_at: string;
        user?: User;
    }[]>;
    joinThread(threadId: Snowflake): Promise<void>;
    leaveThread(threadId: Snowflake): Promise<void>;
    addThreadMember(threadId: Snowflake, userId: Snowflake): Promise<void>;
    removeThreadMember(threadId: Snowflake, userId: Snowflake): Promise<void>;
    getActiveThreads(spaceId: Snowflake): Promise<{
        threads: Room[];
    }>;
    getArchivedThreads(roomId: Snowflake, params?: {
        before?: string;
        limit?: number;
    }): Promise<{
        threads: Room[];
        has_more: boolean;
    }>;
    createInvite(spaceId: Snowflake, opts?: {
        max_uses?: number;
        max_age_seconds?: number;
        max_age?: number;
        room_id?: Snowflake;
    }): Promise<Invite>;
    getSpaceInvites(spaceId: Snowflake): Promise<Invite[]>;
    deleteInvite(spaceId: Snowflake, code: string): Promise<void>;
    getInvite(code: string): Promise<{
        space: Partial<Space>;
        inviter_display_name?: string;
    }>;
    uploadAttachment(roomIdOrFile: Snowflake | Blob | Buffer, fileOrFilename: Blob | Buffer | string, filenameOrOpts?: string | {
        width?: number;
        height?: number;
    }, opts?: {
        width?: number;
        height?: number;
    }): Promise<Attachment>;
}
//# sourceMappingURL=index.d.ts.map