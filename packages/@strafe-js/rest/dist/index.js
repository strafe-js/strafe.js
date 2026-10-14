"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REST = void 0;
const util_1 = require("@strafe-js/util");
class REST {
    baseUrl;
    token;
    authScheme;
    retries;
    userAgent;
    constructor(opts) {
        this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
        this.token = opts.token;
        this.authScheme = opts.authScheme ?? 'Bot';
        this.retries = opts.retries ?? 3;
        this.userAgent = opts.userAgent ?? 'strafebot-js/1.1';
    }
    setToken(token) {
        this.token = token;
        return this;
    }
    async request(opts) {
        const cleanBase = this.baseUrl.replace(/\/+$/, '');
        const cleanPath = opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
        const url = new URL(`${cleanBase}${cleanPath}`);
        if (opts.query) {
            for (const [k, v] of Object.entries(opts.query)) {
                if (v !== undefined)
                    url.searchParams.set(k, String(v));
            }
        }
        const headers = {
            'User-Agent': this.userAgent,
            Accept: 'application/json',
            ...(opts.headers ?? {}),
        };
        if (this.token)
            headers['Authorization'] = `${this.authScheme} ${this.token}`;
        const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
        let body;
        if (opts.body !== undefined) {
            if (isFormData) {
                body = opts.body;
            }
            else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(opts.body);
            }
        }
        for (let attempt = 0; attempt <= this.retries; attempt++) {
            const res = await fetch(url, { method: opts.method, headers, body });
            if (res.status === 204)
                return undefined;
            const text = await res.text();
            let data = undefined;
            if (text) {
                try {
                    data = JSON.parse(text);
                }
                catch {
                    data = text;
                }
            }
            if (res.status === 429) {
                const retryHeader = Number(res.headers.get('retry-after'));
                const retryBody = typeof data === 'object' && data && 'retry_after' in data
                    ? Number(data.retry_after)
                    : NaN;
                const waitSec = !Number.isNaN(retryBody)
                    ? retryBody
                    : !Number.isNaN(retryHeader)
                        ? retryHeader
                        : 1;
                if (attempt < this.retries) {
                    await (0, util_1.sleep)(waitSec * 1000);
                    continue;
                }
                throw new util_1.RateLimitError(waitSec, data);
            }
            if (!res.ok) {
                const msg = typeof data === 'object' && data && 'error' in data
                    ? String(data.error)
                    : `HTTP ${res.status} ${res.statusText}`;
                const code = typeof data === 'object' && data && 'code' in data
                    ? String(data.code)
                    : undefined;
                throw new util_1.StrafeError(msg, res.status, code, data);
            }
            return data;
        }
        throw new util_1.StrafeError('Exhausted retries', 500);
    }
    get(path, query) {
        return this.request({ method: 'GET', path, query });
    }
    post(path, body) {
        return this.request({ method: 'POST', path, body });
    }
    patch(path, body) {
        return this.request({ method: 'PATCH', path, body });
    }
    put(path, body) {
        return this.request({ method: 'PUT', path, body });
    }
    delete(path, body) {
        return this.request({ method: 'DELETE', path, body });
    }
    // ---- Users ----
    getMe() {
        return this.get('/users/@me');
    }
    updateProfile(body) {
        return this.patch('/users/@me', body);
    }
    getMySpaces() {
        return this.get('/users/@me/spaces');
    }
    getSpaces() {
        return this.get('/spaces');
    }
    // ---- Spaces & Rooms ----
    getSpace(spaceId) {
        return this.get(`/spaces/${spaceId}`);
    }
    editSpace(spaceId, body) {
        return this.patch(`/spaces/${spaceId}`, body);
    }
    leaveSpace(spaceId) {
        return this.post(`/spaces/${spaceId}/leave`);
    }
    getAuditLog(spaceId, params) {
        return this.get(`/spaces/${spaceId}/audit-log`, params);
    }
    getSpaceRooms(spaceId) {
        return this.get(`/spaces/${spaceId}/rooms`);
    }
    createRoom(spaceId, body) {
        return this.post(`/spaces/${spaceId}/rooms`, body);
    }
    editRoom(spaceId, roomId, body) {
        return this.patch(`/spaces/${spaceId}/rooms/${roomId}`, body);
    }
    deleteRoom(spaceId, roomId) {
        return this.delete(`/spaces/${spaceId}/rooms/${roomId}`);
    }
    getRoom(roomId) {
        return this.get(`/rooms/${roomId}`);
    }
    getPMRooms() {
        return this.get('/rooms');
    }
    openPM(body) {
        return this.post('/rooms', body);
    }
    ackRoom(roomId, messageId) {
        return this.post(`/rooms/${roomId}/ack`, { message_id: messageId });
    }
    // ---- Members, Roles & Bans ----
    getSpaceMembers(spaceId) {
        return this.get(`/spaces/${spaceId}/members`);
    }
    getSpaceMember(spaceId, userId) {
        return this.get(`/spaces/${spaceId}/members/${userId}`);
    }
    setMemberRoles(spaceId, userId, roleIds) {
        return this.put(`/spaces/${spaceId}/members/${userId}/roles`, { role_ids: roleIds });
    }
    kickMember(spaceId, userId) {
        return this.delete(`/spaces/${spaceId}/members/${userId}`);
    }
    banMember(spaceId, userId, reason) {
        return this.post(`/spaces/${spaceId}/bans/${userId}`, reason ? { reason } : {});
    }
    unbanMember(spaceId, userId) {
        return this.delete(`/spaces/${spaceId}/bans/${userId}`);
    }
    getSpaceBans(spaceId) {
        return this.get(`/spaces/${spaceId}/bans`);
    }
    getSpaceRoles(spaceId) {
        return this.get(`/spaces/${spaceId}/roles`);
    }
    createRole(spaceId, body) {
        return this.post(`/spaces/${spaceId}/roles`, body);
    }
    editRole(spaceId, roleId, body) {
        return this.patch(`/spaces/${spaceId}/roles/${roleId}`, body);
    }
    deleteRole(spaceId, roleId) {
        return this.delete(`/spaces/${spaceId}/roles/${roleId}`);
    }
    // ---- Messages, Pins & Reactions ----
    createMessage(roomId, body) {
        const payload = typeof body === 'string' ? { plaintext: body } : body;
        return this.post(`/rooms/${roomId}/messages`, payload);
    }
    editMessage(roomId, messageId, body) {
        const payload = typeof body === 'string' ? { plaintext: body } : body;
        return this.patch(`/rooms/${roomId}/messages/${messageId}`, payload);
    }
    deleteMessage(roomId, messageId) {
        return this.delete(`/rooms/${roomId}/messages/${messageId}`);
    }
    listMessages(roomId, params) {
        return this.get(`/rooms/${roomId}/messages`, params);
    }
    getMessage(roomId, messageId) {
        return this.get(`/rooms/${roomId}/messages/${messageId}`);
    }
    searchRoomMessages(roomId, params) {
        return this.get(`/rooms/${roomId}/messages/search`, params);
    }
    searchSpaceMessages(spaceId, params) {
        return this.get(`/spaces/${spaceId}/messages/search`, params);
    }
    triggerTyping(roomId) {
        return this.post(`/rooms/${roomId}/typing`);
    }
    addReaction(roomId, messageId, emoji) {
        const enc = encodeURIComponent(emoji);
        return this.put(`/rooms/${roomId}/messages/${messageId}/reactions/${enc}`);
    }
    removeReaction(roomId, messageId, emoji, userId) {
        const enc = encodeURIComponent(emoji);
        const suffix = userId && userId !== '@me' ? `/${userId}` : '';
        return this.delete(`/rooms/${roomId}/messages/${messageId}/reactions/${enc}${suffix}`);
    }
    getReactions(roomId, messageId, emoji) {
        const enc = encodeURIComponent(emoji);
        return this.get(`/rooms/${roomId}/messages/${messageId}/reactions/${enc}`);
    }
    pinMessage(roomId, messageId) {
        return this.put(`/rooms/${roomId}/messages/${messageId}/pin`);
    }
    unpinMessage(roomId, messageId) {
        return this.delete(`/rooms/${roomId}/messages/${messageId}/pin`);
    }
    getPinnedMessages(roomId) {
        return this.get(`/rooms/${roomId}/pins`);
    }
    // ---- Threads ----
    createThreadFromMessage(roomId, messageId, body) {
        return this.post(`/rooms/${roomId}/messages/${messageId}/threads`, body);
    }
    createThread(roomId, body) {
        return this.post(`/rooms/${roomId}/threads`, body);
    }
    getThread(threadId) {
        return this.get(`/rooms/${threadId}/thread`);
    }
    editThread(threadId, body) {
        return this.patch(`/rooms/${threadId}/thread`, body);
    }
    deleteThread(threadId) {
        return this.delete(`/rooms/${threadId}/thread`);
    }
    getThreadMembers(threadId) {
        return this.get(`/rooms/${threadId}/thread-members`);
    }
    joinThread(threadId) {
        return this.put(`/rooms/${threadId}/thread-members/@me`);
    }
    leaveThread(threadId) {
        return this.delete(`/rooms/${threadId}/thread-members/@me`);
    }
    addThreadMember(threadId, userId) {
        return this.put(`/rooms/${threadId}/thread-members/${userId}`);
    }
    removeThreadMember(threadId, userId) {
        return this.delete(`/rooms/${threadId}/thread-members/${userId}`);
    }
    getActiveThreads(spaceId) {
        return this.get(`/spaces/${spaceId}/threads/active`);
    }
    getArchivedThreads(roomId, params) {
        return this.get(`/rooms/${roomId}/threads/archived`, params);
    }
    // ---- Invites & Attachments ----
    createInvite(spaceId, opts) {
        const payload = {};
        if (opts?.max_uses !== undefined)
            payload.max_uses = opts.max_uses;
        if (opts?.max_age_seconds !== undefined)
            payload.max_age_seconds = opts.max_age_seconds;
        else if (opts?.max_age !== undefined)
            payload.max_age_seconds = opts.max_age;
        if (opts?.room_id !== undefined)
            payload.room_id = opts.room_id;
        return this.post(`/spaces/${spaceId}/invites`, payload);
    }
    getSpaceInvites(spaceId) {
        return this.get(`/spaces/${spaceId}/invites`);
    }
    deleteInvite(spaceId, code) {
        return this.delete(`/spaces/${spaceId}/invites/${code}`);
    }
    getInvite(code) {
        return this.get(`/spaces/invites/${code}`);
    }
    async uploadAttachment(roomIdOrFile, fileOrFilename, filenameOrOpts, opts) {
        const form = new FormData();
        let path;
        let file;
        let filename;
        let dimensions;
        if (typeof roomIdOrFile === 'string') {
            // Official signature: uploadAttachment(roomId, file, filename, { width?, height? })
            path = `/rooms/${roomIdOrFile}/attachments`;
            file = fileOrFilename;
            filename = typeof filenameOrOpts === 'string' ? filenameOrOpts : 'attachment';
            dimensions = opts;
        }
        else {
            // Backwards-compatible signature: uploadAttachment(file, filename, uploadUrl?)
            file = roomIdOrFile;
            filename = fileOrFilename;
            path = typeof filenameOrOpts === 'string' ? filenameOrOpts : '/attachments';
        }
        const blob = file instanceof Blob
            ? file
            : new Blob([new Uint8Array(file)]);
        form.append('file', blob, filename);
        if (dimensions?.width !== undefined)
            form.append('width', String(dimensions.width));
        if (dimensions?.height !== undefined)
            form.append('height', String(dimensions.height));
        return this.request({
            method: 'POST',
            path,
            body: form,
        });
    }
}
exports.REST = REST;
//# sourceMappingURL=index.js.map