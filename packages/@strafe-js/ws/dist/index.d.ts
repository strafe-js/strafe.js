import WebSocket from 'ws';
import { EventEmitter } from 'node:events';
import { type GatewayEventEnvelope, type ReadyPayload, type User, type Snowflake } from '@strafe-js/util';
export interface GatewayOptions {
    url: string;
    token: string;
    tokenType?: 'Bot' | 'Bearer';
    reconnectDelay?: number;
    maxReconnectDelay?: number;
    heartbeatInterval?: number;
}
export interface GatewayEvents {
    ready: [ReadyPayload];
    raw: [GatewayEventEnvelope];
    messageCreate: [unknown, GatewayEventEnvelope];
    messageUpdate: [unknown, GatewayEventEnvelope];
    messageDelete: [unknown, GatewayEventEnvelope];
    messageReactionAdd: [unknown, GatewayEventEnvelope];
    messageReactionRemove: [unknown, GatewayEventEnvelope];
    spaceCreate: [unknown];
    spaceLeave: [unknown];
    spaceDelete: [unknown];
    spaceRoomCreate: [unknown];
    spaceRoomDelete: [unknown];
    spaceMemberAdd: [unknown];
    spaceMemberRemove: [unknown];
    spaceMemberUpdate: [unknown, GatewayEventEnvelope];
    typingStart: [unknown];
    sessionRevoked: [unknown];
    error: [Error];
    disconnect: [number];
    debug: [string];
    pong: [];
}
export declare class Gateway extends EventEmitter {
    url: string;
    token: string;
    tokenType: 'Bot' | 'Bearer';
    reconnectDelay: number;
    maxReconnectDelay: number;
    heartbeatIntervalMs: number;
    ws: WebSocket | null;
    sessionId: string | null;
    user: User | null;
    private _closed;
    private _reconnectAttempts;
    private _reconnectTimer;
    private _heartbeatTimer;
    constructor(opts: GatewayOptions);
    connect(): void;
    disconnect(): void;
    ping(): void;
    send(op: number, d?: unknown): void;
    subscribe(id: Snowflake): void;
    unsubscribe(id: Snowflake): void;
    sendTyping(roomId: Snowflake): void;
    private _startHeartbeat;
    private _stopHeartbeat;
    private _scheduleReconnect;
    private _clearTimers;
    private _handle;
    private _eventName;
}
//# sourceMappingURL=index.d.ts.map