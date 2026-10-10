import WebSocket from 'ws';
import { EventEmitter } from 'node:events';
import { type GatewayEventEnvelope, type ReadyPayload, type User, type Snowflake } from '@strafe-js/util';
export interface GatewayOptions {
    url: string;
    token: string;
    tokenType?: 'Bot' | 'Bearer';
    reconnectDelay?: number;
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
    spaceMemberUpdate: [unknown];
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
    ws: WebSocket | null;
    sessionId: string | null;
    user: User | null;
    private _closed;
    constructor(opts: GatewayOptions);
    connect(): void;
    disconnect(): void;
    send(op: number, d?: unknown): void;
    subscribe(id: Snowflake): void;
    unsubscribe(id: Snowflake): void;
    sendTyping(roomId: Snowflake): void;
    private _handle;
    private _eventName;
}
//# sourceMappingURL=index.d.ts.map