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
    ws = null;
    sessionId = null;
    user = null;
    _closed = false;
    constructor(opts) {
        super();
        this.url = opts.url;
        this.token = opts.token;
        this.tokenType = opts.tokenType ?? 'Bot';
        this.reconnectDelay = opts.reconnectDelay ?? 5000;
    }
    connect() {
        this._closed = false;
        const headers = {
            Authorization: `${this.tokenType} ${this.token}`,
        };
        this.ws = new ws_1.default(this.url, { headers });
        this.ws.on('open', () => {
            this.emit('debug', 'gateway open');
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
    disconnect() {
        this._closed = true;
        if (this.ws) {
            this.ws.close(1000);
            this.ws = null;
        }
    }
    send(op, d) {
        if (!this.ws || this.ws.readyState !== ws_1.default.OPEN)
            return;
        this.ws.send(JSON.stringify({ op, d }));
    }
    subscribe(id) {
        this.send(util_1.GatewayOp.Subscribe, { space_id: id });
    }
    unsubscribe(id) {
        this.send(util_1.GatewayOp.Unsubscribe, { space_id: id });
    }
    sendTyping(roomId) {
        this.send(util_1.GatewayOp.Send, { space_id: roomId, type: 'typing' });
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
                if (payload && typeof payload === 'object') {
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