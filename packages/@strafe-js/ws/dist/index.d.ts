import { EventEmitter } from 'node:events';
import { GatewayFrame, ReadyPayload, Snowflake, Message, Space, Room, SpaceMember } from '@strafe-js/util';
/**
 * Configuration options for the {@link Gateway} WebSocket client.
 */
export interface GatewayOptions {
    /** Full WebSocket gateway URL (for example `'wss://app.strafe.chat/ws'`). */
    url: string;
    /** Bot or user authentication token sent in the WebSocket handshake `Authorization` header. */
    token: string;
    /** Authorization header prefix (`'Bot'`, `'Bearer'`, or `''` for raw token). Defaults to `'Bot'`. */
    authScheme?: 'Bot' | 'Bearer' | '';
    /** Interval in milliseconds between client heartbeat pings (`op: 6`). Defaults to `45000` (45s). */
    heartbeatIntervalMs?: number;
    /** Whether to automatically reconnect with exponential backoff + jitter after unexpected disconnects. Defaults to `true`. */
    reconnect?: boolean;
    /** Base delay in milliseconds before the first reconnect attempt. Defaults to `2500`. */
    reconnectDelay?: number;
    /** Maximum backoff cap in milliseconds between reconnect attempts. Defaults to `60000`. */
    maxReconnectDelay?: number;
}
/**
 * Strongly typed event map emitted by {@link Gateway}.
 * `SNAKE_CASE` server dispatch events (`op: 3`) are automatically normalized to `camelCase`.
 */
