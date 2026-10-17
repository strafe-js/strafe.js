"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REST = void 0;
const util_1 = require("@strafe-js/util");
/**
 * HTTP client for the Strafe REST API v1 with automatic `429 Too Many Requests` backoff retries,
 * JSON/multipart serialization, and typed endpoint helpers.
 *
 * @example
 * ```ts
 * import { REST } from '@strafe-js/rest';
 *
 * const rest = new REST({
 *   baseUrl: 'https://app.strafe.chat/api',
 *   token: process.env.STRAFE_BOT_TOKEN!,
 * });
 *
 * const me = await rest.getMe();
 * await rest.createMessage('123456789012345678', `Hello from ${me.username}!`);
 * ```
 */
class REST {
    baseUrl;
    token;
    authScheme;
    retries;
    userAgent;
    /**
     * Creates a new {@link REST} client instance.
     */
    constructor(opts) {
        this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
        this.token = opts.token;
        this.authScheme = opts.authScheme ?? 'Bot';
        this.retries = opts.retries ?? 3;
        this.userAgent = opts.userAgent ?? 'strafebot-js/1.1';
    }
    /**
     * Updates the authentication token used for subsequent HTTP requests.
     */
    setToken(token) {
        this.token = token;
        return this;
    }
    /**
     * Executes an HTTP request against the Strafe API.
     * Automatically retries `429 Too Many Requests` responses up to `retries` times using `retry_after` (body)
     * or `Retry-After` (header), and returns `undefined` on `204 No Content`.
     *
     * @throws {RateLimitError} When `429` responses persist after all configured retry attempts.
     * @throws {StrafeError} On non-2xx HTTP responses (`4xx` / `5xx`).
     */
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
    /**
     * Sends a `GET` request with optional URL query parameters (`undefined` values are skipped).
     */
    get(path, query) {
        return this.request({ method: 'GET', path, query });
    }
    /**
     * Sends a `POST` request with an optional JSON or `FormData` body.
     */
    post(path, body) {
        return this.request({ method: 'POST', path, body });
    }
    /**
     * Sends a `PATCH` request with a partial JSON update payload.
     */
    patch(path, body) {
        return this.request({ method: 'PATCH', path, body });
    }
    /**
     * Sends a `PUT` request with an optional JSON replacement payload.
     */
    put(path, body) {
        return this.request({ method: 'PUT', path, body });
    }
    /**
     * Sends a `DELETE` request and resolves to `undefined` on `204 No Content`.
     */
    delete(path, body) {
        return this.request({ method: 'DELETE', path, body });
    }
    /**
     * Fetches the authenticated bot or user profile via `GET /users/@me`.
     *
     * @example
     * ```ts
     * const me = await client.rest.getMe();
     * console.log(me.username, me.id);
     * ```
     */
    getMe() {
        return this.get('/users/@me');
    }
    /**
     * Updates the authenticated user's profile fields or online presence via `PATCH /users/@me`.
     *
     * @example
     * ```ts
     * await client.rest.updateProfile({
     *   display_name: 'ModBot',
     *   presence: { status: 'online', custom_status: 'Watching !help' },
     * });
     * ```
     */
    updateProfile(body) {
        return this.patch('/users/@me', body);
    }
    /**
     * Lists all spaces the authenticated user belongs to via `GET /users/@me/spaces`.
     */
    getMySpaces() {
        return this.get('/users/@me/spaces');
    }
    /**
     * Lists spaces visible to the current token via `GET /spaces`.
     */
    getSpaces() {
        return this.get('/spaces');
    }
    /**
     * Fetches a space and its metadata by ID via `GET /spaces/:spaceId`.
     */
    getSpace(spaceId) {
        return this.get(`/spaces/${spaceId}`);
    }
    /**
     * Updates space configuration via `PATCH /spaces/:spaceId`. Requires `Permission.ManageSpace`.
     * Pass `''` to clear nullable room reference fields such as `system_room_id` or `afk_room_id`.
     *
     * @example
     * ```ts
     * await client.rest.editSpace(spaceId, {
     *   name: 'Strafe Developers',
     *   default_message_notifications: 1,
     * });
     * ```
     */
    editSpace(spaceId, body) {
        return this.patch(`/spaces/${spaceId}`, body);
    }
    /**
     * Removes the authenticated user from a space via `POST /spaces/:spaceId/leave`.
     */
    leaveSpace(spaceId) {
        return this.post(`/spaces/${spaceId}/leave`);
    }
    /**
     * Fetches audit log entries and hydrated actor profiles via `GET /spaces/:spaceId/audit-log`.
     *
     * @example
     * ```ts
     * const { entries, users } = await client.rest.getAuditLog(spaceId, { limit: 25 });
     * ```
     */
    getAuditLog(spaceId, params) {
        return this.get(`/spaces/${spaceId}/audit-log`, params);
    }
    /**
     * Lists all rooms in a space via `GET /spaces/:spaceId/rooms`.
     */
    getSpaceRooms(spaceId) {
        return this.get(`/spaces/${spaceId}/rooms`);
    }
    /**
     * Creates a new text, voice, or section room in a space via `POST /spaces/:spaceId/rooms`.
     * Requires `Permission.ManageRooms`.
     *
     * @example
     * ```ts
     * import { RoomType } from '@strafe-js/util';
     *
     * const room = await client.rest.createRoom(spaceId, {
     *   name: 'announcements',
     *   type: RoomType.Text,
     * });
     * ```
     */
    createRoom(spaceId, body) {
        return this.post(`/spaces/${spaceId}/rooms`, body);
    }
    /**
     * Modifies a space room's name, topic, slowmode, voice limits, or ordering via
     * `PATCH /spaces/:spaceId/rooms/:roomId`. Requires `Permission.ManageRooms`.
     */
    editRoom(spaceId, roomId, body) {
        return this.patch(`/spaces/${spaceId}/rooms/${roomId}`, body);
    }
    /**
     * Permanently deletes a room from a space via `DELETE /spaces/:spaceId/rooms/:roomId`.
     * Requires `Permission.ManageRooms`.
     */
    deleteRoom(spaceId, roomId) {
        return this.delete(`/spaces/${spaceId}/rooms/${roomId}`);
    }
    /**
     * Fetches a single room by ID via `GET /rooms/:roomId`. Requires `Permission.ViewRoom`.
     */
    getRoom(roomId) {
        return this.get(`/rooms/${roomId}`);
    }
    /**
     * Lists open 1-on-1 DM and Group DM rooms for the authenticated user via `GET /rooms`.
     */
    getPMRooms() {
        return this.get('/rooms');
    }
    /**
     * Opens or retrieves an existing 1-on-1 DM (`recipient_id` or `recipient_handle`) or Group DM (`recipient_ids`)
     * via `POST /rooms`.
     *
     * @example
     * ```ts
     * const dm = await client.rest.openPM({ recipient_id: userId });
     * await client.rest.createMessage(dm.id, 'Hello via DM!');
     * ```
     */
    openPM(body) {
        return this.post('/rooms', body);
    }
    /**
     * Marks messages up to `messageId` as read in `roomId` via `POST /rooms/:roomId/ack`.
     */
    ackRoom(roomId, messageId) {
        return this.post(`/rooms/${roomId}/ack`, { message_id: messageId });
    }
    /**
     * Lists all members in a space via `GET /spaces/:spaceId/members`.
     * Prefer `client.fetchMembers(spaceId)` when using `Client` so `client.members` stays populated.
     */
    getSpaceMembers(spaceId) {
        return this.get(`/spaces/${spaceId}/members`);
    }
    /**
     * Fetches a single space member via `GET /spaces/:spaceId/members/:userId`.
     */
    getSpaceMember(spaceId, userId) {
        return this.get(`/spaces/${spaceId}/members/${userId}`);
    }
    /**
     * Replaces the full set of roles assigned to a member via `PUT /spaces/:spaceId/members/:userId/roles`.
     * Requires `Permission.ManageRoles` and a highest role above every role in `roleIds`.
     */
    setMemberRoles(spaceId, userId, roleIds) {
        return this.put(`/spaces/${spaceId}/members/${userId}/roles`, { role_ids: roleIds });
    }
    /**
     * Kicks a member from a space via `DELETE /spaces/:spaceId/members/:userId`.
     * Requires `Permission.KickMembers`.
     */
    kickMember(spaceId, userId) {
        return this.delete(`/spaces/${spaceId}/members/${userId}`);
    }
    /**
     * Permanently bans a user from a space via `POST /spaces/:spaceId/bans/:userId` with an optional audit reason.
     * Requires `Permission.BanMembers`.
     *
     * @example
     * ```ts
     * await client.rest.banMember(spaceId, userId, 'Spamming links');
     * ```
     */
    banMember(spaceId, userId, reason) {
        return this.post(`/spaces/${spaceId}/bans/${userId}`, reason ? { reason } : {});
    }
    /**
     * Removes an active ban for `userId` via `DELETE /spaces/:spaceId/bans/:userId`.
     * Requires `Permission.BanMembers`.
     */
    unbanMember(spaceId, userId) {
        return this.delete(`/spaces/${spaceId}/bans/${userId}`);
    }
    /**
     * Lists all active bans and associated user profiles in a space via `GET /spaces/:spaceId/bans`.
     * Requires `Permission.BanMembers`.
     */
    getSpaceBans(spaceId) {
        return this.get(`/spaces/${spaceId}/bans`);
    }
    /**
     * Lists all roles defined in a space via `GET /spaces/:spaceId/roles`.
     */
    getSpaceRoles(spaceId) {
        return this.get(`/spaces/${spaceId}/roles`);
    }
    /**
     * Creates a new role in a space via `POST /spaces/:spaceId/roles`.
     * Requires `Permission.ManageRoles`.
     *
     * @example
     * ```ts
     * import { Permission } from '@strafe-js/util';
     *
     * const role = await client.rest.createRole(spaceId, {
     *   name: 'Moderator',
     *   permissions: Permission.KickMembers | Permission.ManageMessages,
     *   hoist: true,
     * });
     * ```
     */
    createRole(spaceId, body) {
        return this.post(`/spaces/${spaceId}/roles`, body);
    }
    /**
     * Updates a role's name, permission bitmask, RGB color, hoist flag, or hierarchy position via
     * `PATCH /spaces/:spaceId/roles/:roleId`. Requires `Permission.ManageRoles`.
     */
    editRole(spaceId, roleId, body) {
        return this.patch(`/spaces/${spaceId}/roles/${roleId}`, body);
    }
    /**
     * Deletes a role from a space via `DELETE /spaces/:spaceId/roles/:roleId`.
     * Requires `Permission.ManageRoles`.
     */
    deleteRole(spaceId, roleId) {
        return this.delete(`/spaces/${spaceId}/roles/${roleId}`);
    }
    /**
     * Sends a message to `roomId` via `POST /rooms/:roomId/messages`.
     * Accepts a plaintext string, a {@link CreateMessageBody} object, or `message().toJSON()` from `@strafe-js/builders`.
     * Requires `Permission.ViewRoom` and `Permission.SendMessages` in space rooms.
     *
     * @example
     * ```ts
     * await client.rest.createMessage(roomId, 'Hello world!');
     * await client.rest.createMessage(roomId, {
     *   plaintext: 'Replying with attachment',
     *   reply_to_id: originalMsgId,
     *   attachments: [attachment.id],
     * });
     * ```
     */
    createMessage(roomId, body) {
        const payload = typeof body === 'string' ? { plaintext: body } : body;
        return this.post(`/rooms/${roomId}/messages`, payload);
    }
    /**
     * Edits the plaintext content of an existing message sent by the current user via
     * `PATCH /rooms/:roomId/messages/:messageId`.
     *
     * @example
     * ```ts
     * await client.rest.editMessage(roomId, messageId, 'Updated text');
     * ```
     */
    editMessage(roomId, messageId, body) {
        const payload = typeof body === 'string' ? { plaintext: body } : body;
        return this.patch(`/rooms/${roomId}/messages/${messageId}`, payload);
    }
    /**
     * Deletes a message via `DELETE /rooms/:roomId/messages/:messageId`.
     * Deleting another user's message in a space requires `Permission.ManageMessages`.
     */
    deleteMessage(roomId, messageId) {
        return this.delete(`/rooms/${roomId}/messages/${messageId}`);
    }
    /**
     * Fetches message history in `roomId` via `GET /rooms/:roomId/messages` using cursor pagination (`before` / `after`).
     * Requires `Permission.ReadMessageHistory`.
     *
     * @example
     * ```ts
     * const recent = await client.rest.listMessages(roomId, { limit: 50 });
     * ```
     */
    listMessages(roomId, params) {
        return this.get(`/rooms/${roomId}/messages`, params);
    }
    /**
     * Fetches a single message by ID via `GET /rooms/:roomId/messages/:messageId`.
     * Requires `Permission.ReadMessageHistory`.
     */
    getMessage(roomId, messageId) {
        return this.get(`/rooms/${roomId}/messages/${messageId}`);
    }
    /**
     * Searches messages within a single room via `GET /rooms/:roomId/messages/search`.
     */
    searchRoomMessages(roomId, params) {
        return this.get(`/rooms/${roomId}/messages/search`, params);
    }
    /**
     * Searches messages across all accessible rooms in a space via `GET /spaces/:spaceId/messages/search`.
     */
    searchSpaceMessages(spaceId, params) {
        return this.get(`/spaces/${spaceId}/messages/search`, params);
    }
    /**
     * Broadcasts a typing indicator in `roomId` via `POST /rooms/:roomId/typing`.
     */
    triggerTyping(roomId) {
        return this.post(`/rooms/${roomId}/typing`);
    }
    /**
     * Adds a reaction to a message via `PUT /rooms/:roomId/messages/:messageId/reactions/:emoji`.
     * Pass a Unicode emoji character or `custom:<emoji_id>` (via `customReactionEmoji()` from `@strafe-js/formatters`).
     * Requires `Permission.AddReactions` when adding a new reaction to a message.
     *
     * @example
     * ```ts
     * await client.rest.addReaction(roomId, messageId, '👍');
     * ```
     */
    addReaction(roomId, messageId, emoji) {
        const enc = encodeURIComponent(emoji);
        return this.put(`/rooms/${roomId}/messages/${messageId}/reactions/${enc}`);
    }
    /**
     * Removes a reaction from a message via `DELETE /rooms/:roomId/messages/:messageId/reactions/:emoji[/:userId]`.
     * Omit `userId` (or pass `'@me'`) to remove the bot's own reaction; pass another user's Snowflake ID to remove theirs
     * (requires `Permission.ManageMessages`).
     */
    removeReaction(roomId, messageId, emoji, userId) {
        const enc = encodeURIComponent(emoji);
        const suffix = userId && userId !== '@me' ? `/${userId}` : '';
        return this.delete(`/rooms/${roomId}/messages/${messageId}/reactions/${enc}${suffix}`);
    }
    /**
     * Lists users who reacted with `emoji` on a message via `GET /rooms/:roomId/messages/:messageId/reactions/:emoji`.
     */
    getReactions(roomId, messageId, emoji) {
        const enc = encodeURIComponent(emoji);
        return this.get(`/rooms/${roomId}/messages/${messageId}/reactions/${enc}`);
    }
    /**
     * Pins a message in `roomId` via `PUT /rooms/:roomId/messages/:messageId/pin`.
     * Requires `Permission.ManageMessages`.
     */
    pinMessage(roomId, messageId) {
        return this.put(`/rooms/${roomId}/messages/${messageId}/pin`);
    }
    /**
     * Unpins a message in `roomId` via `DELETE /rooms/:roomId/messages/:messageId/pin`.
     * Requires `Permission.ManageMessages`.
     */
    unpinMessage(roomId, messageId) {
        return this.delete(`/rooms/${roomId}/messages/${messageId}/pin`);
    }
    /**
     * Lists pinned messages in `roomId` via `GET /rooms/:roomId/pins`.
     */
    getPinnedMessages(roomId) {
        return this.get(`/rooms/${roomId}/pins`);
    }
    /**
     * Spawns a public discussion thread attached to an existing message via
     * `POST /rooms/:roomId/messages/:messageId/threads`. Requires `Permission.CreatePublicThreads`.
     */
    createThreadFromMessage(roomId, messageId, body) {
        return this.post(`/rooms/${roomId}/messages/${messageId}/threads`, body);
    }
    /**
     * Creates a standalone public or private thread in `roomId` via `POST /rooms/:roomId/threads`.
     * Requires `Permission.CreatePublicThreads` or `Permission.CreatePrivateThreads`.
     */
    createThread(roomId, body) {
        return this.post(`/rooms/${roomId}/threads`, body);
    }
    /**
     * Fetches thread room details and {@link ThreadMetadata} via `GET /rooms/:threadId/thread`.
     */
    getThread(threadId) {
        return this.get(`/rooms/${threadId}/thread`);
    }
    /**
     * Updates thread state (name, `archived`, `locked`, `invitable`, `auto_archive_minutes`, or `slowmode_seconds`)
     * via `PATCH /rooms/:threadId/thread`. Locking or editing another user's thread requires `Permission.ManageThreads`.
     */
    editThread(threadId, body) {
        return this.patch(`/rooms/${threadId}/thread`, body);
    }
    /**
     * Permanently deletes a thread via `DELETE /rooms/:threadId/thread`. Requires `Permission.ManageThreads`.
     */
    deleteThread(threadId) {
        return this.delete(`/rooms/${threadId}/thread`);
    }
    /**
     * Lists members currently joined to `threadId` via `GET /rooms/:threadId/thread-members`.
     */
    getThreadMembers(threadId) {
        return this.get(`/rooms/${threadId}/thread-members`);
    }
    /**
     * Joins the authenticated bot user to `threadId` via `PUT /rooms/:threadId/thread-members/@me`.
     */
    joinThread(threadId) {
        return this.put(`/rooms/${threadId}/thread-members/@me`);
    }
    /**
     * Removes the authenticated bot user from `threadId` via `DELETE /rooms/:threadId/thread-members/@me`.
     */
    leaveThread(threadId) {
        return this.delete(`/rooms/${threadId}/thread-members/@me`);
    }
    /**
     * Adds `userId` to a thread via `PUT /rooms/:threadId/thread-members/:userId`.
     */
    addThreadMember(threadId, userId) {
        return this.put(`/rooms/${threadId}/thread-members/${userId}`);
    }
    /**
     * Removes `userId` from a thread via `DELETE /rooms/:threadId/thread-members/:userId`.
     */
    removeThreadMember(threadId, userId) {
        return this.delete(`/rooms/${threadId}/thread-members/${userId}`);
    }
    /**
     * Lists all active (non-archived) threads in a space via `GET /spaces/:spaceId/threads/active`.
     */
    getActiveThreads(spaceId) {
        return this.get(`/spaces/${spaceId}/threads/active`);
    }
    /**
     * Lists archived threads in `roomId` via `GET /rooms/:roomId/threads/archived`.
     */
    getArchivedThreads(roomId, params) {
        return this.get(`/rooms/${roomId}/threads/archived`, params);
    }
    /**
     * Generates a new invite code for `spaceId` via `POST /spaces/:spaceId/invites`.
     * Accepts `max_age_seconds` (or its alias `max_age`), `max_uses`, and an optional target `room_id`.
     * Requires `Permission.CreateInvite`.
     *
     * @example
     * ```ts
     * const invite = await client.rest.createInvite(spaceId, {
     *   max_uses: 10,
     *   max_age_seconds: 86400,
     * });
     * ```
     */
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
    /**
     * Lists all active invites in a space via `GET /spaces/:spaceId/invites`.
     * Requires `Permission.ManageSpace` or `Permission.ManageRooms`.
     */
    getSpaceInvites(spaceId) {
        return this.get(`/spaces/${spaceId}/invites`);
    }
    /**
     * Revokes an invite code in a space via `DELETE /spaces/:spaceId/invites/:code`.
     */
    deleteInvite(spaceId, code) {
        return this.delete(`/spaces/${spaceId}/invites/${code}`);
    }
    /**
     * Resolves public preview information for an invite code via `GET /spaces/invites/:code`.
     */
    getInvite(code) {
        return this.get(`/spaces/invites/${code}`);
    }
    /**
     * Uploads a binary `Blob` or `Buffer` as a multipart file attachment to `POST /rooms/:roomId/attachments`
     * (or to a custom upload path when called with the 3-argument overload).
     * Pass the returned `attachment.id` inside `CreateMessageBody.attachments` when sending a message.
     * Requires `Permission.SendMessages` and `Permission.AttachFiles`.
     *
     * @example
     * ```ts
     * const uploaded = await client.rest.uploadAttachment(
     *   roomId,
     *   Buffer.from('hello world'),
     *   'notes.txt',
     * );
     * await client.rest.createMessage(roomId, {
     *   plaintext: 'Here is the file:',
     *   attachments: [uploaded.id],
     * });
     * ```
     */
    async uploadAttachment(roomIdOrFile, fileOrFilename, filenameOrOpts, opts) {
        const form = new FormData();
        let path;
        let file;
        let filename;
        let dimensions;
        if (typeof roomIdOrFile === 'string') {
            path = `/rooms/${roomIdOrFile}/attachments`;
            file = fileOrFilename;
            filename = typeof filenameOrOpts === 'string' ? filenameOrOpts : 'attachment';
            dimensions = opts;
        }
        else {
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