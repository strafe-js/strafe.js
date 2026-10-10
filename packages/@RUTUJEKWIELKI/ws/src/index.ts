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
} from '@RUTUJEKWIELKI/util';

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

export class Gateway extends EventEmitter {
  url: string;
  token: string;
  tokenType: 'Bot' | 'Bearer';
  reconnectDelay: number;
  ws: WebSocket | null = null;
  sessionId: string | null = null;
  user: User | null = null;
  private _closed = false;

  constructor(opts: GatewayOptions) {
    super();
    this.url = opts.url;
    this.token = opts.token;
    this.tokenType = opts.tokenType ?? 'Bot';
    this.reconnectDelay = opts.reconnectDelay ?? 5000;
  }

  connect(): void {
    this._closed = false;
    const headers = {
      Authorization: `${this.tokenType} ${this.token}`,
    };

    this.ws = new WebSocket(this.url, { headers });

    this.ws.on('open', () => {
      this.emit('debug', 'gateway open');
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
      this.ws = null;
      if (!this._closed) {
        this.emit('disconnect', code);
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    });

    this.ws.on('error', (err) => {
      this.emit('error', err);
    });
  }

  disconnect(): void {
    this._closed = true;
    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }
  }

  send(op: number, d?: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ op, d }));
  }

  subscribe(id: Snowflake): void {
    this.send(GatewayOp.Subscribe, { space_id: id });
  }

  unsubscribe(id: Snowflake): void {
    this.send(GatewayOp.Unsubscribe, { space_id: id });
  }

  sendTyping(roomId: Snowflake): void {
    this.send(GatewayOp.Send, { space_id: roomId, type: 'typing' });
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
        if (payload && typeof payload === 'object') {
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
