import { type Snowflake, type User, type Space, type Room, type Message, type SpaceMember, type CreateMessageBody, type Attachment } from '@strafe-js/util';
export interface RESTOptions {
    apiBase: string;
    token?: string;
    tokenType?: 'Bot' | 'Bearer';
    retries?: number;
}
export interface RequestOptions {
    body?: unknown;
    query?: Record<string, string | number | undefined | null>;
    headers?: Record<string, string>;
    raw?: boolean;
}
export declare class REST {
    apiBase: string;
    token: string | null;
    tokenType: 'Bot' | 'Bearer';
    retries: number;
    constructor(opts: RESTOptions);
    setToken(token: string, type?: 'Bot' | 'Bearer'): void;
    request<T = unknown>(method: string, path: string, opts?: RequestOptions): Promise<T>;
    get<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
    post<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
    patch<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
    put<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
    delete<T = unknown>(path: string, opts?: RequestOptions): Promise<T>;
    getMe(): Promise<User>;
    getMySpaces(): Promise<Space[]>;
    getSpaces(): Promise<Space[]>;
    getSpace(id: Snowflake): Promise<Space>;
    getSpaceRooms(spaceId: Snowflake): Promise<Room[]>;
    getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]>;
    createMessage(roomId: Snowflake, body: CreateMessageBody): Promise<Message>;
    editMessage(roomId: Snowflake, messageId: Snowflake, body: {
        plaintext: string;
    }): Promise<Message>;
    deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<null>;
    listMessages(roomId: Snowflake, params?: {
        before?: Snowflake;
        after?: Snowflake;
        around?: Snowflake;
        limit?: number;
    }): Promise<Message[]>;
    getMessage(roomId: Snowflake, messageId: Snowflake): Promise<Message>;
    triggerTyping(roomId: Snowflake): Promise<null>;
    addReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<null>;
    removeReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<null>;
    createInvite(spaceId: Snowflake, opts?: {
        max_age_seconds?: number;
        max_uses?: number;
    }): Promise<{
        code: string;
        space_id: Snowflake;
        inviter_id: Snowflake;
    }>;
    kickMember(spaceId: Snowflake, userId: Snowflake): Promise<null>;
    banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<null>;
    uploadAttachment(roomId: Snowflake, file: Blob | Buffer, opts?: {
        filename?: string;
        width?: number;
        height?: number;
    }): Promise<Attachment>;
}
//# sourceMappingURL=index.d.ts.map