"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REST = void 0;
const util_1 = require("@strafe-js/util");
class REST {
    apiBase;
    token;
    tokenType;
    retries;
    constructor(opts) {
        this.apiBase = opts.apiBase.replace(/\/$/, '');
        this.token = opts.token ?? null;
        this.tokenType = opts.tokenType ?? 'Bot';
        this.retries = opts.retries ?? 3;
    }
    setToken(token, type = 'Bot') {
        this.token = token;
        this.tokenType = type;
    }
    async request(method, path, opts = {}) {
        const url = new URL(`${this.apiBase}${path.startsWith('/') ? path : `/${path}`}`);
        if (opts.query) {
            for (const [k, v] of Object.entries(opts.query)) {
                if (v != null)
                    url.searchParams.set(k, String(v));
            }
        }
        const headers = { ...(opts.headers ?? {}) };
        if (this.token)
            headers['Authorization'] = `${this.tokenType} ${this.token}`;
        let payload;
        if (opts.body !== undefined && opts.body !== null) {
            if (typeof FormData !== 'undefined' && opts.body instanceof FormData) {
                payload = opts.body;
            }
            else {
                headers['Content-Type'] = 'application/json';
                payload = JSON.stringify(opts.body);
            }
        }
        let attempt = 0;
        while (true) {
            const res = await fetch(url, { method, headers, body: payload });
            if (res.status === 429) {
                const retryAfterHeader = Number(res.headers.get('Retry-After') || 1);
                let bodyJson = null;
                try {
                    bodyJson = (await res.json());
                }
                catch {
                    /* ignore */
                }
                const wait = bodyJson?.retry_after ?? retryAfterHeader;
                if (attempt >= this.retries) {
                    throw new util_1.RateLimitError(bodyJson?.error || 'rate limited', wait);
                }
                await (0, util_1.sleep)(wait * 1000);
                attempt++;
                continue;
            }
            if (res.status === 204)
                return null;
            const text = await res.text();
            let data = null;
            if (text) {
                try {
                    data = JSON.parse(text);
                }
                catch {
                    data = text;
                }
            }
            if (!res.ok) {
                const msg = data && typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error)
                    : `HTTP ${res.status}`;
                const code = data && typeof data === 'object' && data !== null && 'code' in data
                    ? data.code
                    : null;
                throw new util_1.StrafeError(msg, res.status, code, data);
            }
            return data;
        }
    }
    get(path, opts) {
        return this.request('GET', path, opts);
    }
    post(path, opts) {
        return this.request('POST', path, opts);
    }
    patch(path, opts) {
        return this.request('PATCH', path, opts);
    }
    put(path, opts) {
        return this.request('PUT', path, opts);
    }
    delete(path, opts) {
        return this.request('DELETE', path, opts);
    }
    getMe() {
        return this.get('/users/@me');
    }
    getMySpaces() {
        return this.get('/users/@me/spaces');
    }
    getSpaces() {
        return this.get('/spaces');
    }
    getSpace(id) {
        return this.get(`/spaces/${id}`);
    }
    getSpaceRooms(spaceId) {
        return this.get(`/spaces/${spaceId}/rooms`);
    }
    getSpaceMembers(spaceId) {
        return this.get(`/spaces/${spaceId}/members`);
    }
    createMessage(roomId, body) {
        return this.post(`/rooms/${roomId}/messages`, { body });
    }
    editMessage(roomId, messageId, body) {
        return this.patch(`/rooms/${roomId}/messages/${messageId}`, { body });
    }
    deleteMessage(roomId, messageId) {
        return this.delete(`/rooms/${roomId}/messages/${messageId}`);
    }
    listMessages(roomId, params = {}) {
        return this.get(`/rooms/${roomId}/messages`, { query: params });
    }
    getMessage(roomId, messageId) {
        return this.get(`/rooms/${roomId}/messages/${messageId}`);
    }
    triggerTyping(roomId) {
        return this.post(`/rooms/${roomId}/typing`);
    }
    addReaction(roomId, messageId, emoji) {
        return this.put(`/rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
    }
    removeReaction(roomId, messageId, emoji) {
        return this.delete(`/rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
    }
    createInvite(spaceId, opts = {}) {
        return this.post(`/spaces/${spaceId}/invites`, { body: opts });
    }
    kickMember(spaceId, userId) {
        return this.delete(`/spaces/${spaceId}/members/${userId}`);
    }
    banMember(spaceId, userId, reason) {
        return this.post(`/spaces/${spaceId}/bans/${userId}`, {
            body: reason ? { reason } : {},
        });
    }
    async uploadAttachment(roomId, file, opts = {}) {
        const form = new FormData();
        const blob = file instanceof Blob
            ? file
            : new Blob([file]);
        form.append('file', blob, opts.filename ?? 'upload');
        if (opts.width != null)
            form.append('width', String(opts.width));
        if (opts.height != null)
            form.append('height', String(opts.height));
        return this.post(`/rooms/${roomId}/attachments`, { body: form });
    }
}
exports.REST = REST;
//# sourceMappingURL=index.js.map