import WebSocket from 'ws';
import { EventEmitter } from 'node:events';
import {
  GatewayOp,
  StrafeError,
  type GatewayFrame,
  type GatewayEventEnvelope,
  type ReadyPayload,
  type User,
  type Snowflake,
} from '@strafe-js/util';

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

export class Gateway extends EventEmitter {
  url: string;
  token: string;
  tokenType: 'Bot' | 'Bearer';
  reconnectDelay: number;
  maxReconnectDelay: number;
  heartbeatIntervalMs: number;
  ws: WebSocket | null = null;
  sessionId: string | null = null;
  user: User | null = null;

  private _closed = false;
  private _reconnectAttempts = 0;
  private _reconnectTimer: NodeJS.Timeout | null = null;
  private _heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(opts: GatewayOptions) {
    super();
    this.url = opts.url;
    this.token = opts.token;
    this.tokenType = opts.tokenType ?? 'Bot';
    this.reconnectDelay = opts.reconnectDelay ?? 1000;
    this.maxReconnectDelay = opts.maxReconnectDelay ?? 30000;
    this.heartbeatIntervalMs = opts.heartbeatInterval ?? 45000;
  }

  connect(): void {
    this._closed = false;
    this._clearTimers();

    if (this.ws) {
      try {
        this.ws.removeAllListeners();
        this.ws.close();
      } catch {
        /* ignore */
      }
      this.ws = null;
    }

    const headers = {
      Authorization: `${this.tokenType} ${this.token}`,
    };

    try {
      this.ws = new WebSocket(this.url, { headers });
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
      this._scheduleReconnect();
      return;
    }

    this.ws.on('open', () => {
      this._reconnectAttempts = 0;
      this.emit('debug', 'gateway open');
      this._startHeartbeat();
    });

    this.ws.on('message', (raw) => {
      let frame: GatewayFrame;
      try {
        frame = JSON.parse(raw.toString()) as GatewayFrame;
      } catch {
        this.emit('error', new StrafeError('invalid gateway frame'));
        return;
      }
      this._handle(frame);
    });

    this.ws.on('close', (code, reason) => {
      this.emit('debug', `gateway close ${code} ${reason.toString()}`);
      this._stopHeartbeat();
      this.ws = null;
      if (!this._closed) {
        this.emit('disconnect', code);
        this._scheduleReconnect();
      }
    });

    this.ws.on('error', (err) => {
      this.emit('error', err);
    });
  }

  disconnect(): void {
    this._closed = true;
    this._clearTimers();
    if (this.ws) {
      try {
        this.ws.close(1000);
      } catch {
        /* ignore */
      }
      this.ws = null;
    }
  }

  ping(): void {
    this.send(GatewayOp.Ping);
  }

  send(op: number, d?: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify({ op, d }));
    } catch (err) {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
    }
  }

  subscribe(id: Snowflake): void {
    this.send(GatewayOp.Subscribe, { space_id: id });
  }

  unsubscribe(id: Snowflake): void {
    this.send(GatewayOp.Unsubscribe, { space_id: id });
  }

  sendTyping(roomId: Snowflake): void {
    this.send(GatewayOp.Send, { room_id: roomId, type: 'typing' });
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat();
    if (this.heartbeatIntervalMs > 0) {
      this._heartbeatTimer = setInterval(() => {
        this.ping();
      }, this.heartbeatIntervalMs);
    }
  }

  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  private _scheduleReconnect(): void {
    if (this._closed || this._reconnectTimer) return;
    this._reconnectAttempts++;
    // Exponential backoff with jitter
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this._reconnectAttempts - 1) + Math.random() * 1000,
      this.maxReconnectDelay,
    );
    this.emit('debug', `scheduling reconnect in ${Math.round(delay)}ms (attempt ${this._reconnectAttempts})`);
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (!this._closed) {
        this.connect();
      }
    }, delay);
  }

  private _clearTimers(): void {
    this._stopHeartbeat();
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
  }

  private _handle(frame: GatewayFrame): void {
    switch (frame.op) {
      case GatewayOp.Ready: {
        const d = frame.d as ReadyPayload;
        this.user = d.user;
        this.sessionId = d.session_id;
        this.emit('ready', d);
        break;
      }
      case GatewayOp.Event: {
        const envelope = frame.d as GatewayEventEnvelope;
        const t = envelope.t;
        const payload = envelope.d as Record<string, unknown> | unknown;
        if (payload && typeof payload === 'object' && payload !== null) {
          const p = payload as Record<string, unknown>;
          if (envelope.room_id && p.room_id == null) p.room_id = envelope.room_id;
          if (envelope.space_id && p.space_id == null) p.space_id = envelope.space_id;
        }
        this.emit('raw', envelope);
        this.emit(this._eventName(t), payload, envelope);
        break;
      }
      case GatewayOp.Error: {
        const err = frame.d as { code?: number; message?: string };
        this.emit('error', new StrafeError(err?.message || 'gateway error', 0, err?.code ?? null));
        break;
      }
      case GatewayOp.Pong:
        this.emit('pong');
        break;
      default:
        this.emit('debug', `unknown op ${frame.op}`);
    }
  }

  private _eventName(t: string): string {
    return t
      .toLowerCase()
      .split('_')
      .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
      .join('');
  }
}