export interface GatewayEvents {
    /** Emitted when the underlying WebSocket connection opens. */
    open: () => void;
    /** Emitted when the gateway sends the initial `op: 4` (`Ready`) frame containing hydrated user, spaces, and rooms. */
    ready: (payload: ReadyPayload) => void;
    /** Emitted when the gateway responds to a client ping (`op: 6`) with a pong (`op: 7`). */
    pong: () => void;
    /** Emitted for every incoming {@link GatewayFrame} before event-specific dispatch. */
    raw: (frame: GatewayFrame) => void;
    /** Emitted when the WebSocket connection closes with a numeric close `code` and `reason` string. */
    close: (code: number, reason: string) => void;
    /** Emitted on WebSocket transport errors, JSON parse failures, or gateway `op: 8` error frames. */
    error: (err: Error) => void;
    /** Emitted when a new message is created in a subscribed space room or DM (`MESSAGE_CREATE`). */
    messageCreate: (message: Message) => void;
    /** Emitted when an existing message is edited (`MESSAGE_UPDATE`). */
    messageUpdate: (message: Message) => void;
    /** Emitted when a message is deleted (`MESSAGE_DELETE`). */
    messageDelete: (data: {
        id?: Snowflake;
        message_id?: Snowflake;
        room_id: Snowflake;
        space_id?: Snowflake;
    }) => void;
    /** Emitted when a user adds a reaction to a message (`MESSAGE_REACTION_ADD`). */
    messageReactionAdd: (data: {
        room_id: Snowflake;
        message_id: Snowflake;
        user_id: Snowflake;
        emoji: string;
    }) => void;
    /** Emitted when a user removes a reaction from a message (`MESSAGE_REACTION_REMOVE`). */
    messageReactionRemove: (data: {
        room_id: Snowflake;
        message_id: Snowflake;
        user_id: Snowflake;
        emoji: string;
    }) => void;
    /** Emitted when a message is pinned or unpinned in a room (`ROOM_PINS_UPDATE`). */
    roomPinsUpdate: (data: {
        room_id: Snowflake;
        message_id: Snowflake;
        user_id: Snowflake;
        pinned: boolean;
        pinned_at?: string;
        last_pin_timestamp?: string | null;
    }) => void;
    /** Emitted when a user starts typing in a room (`TYPING_START`). */
    typingStart: (data: {
        room_id: Snowflake;
        user_id: Snowflake;
        timestamp: number;
    }) => void;
    /** Emitted when a space is created or joined (`SPACE_CREATE`). */
    spaceCreate: (space: Space) => void;
    /** Emitted when space settings or metadata are updated (`SPACE_UPDATE`). */
    spaceUpdate: (space: Space) => void;
    /** Emitted when a space is deleted (`SPACE_DELETE`). */
    spaceDelete: (data: {
        id?: Snowflake;
        space_id?: Snowflake;
    }) => void;
    /** Emitted when the current user leaves or is removed from a space (`SPACE_LEAVE`). */
    spaceLeave: (data: {
        space_id: Snowflake;
    }) => void;
    /** Emitted when a DM or room is created (`ROOM_CREATE`). */
    roomCreate: (room: Room) => void;
    /** Emitted when a room is updated (`ROOM_UPDATE`). */
    roomUpdate: (room: Room) => void;
    /** Emitted when a room is deleted (`ROOM_DELETE`). */
    roomDelete: (data: {
        id?: Snowflake;
        room_id?: Snowflake;
        space_id?: Snowflake;
    }) => void;
    /** Emitted when a room is created inside a space (`SPACE_ROOM_CREATE`). */
    spaceRoomCreate: (room: Room) => void;
    /** Emitted when a room inside a space is updated (`SPACE_ROOM_UPDATE`). */
    spaceRoomUpdate: (room: Room) => void;
    /** Emitted when a room inside a space is deleted (`SPACE_ROOM_DELETE`). */
    spaceRoomDelete: (data: {
        space_id: Snowflake;
        room_id: Snowflake;
    }) => void;
    /** Emitted when a public or private thread is created (`THREAD_CREATE`). */
    threadCreate: (thread: Room & {
        newly_created?: boolean;
        joined?: boolean;
    }) => void;
    /** Emitted when thread metadata or archive/lock state changes (`THREAD_UPDATE`). */
    threadUpdate: (thread: Room) => void;
    /** Emitted when a thread is deleted (`THREAD_DELETE`). */
    threadDelete: (data: {
        space_id: Snowflake;
        room_id: Snowflake;
        parent_id?: Snowflake;
    }) => void;
    /** Emitted when a user joins a space (`SPACE_MEMBER_ADD`). */
    spaceMemberAdd: (member: SpaceMember & {
        space_id?: Snowflake;
    }) => void;
    /** Emitted when a space member's roles or profile change (`SPACE_MEMBER_UPDATE`). */
    spaceMemberUpdate: (member: Partial<SpaceMember> & {
        user_id: Snowflake;
        space_id?: Snowflake;
    }) => void;
    /** Emitted when a member leaves or is kicked/banned from a space (`SPACE_MEMBER_REMOVE`). */
    spaceMemberRemove: (data: {
        user_id?: Snowflake;
        space_id?: Snowflake;
    }) => void;
    /** Emitted when a batch of space members is received (`SPACE_MEMBERS_CHUNK`). */
    spaceMembersChunk: (data: {
        space_id?: Snowflake;
        members?: SpaceMember[];
    }) => void;
    /** Emitted when a role is created in a space (`SPACE_ROLE_CREATE`). */
    spaceRoleCreate: (role: unknown) => void;
    /** Emitted when a role is updated in a space (`SPACE_ROLE_UPDATE`). */
    spaceRoleUpdate: (role: unknown) => void;
    /** Emitted when a role is deleted from a space (`SPACE_ROLE_DELETE`). */
    spaceRoleDelete: (data: {
        role_id: Snowflake;
        space_id?: Snowflake;
    }) => void;
    /** Emitted when a user's online status or custom presence changes (`PRESENCE_UPDATE`). */
    presenceUpdate: (data: {
        user_id: Snowflake;
        status?: string;
        presence?: {
            status: string;
        };
    }) => void;
    /** Emitted when the current authentication session is revoked (`SESSION_REVOKED`). */
    sessionRevoked: (data: {
        reason?: string;
    }) => void;
}
export declare interface Gateway {
    /** Registers a typed listener for a {@link GatewayEvents} event. */
    on<E extends keyof GatewayEvents>(event: E, listener: GatewayEvents[E]): this;
    /** Registers a listener for a custom or unmapped gateway event name. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time typed listener for a {@link GatewayEvents} event. */
    once<E extends keyof GatewayEvents>(event: E, listener: GatewayEvents[E]): this;
    /** Registers a one-time listener for a custom or unmapped gateway event name. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Emits a typed {@link GatewayEvents} event to all registered listeners. */
    emit<E extends keyof GatewayEvents>(event: E, ...args: Parameters<GatewayEvents[E]>): boolean;
    /** Emits a custom gateway event to all registered listeners. */
    emit(event: string, ...args: any[]): boolean;
}
/**
 * Real-time WebSocket client for the Strafe Gateway protocol (`op: 0..8`).
 * Manages authentication via handshake headers, periodic heartbeat pings (`op: 6`),
 * exponential backoff reconnection with random jitter, and automatic normalization
 * of `SNAKE_CASE` server event names into `camelCase` {@link GatewayEvents}.
 *
 * @example
 * ```ts
 * import { Gateway } from '@strafe-js/ws';
 *
 * const ws = new Gateway({
 *   url: 'wss://app.strafe.chat/ws',
 *   token: process.env.STRAFE_BOT_TOKEN!,
 * });
 *
 * ws.on('ready', ({ user, spaces }) => {
 *   console.log(`Connected as ${user.username}`);
 *   for (const space of spaces) ws.subscribe(space.id);
 * });
 *
 * ws.connect();
 * ```
 */
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
    /**
     * Creates a new {@link Gateway} client instance without opening the connection.
     * Call {@link Gateway.connect} to establish the WebSocket session.
     */
    constructor(opts: GatewayOptions);
    /**
     * Opens (or re-opens) the WebSocket connection to `url` with the configured `Authorization` header
     * and starts the heartbeat timer once the socket opens.
     */
    connect(): void;
    /**
     * Disables automatic reconnection, clears active heartbeat/reconnect timers,
     * and closes the WebSocket connection with code `1000` (`client disconnect`).
     */
    disconnect(): void;
    /**
     * Sends a heartbeat ping frame (`op: 6`) to the gateway.
     * The gateway responds with `op: 7`, triggering the `pong` event.
     */
    ping(): void;
    /**
     * Serializes and sends a raw gateway frame `{ op, d, ...extra }` if the socket is `OPEN`.
     * Silently drops the frame if the socket is not currently open.
     */
    send(op: number, d?: unknown, extra?: Partial<GatewayFrame>): void;
    /**
     * Subscribes the session to real-time events for a space or room (`op: 1`, `{ space_id }`).
     */
    subscribe(spaceOrRoomId: Snowflake): void;
    /**
     * Unsubscribes the session from real-time events for a space or room (`op: 5`, `{ space_id }`).
     */
    unsubscribe(spaceOrRoomId: Snowflake): void;
    /**
     * Sends a real-time typing frame over the gateway (`op: 2`, `{ space_id: roomId, type: 'typing', room_id: roomId }`).
     */
    sendTyping(roomId: Snowflake): void;
    private _startHeartbeat;
    private _stopHeartbeat;
    private _scheduleReconnect;
    private _clearTimers;
    private _handle;
    private _eventName;
}
//# sourceMappingURL=index.d.ts.map