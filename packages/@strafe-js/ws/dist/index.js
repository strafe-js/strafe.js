"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gateway = void 0;
const ws_1 = __importDefault(require("ws"));
const node_events_1 = require("node:events");
const util_1 = require("@strafe-js/util");
class Gateway extends node_events_1.EventEmitter {
    url;
    token;
    tokenType;
    reconnectDelay;
    maxReconnectDelay;
    heartbeatIntervalMs;
    ws = null;
    sessionId = null;
    user = null;
    _closed = false;
    _reconnectAttempts = 0;
    _reconnectTimer = null;
    _heartbeatTimer = null;
    constructor(opts) {
        super();
        this.url = opts.url;
        this.token = opts.token;
        this.tokenType = opts.tokenType ?? 'Bot';
        this.reconnectDelay = opts.reconnectDelay ?? 1000;
        this.maxReconnectDelay = opts.maxReconnectDelay ?? 30000;
        this.heartbeatIntervalMs = opts.heartbeatInterval ?? 45000;
    }
    connect() {
        this._closed = false;
        this._clearTimers();
        if (this.ws) {
            try {
                this.ws.removeAllListeners();
                this.ws.close();
            }
            catch {
                /* ignore */
            }
            this.ws = null;
        }
        const headers = {
            Authorization: `${this.tokenType} ${this.token}`,
        };
        try {
            this.ws = new ws_1.default(this.url, { headers });
        }
        catch (err) {
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
            let frame;
            try {
                frame = JSON.parse(raw.toString());
            }
            catch {
                this.emit('error', new util_1.StrafeError('invalid gateway frame'));
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
    disconnect() {
        this._closed = true;
        this._clearTimers();
        if (this.ws) {
            try {
                this.ws.close(1000);
            }
            catch {
                /* ignore */
            }
            this.ws = null;
        }
    }
    ping() {
        this.send(util_1.GatewayOp.Ping);
    }
    send(op, d) {
        if (!this.ws || this.ws.readyState !== ws_1.default.OPEN)
            return;
        try {
            this.ws.send(JSON.stringify({ op, d }));
        }
        catch (err) {
            this.emit('error', err instanceof Error ? err : new Error(String(err)));
        }
    }
    subscribe(id) {
        this.send(util_1.GatewayOp.Subscribe, { space_id: id });
    }
    unsubscribe(id) {
        this.send(util_1.GatewayOp.Unsubscribe, { space_id: id });
    }
    sendTyping(roomId) {
        this.send(util_1.GatewayOp.Send, { room_id: roomId, type: 'typing' });
    }
    _startHeartbeat() {
        this._stopHeartbeat();
        if (this.heartbeatIntervalMs > 0) {
            this._heartbeatTimer = setInterval(() => {
                this.ping();
            }, this.heartbeatIntervalMs);
        }
    }
    _stopHeartbeat() {
        if (this._heartbeatTimer) {
            clearInterval(this._heartbeatTimer);
            this._heartbeatTimer = null;
        }
    }
    _scheduleReconnect() {
        if (this._closed || this._reconnectTimer)
            return;
        this._reconnectAttempts++;
        // Exponential backoff with jitter
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this._reconnectAttempts - 1) + Math.random() * 1000, this.maxReconnectDelay);
        this.emit('debug', `scheduling reconnect in ${Math.round(delay)}ms (attempt ${this._reconnectAttempts})`);
        this._reconnectTimer = setTimeout(() => {
            this._reconnectTimer = null;
            if (!this._closed) {
                this.connect();
            }
        }, delay);
    }
    _clearTimers() {
        this._stopHeartbeat();
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = null;
        }
    }
    _handle(frame) {
        switch (frame.op) {
            case util_1.GatewayOp.Ready: {
                const d = frame.d;
                this.user = d.user;
                this.sessionId = d.session_id;
                this.emit('ready', d);
                break;
            }
            case util_1.GatewayOp.Event: {
                const envelope = frame.d;
                const t = envelope.t;
                const payload = envelope.d;
                if (payload && typeof payload === 'object' && payload !== null) {
                    const p = payload;
                    if (envelope.room_id && p.room_id == null)
                        p.room_id = envelope.room_id;
                    if (envelope.space_id && p.space_id == null)
                        p.space_id = envelope.space_id;
                }
                this.emit('raw', envelope);
                this.emit(this._eventName(t), payload, envelope);
                break;
            }
            case util_1.GatewayOp.Error: {
                const err = frame.d;
                this.emit('error', new util_1.StrafeError(err?.message || 'gateway error', 0, err?.code ?? null));
                break;
            }
            case util_1.GatewayOp.Pong:
                this.emit('pong');
                break;
            default:
                this.emit('debug', `unknown op ${frame.op}`);
        }
    }
    _eventName(t) {
        return t
            .toLowerCase()
            .split('_')
            .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
            .join('');
    }
}
exports.Gateway = Gateway;
//# sourceMappingURL=index.js.map