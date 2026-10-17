"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gateway = void 0;
const node_events_1 = require("node:events");
const ws_1 = __importDefault(require("ws"));
const util_1 = require("@strafe-js/util");
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
class Gateway extends node_events_1.EventEmitter {
    url;
    token;
    authScheme;
    heartbeatIntervalMs;
    shouldReconnect;
    reconnectDelay;
    maxReconnectDelay;
    reconnectAttempts = 0;
    ws;
    hbTimer;
    reconnectTimer;
    /**
     * Creates a new {@link Gateway} client instance without opening the connection.
     * Call {@link Gateway.connect} to establish the WebSocket session.
     */
    constructor(opts) {
        super();
        this.url = opts.url;
        this.token = opts.token;
        this.authScheme = opts.authScheme ?? 'Bot';
        this.heartbeatIntervalMs = opts.heartbeatIntervalMs ?? 45_000;
        this.shouldReconnect = opts.reconnect ?? true;
        this.reconnectDelay = opts.reconnectDelay ?? 2_500;
        this.maxReconnectDelay = opts.maxReconnectDelay ?? 60_000;
    }
    /**
     * Opens (or re-opens) the WebSocket connection to `url` with the configured `Authorization` header
     * and starts the heartbeat timer once the socket opens.
     */
    connect() {
        this._clearTimers();
        if (this.ws) {
            this.ws.removeAllListeners();
            if (this.ws.readyState === ws_1.default.OPEN ||
                this.ws.readyState === ws_1.default.CONNECTING) {
                this.ws.terminate();
            }
            this.ws = undefined;
        }
        const headers = {};
        if (this.token) {
            headers['Authorization'] = this.authScheme
                ? `${this.authScheme} ${this.token}`
                : this.token;
        }
        const ws = new ws_1.default(this.url, { headers });
        this.ws = ws;
        ws.on('open', () => {
            this.reconnectAttempts = 0;
            this.emit('open');
            this._startHeartbeat();
        });
        ws.on('message', (raw) => {
            let frame;
            try {
                frame = JSON.parse(raw.toString());
            }
            catch (e) {
                this.emit('error', e);
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
    /**
     * Disables automatic reconnection, clears active heartbeat/reconnect timers,
     * and closes the WebSocket connection with code `1000` (`client disconnect`).
     */
    disconnect() {
        this.shouldReconnect = false;
        this._clearTimers();
        if (this.ws) {
            this.ws.removeAllListeners();
            this.ws.close(1000, 'client disconnect');
            this.ws = undefined;
        }
    }
    /**
     * Sends a heartbeat ping frame (`op: 6`) to the gateway.
     * The gateway responds with `op: 7`, triggering the `pong` event.
     */
    ping() {
        this.send(util_1.GatewayOp.Ping);
    }
    /**
     * Serializes and sends a raw gateway frame `{ op, d, ...extra }` if the socket is `OPEN`.
     * Silently drops the frame if the socket is not currently open.
     */
    send(op, d, extra) {
        if (!this.ws || this.ws.readyState !== ws_1.default.OPEN)
            return;
        const payload = JSON.stringify({ op, d, ...extra });
        this.ws.send(payload);
    }
    /**
     * Subscribes the session to real-time events for a space or room (`op: 1`, `{ space_id }`).
     */
    subscribe(spaceOrRoomId) {
        this.send(util_1.GatewayOp.Subscribe, { space_id: spaceOrRoomId });
    }
    /**
     * Unsubscribes the session from real-time events for a space or room (`op: 5`, `{ space_id }`).
     */
    unsubscribe(spaceOrRoomId) {
        this.send(util_1.GatewayOp.Unsubscribe, { space_id: spaceOrRoomId });
    }
    /**
     * Sends a real-time typing frame over the gateway (`op: 2`, `{ space_id: roomId, type: 'typing', room_id: roomId }`).
     */
    sendTyping(roomId) {
        this.send(util_1.GatewayOp.Send, { space_id: roomId, type: 'typing', room_id: roomId });
    }
    _startHeartbeat() {
        this._stopHeartbeat();
        this.hbTimer = setInterval(() => {
            this.ping();
        }, this.heartbeatIntervalMs);
        this.hbTimer.unref?.();
    }
    _stopHeartbeat() {
        if (this.hbTimer) {
            clearInterval(this.hbTimer);
            this.hbTimer = undefined;
        }
    }
    _scheduleReconnect() {
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        this.reconnectAttempts++;
        const exp = Math.pow(2, Math.min(this.reconnectAttempts - 1, 6));
        const jitter = Math.floor(Math.random() * 1000);
        const delay = Math.min(this.reconnectDelay * exp + jitter, this.maxReconnectDelay);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            if (this.shouldReconnect)
                this.connect();
        }, delay);
    }
    _clearTimers() {
        this._stopHeartbeat();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }
    _handle(frame) {
        switch (frame.op) {
            case util_1.GatewayOp.Ready:
                this.emit('ready', frame.d);
                break;
            case util_1.GatewayOp.Pong:
                this.emit('pong');
                break;
            case util_1.GatewayOp.Error:
                this.emit('error', new Error(typeof frame.d === 'object' && frame.d && 'message' in frame.d
                    ? String(frame.d.message)
                    : 'Gateway error'));
                break;
            case util_1.GatewayOp.Event: {
                // Support both official nested envelope ({ op: 3, d: { t, space_id, room_id, d } })
                // and flat envelope ({ op: 3, t, space_id, room_id, d })
                const rawD = frame.d;
                const isNestedEnvelope = !frame.t &&
                    rawD !== null &&
                    typeof rawD === 'object' &&
                    typeof rawD.t === 'string';
                const eventType = isNestedEnvelope ? rawD.t : frame.t;
                const roomId = isNestedEnvelope
                    ? rawD.room_id
                    : frame.room_id;
                const spaceId = isNestedEnvelope
                    ? rawD.space_id
                    : frame.space_id;
                const innerPayload = isNestedEnvelope ? rawD.d : frame.d;
                if (innerPayload && typeof innerPayload === 'object') {
                    const obj = innerPayload;
                    if (roomId && obj.room_id === undefined)
                        obj.room_id = roomId;
                    if (spaceId && obj.space_id === undefined)
                        obj.space_id = spaceId;
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
    _eventName(t) {
        return t
            .toLowerCase()
            .replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    }
}
exports.Gateway = Gateway;
//# sourceMappingURL=index.js.map