import { EventEmitter } from 'node:events';
import WebSocket from 'ws';
import {
  GatewayFrame,
  GatewayOp,
  Message,
  PermissionOverride,
  ReadyPayload,
  Role,
  Room,
  Snowflake,
  Space,
  SpaceMember,
  User,
} from '@strafe-js/util';

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
  messageDelete: (data: { id?: Snowflake; message_id?: Snowflake; room_id: Snowflake; space_id?: Snowflake }) => void;
  messageReactionAdd: (data: { room_id: Snowflake; message_id: Snowflake; user_id: Snowflake; emoji: string }) => void;
  messageReactionRemove: (data: { room_id: Snowflake; message_id: Snowflake; user_id: Snowflake; emoji: string }) => void;
  roomPinsUpdate: (data: { room_id: Snowflake; message_id: Snowflake; user_id: Snowflake; pinned: boolean; pinned_at?: string; last_pin_timestamp?: string | null }) => void;
  typingStart: (data: { room_id: Snowflake; user_id: Snowflake; timestamp: number }) => void;
  spaceCreate: (space: Space) => void;
  spaceUpdate: (space: Space) => void;
  spaceDelete: (data: { id?: Snowflake; space_id?: Snowflake }) => void;
  spaceLeave: (data: { space_id: Snowflake }) => void;
  roomCreate: (room: Room) => void;
  roomUpdate: (room: Room) => void;
  roomDelete: (data: { id?: Snowflake; room_id?: Snowflake; space_id?: Snowflake }) => void;
  spaceRoomCreate: (room: Room) => void;
  spaceRoomUpdate: (room: Room) => void;
  spaceRoomDelete: (data: { space_id: Snowflake; room_id: Snowflake }) => void;
  threadCreate: (thread: Room & { newly_created?: boolean; joined?: boolean }) => void;
  threadUpdate: (thread: Room) => void;
  threadDelete: (data: { space_id: Snowflake; room_id: Snowflake; parent_id?: Snowflake }) => void;
  threadMembersUpdate: (data: {
    room_id: Snowflake;
    added_members?: { user_id: Snowflake; joined_at: string }[];
    removed_member_ids?: Snowflake[];
    member_count?: number;
  }) => void;
  threadMemberUpdate: (data: { room_id: Snowflake; joined: boolean }) => void;
  spaceRoomOverrideUpdate: (data: PermissionOverride & { room_id?: Snowflake; space_id?: Snowflake }) => void;
  spaceRoomOverrideDelete: (data: { role_id: Snowflake; room_id?: Snowflake; space_id?: Snowflake }) => void;
  spaceRoomUserOverrideUpdate: (data: PermissionOverride & { room_id?: Snowflake; space_id?: Snowflake }) => void;
  spaceRoomUserOverrideDelete: (data: { user_id: Snowflake; room_id?: Snowflake; space_id?: Snowflake }) => void;
  roomLeave: (data: { room_id: Snowflake }) => void;
  messageAck: (data: { room_id: Snowflake; message_id: Snowflake }) => void;
  messageMentionUpdate: (data: Record<string, unknown>) => void;
  roomNotifySettingsUpdate: (data: Record<string, unknown>) => void;
  spaceMemberAdd: (member: SpaceMember & { space_id?: Snowflake }) => void;
  spaceMemberUpdate: (member: Partial<SpaceMember> & { user_id: Snowflake; space_id?: Snowflake }) => void;
  spaceMemberRemove: (data: { user_id?: Snowflake; space_id?: Snowflake }) => void;
  spaceMembersChunk: (data: { space_id?: Snowflake; members?: SpaceMember[] }) => void;
  spaceRoleCreate: (role: Role & { space_id?: Snowflake }) => void;
  spaceRoleUpdate: (role: Role & { space_id?: Snowflake }) => void;
  spaceRoleDelete: (data: { role_id: Snowflake; space_id?: Snowflake }) => void;
  presenceUpdate: (data: { user_id: Snowflake; status?: string; presence?: { status: string } }) => void;
  userUpdate: (data: Partial<User> & { user_id: Snowflake }) => void;
  sessionRevoked: (data: { reason?: string }) => void;
}

export declare interface Gateway {
  on<E extends keyof GatewayEvents>(event: E, listener: GatewayEvents[E]): this;
  on(event: string, listener: (...args: any[]) => void): this;
  once<E extends keyof GatewayEvents>(event: E, listener: GatewayEvents[E]): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit<E extends keyof GatewayEvents>(event: E, ...args: Parameters<GatewayEvents[E]>): boolean;
  emit(event: string, ...args: any[]): boolean;
}

export class Gateway extends EventEmitter {
  private url: string;
  private token: string;
  private authScheme: string;
  private heartbeatIntervalMs: number;
  private shouldReconnect: boolean;
  private reconnectDelay: number;
  private maxReconnectDelay: number;
  private reconnectAttempts = 0;
  private sendTokens = 20;
  private sendTokenUpdatedAt = Date.now();
  private sendQueue: Promise<void> = Promise.resolve();
  private ws?: WebSocket;
  private hbTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(opts: GatewayOptions) {
    super();
    this.url = opts.url;
    this.token = opts.token;
    this.authScheme = opts.authScheme ?? 'Bot';
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs ?? 45_000;
    this.shouldReconnect = opts.reconnect ?? true;
    this.reconnectDelay = opts.reconnectDelay ?? 2_500;
    this.maxReconnectDelay = opts.maxReconnectDelay ?? 60_000;
  }

