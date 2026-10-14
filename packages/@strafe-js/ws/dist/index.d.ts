import { EventEmitter } from 'node:events';
import { GatewayFrame, ReadyPayload, Snowflake, Message, Space, Room, SpaceMember } from '@strafe-js/util';
export interface GatewayOptions {
    url: string;
    token: string;
    authScheme?: 'Bot' | 'Bearer' | '';
    heartbeatIntervalMs?: number;
    reconnect?: boolean;
    reconnectDelay?: number;
    maxReconnectDelay?: number;
}
export interface GatewayEvents {
    open: () => void;
    ready: (payload: ReadyPayload) => void;
    pong: () => void;
    raw: (frame: GatewayFrame) => void;
    close: (code: number, reason: string) => void;
    error: (err: Error) => void;
    messageCreate: (message: Message) => void;
    messageUpdate: (message: Message) => void;
    messageDelete: (data: {
        id?: Snowflake;
        message_id?: Snowflake;
        room_id: Snowflake;
        space_id?: Snowflake;
    }) => void;
    messageReactionAdd: (data: {
        room_id: Snowflake;
        message_id: Snowflake;
        user_id: Snowflake;
        emoji: string;
    }) => void;
    messageReactionRemove: (data: {
        room_id: Snowflake;
        message_id: Snowflake;
        user_id: Snowflake;
        emoji: string;
    }) => void;
    roomPinsUpdate: (data: {
        room_id: Snowflake;
        message_id: Snowflake;
        user_id: Snowflake;
        pinned: boolean;
        pinned_at?: string;
        last_pin_timestamp?: string | null;
    }) => void;
    typingStart: (data: {
        room_id: Snowflake;
        user_id: Snowflake;
        timestamp: number;
    }) => void;
    spaceCreate: (space: Space) => void;
    spaceUpdate: (space: Space) => void;
    spaceDelete: (data: {
        id?: Snowflake;
        space_id?: Snowflake;
    }) => void;
    spaceLeave: (data: {
        space_id: Snowflake;
    }) => void;
    roomCreate: (room: Room) => void;
    roomUpdate: (room: Room) => void;
    roomDelete: (data: {
        id?: Snowflake;
        room_id?: Snowflake;
        space_id?: Snowflake;
    }) => void;
    spaceRoomCreate: (room: Room) => void;
    spaceRoomUpdate: (room: Room) => void;
    spaceRoomDelete: (data: {
        space_id: Snowflake;
        room_id: Snowflake;
    }) => void;
    threadCreate: (thread: Room & {
        newly_created?: boolean;
        joined?: boolean;
    }) => void;
    threadUpdate: (thread: Room) => void;
    threadDelete: (data: {
        space_id: Snowflake;
        room_id: Snowflake;
        parent_id?: Snowflake;
    }) => void;
    spaceMemberAdd: (member: SpaceMember & {
        space_id?: Snowflake;
    }) => void;
    spaceMemberUpdate: (member: Partial<SpaceMember> & {
        user_id: Snowflake;
        space_id?: Snowflake;
    }) => void;
    spaceMemberRemove: (data: {
        user_id?: Snowflake;
        space_id?: Snowflake;
    }) => void;
    spaceMembersChunk: (data: {
        space_id?: Snowflake;
        members?: SpaceMember[];
    }) => void;
    spaceRoleCreate: (role: unknown) => void;
    spaceRoleUpdate: (role: unknown) => void;
    spaceRoleDelete: (data: {
        role_id: Snowflake;
        space_id?: Snowflake;
    }) => void;
    presenceUpdate: (data: {
        user_id: Snowflake;
        status?: string;
        presence?: {
            status: string;
        };
    }) => void;
    sessionRevoked: (data: {
        reason?: string;
    }) => void;
}
export declare interface Gateway {
    on<E extends keyof GatewayEvents>(event: E, listener: GatewayEvents[E]): this;
    on(event: string, listener: (...args: any[]) => void): this;
    once<E extends keyof GatewayEvents>(event: E, listener: GatewayEvents[E]): this;
    once(event: string, listener: (...args: any[]) => void): this;
    emit<E extends keyof GatewayEvents>(event: E, ...args: Parameters<GatewayEvents[E]>): boolean;
    emit(event: string, ...args: any[]): boolean;
}
export declare class Gateway extends EventEmitter {
    private url;
    private token;
    private authScheme;
    private heartbeatIntervalMs;
    private shouldReconnect;
    private reconnectDelay;
    private maxReconnectDelay;
    private reconnectAttempts;
    private ws?;
    private hbTimer?;
    private reconnectTimer?;
    constructor(opts: GatewayOptions);
    connect(): void;
    disconnect(): void;
    ping(): void;
    send(op: number, d?: unknown, extra?: Partial<GatewayFrame>): void;
    subscribe(spaceOrRoomId: Snowflake): void;
    unsubscribe(spaceOrRoomId: Snowflake): void;
    sendTyping(roomId: Snowflake): void;
    private _startHeartbeat;
    private _stopHeartbeat;
    private _scheduleReconnect;
    private _clearTimers;
    private _handle;
    private _eventName;
}
//# sourceMappingURL=index.d.ts.map