  connect(): void {
    this._clearTimers();
    if (this.ws) {
      this.ws.removeAllListeners();
      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.terminate();
      }
      this.ws = undefined;
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = this.authScheme
        ? `${this.authScheme} ${this.token}`
        : this.token;
    }
    const ws = new WebSocket(this.url, { headers });
    this.ws = ws;

    ws.on('open', () => {
      this.reconnectAttempts = 0;
      this.emit('open');
      this._startHeartbeat();
    });

    ws.on('message', (raw: WebSocket.RawData) => {
      let frame: GatewayFrame;
      try {
        frame = JSON.parse(raw.toString());
      } catch (e) {
        this.emit('error', e as Error);
        return;
      }
      this._handle(frame);
    });

    ws.on('close', (code, reason) => {
      this._stopHeartbeat();
      this.emit('close', code, reason.toString());
      if (this.shouldReconnect) {
        this._scheduleReconnect();
      }
    });

    ws.on('error', (err) => {
      this.emit('error', err);
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this._clearTimers();
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close(1000, 'client disconnect');
      this.ws = undefined;
    }
  }

  ping(): void {
    this.send(GatewayOp.Ping);
  }

  send(op: number, d?: unknown, extra?: Partial<GatewayFrame>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const payload = JSON.stringify({ op, d, ...extra });
    // Token-bucket for gateway Send (op 2 / typing): burst 20, refill 1/250ms
    if (op === GatewayOp.Send) {
      const run = async () => {
        await this._takeSendToken();
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(payload);
      };
      this.sendQueue = this.sendQueue.then(run).catch(() => {});
      return;
    }
    this.ws.send(payload);
  }

  private async _takeSendToken(): Promise<void> {
    while (true) {
      const now = Date.now();
      const elapsed = now - this.sendTokenUpdatedAt;
      this.sendTokens = Math.min(20, this.sendTokens + elapsed / 250);
      this.sendTokenUpdatedAt = now;
      if (this.sendTokens >= 1) {
        this.sendTokens -= 1;
        return;
      }
      await new Promise((r) => setTimeout(r, (1 - this.sendTokens) * 250));
    }
  }

  subscribe(spaceOrRoomId: Snowflake): void {
    this.send(GatewayOp.Subscribe, { space_id: spaceOrRoomId });
  }

  unsubscribe(spaceOrRoomId: Snowflake): void {
    this.send(GatewayOp.Unsubscribe, { space_id: spaceOrRoomId });
  }

  sendTyping(roomId: Snowflake): void {
    this.send(GatewayOp.Send, { space_id: roomId, type: 'typing', room_id: roomId });
  }

  setActivity(
    activity: { type?: 'playing'; name: string; started_at?: number } | null,
  ): void {
    if (activity === null) {
      this.send(GatewayOp.Activity, null);
      return;
    }
    this.send(GatewayOp.Activity, {
      activities: [
        {
          type: activity.type ?? 'playing',
          name: activity.name,
          started_at: activity.started_at,
        },
      ],
    });
  }

  clearActivity(): void {
    this.setActivity(null);
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat();
    this.hbTimer = setInterval(() => {
      this.ping();
    }, this.heartbeatIntervalMs);
    this.hbTimer.unref?.();
  }

  private _stopHeartbeat(): void {
    if (this.hbTimer) {
      clearInterval(this.hbTimer);
      this.hbTimer = undefined;
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts++;
    const exp = Math.pow(2, Math.min(this.reconnectAttempts - 1, 6));
    const jitter = Math.floor(Math.random() * 1000);
    const delay = Math.min(
      this.reconnectDelay * exp + jitter,
      this.maxReconnectDelay,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      if (this.shouldReconnect) this.connect();
    }, delay);
  }

  private _clearTimers(): void {
    this._stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private _handle(frame: GatewayFrame): void {
    switch (frame.op) {
      case GatewayOp.Ready:
        this.emit('ready', frame.d as ReadyPayload);
        break;
      case GatewayOp.Pong:
        this.emit('pong');
        break;
      case GatewayOp.Error:
        this.emit(
          'error',
          new Error(
            typeof frame.d === 'object' && frame.d && 'message' in frame.d
              ? String((frame.d as { message: unknown }).message)
              : 'Gateway error',
          ),
        );
        break;
      case GatewayOp.Event: {
        const rawD = frame.d as Record<string, unknown> | undefined;
        const isNestedEnvelope =
          !frame.t &&
          rawD !== null &&
          typeof rawD === 'object' &&
          typeof rawD.t === 'string';

        const eventType = isNestedEnvelope ? (rawD.t as string) : frame.t;
        const roomId = isNestedEnvelope
          ? (rawD.room_id as Snowflake | undefined)
          : frame.room_id;
        const spaceId = isNestedEnvelope
          ? (rawD.space_id as Snowflake | undefined)
          : frame.space_id;
        const innerPayload = isNestedEnvelope ? rawD.d : frame.d;

        if (innerPayload && typeof innerPayload === 'object') {
          const obj = innerPayload as Record<string, unknown>;
          if (roomId && obj.room_id === undefined) obj.room_id = roomId;
          if (spaceId && obj.space_id === undefined) obj.space_id = spaceId;
        }
        this.emit('raw', frame);
        if (eventType) {
          if (eventType === 'SESSION_REVOKED') {
            this.shouldReconnect = false;
          }
          this.emit(this._eventName(eventType), innerPayload, frame);
        }
        break;
      }
      default:
        this.emit('raw', frame);
    }
  }

  private _eventName(t: string): string {
    return t
      .toLowerCase()
      .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  }
}
