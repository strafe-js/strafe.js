import {
  Attachment,
  CreateMessageBody,
  EditMessageBody,
  Message,
  RateLimitError,
  Role,
  Room,
  RoomTypeValue,
  Snowflake,
  Space,
  SpaceMember,
  StrafeError,
  ThreadMetadata,
  User,
  sleep,
} from '@strafe-js/util';

export { CreateMessageBody, EditMessageBody };

/**
 * Configuration options for the {@link REST} HTTP client.
 */
export interface RESTOptions {
  /** Base URL of the Strafe HTTP API (for example `'https://app.strafe.chat/api'`). Trailing slashes are stripped automatically. */
  baseUrl: string;
  /** Bot or user authentication token sent in the `Authorization` header. */
  token?: string;
  /** Authorization header prefix (`'Bot'` or `'Bearer'`). Defaults to `'Bot'`. */
  authScheme?: 'Bot' | 'Bearer';
  /** Maximum number of automatic retry attempts on HTTP `429 Too Many Requests` responses. Defaults to `3`. */
  retries?: number;
  /** Custom `User-Agent` header sent with every HTTP request. Defaults to `'strafebot-js/1.1'`. */
  userAgent?: string;
}

/**
 * Low-level HTTP request descriptor passed to {@link REST.request}.
 */
export interface RequestOptions {
  /** HTTP verb to execute. */
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** API route path relative to `baseUrl` (for example `'/users/@me'` or `'rooms/123/messages'`). */
  path: string;
  /** Request body serialized as JSON (`application/json`) or sent directly when an instance of `FormData`. */
  body?: unknown;
  /** URL query string parameters (`undefined` entries are omitted). */
  query?: Record<string, string | number | boolean | undefined>;
  /** Additional HTTP headers merged onto the request. */
  headers?: Record<string, string>;
}

/**
 * Space invite metadata returned by invite endpoints.
 */
export interface Invite {
  /** Unique alphanumeric invite code. */
  code: string;
  /** Target space Snowflake ID. */
  space_id?: Snowflake;
  /** User Snowflake ID of the member who created the invite. */
  inviter_id?: Snowflake;
  /** Maximum allowed uses before expiration (`0` or `undefined` means unlimited). */
  max_uses?: number;
  /** Number of times this invite has been used. */
  current_uses?: number;
  /** ISO-8601 expiration timestamp, if time-limited. */
  expires_at?: string;
  /** ISO-8601 creation timestamp. */
  created_at?: string;
}

/**
 * Space audit log record returned by {@link REST.getAuditLog}.
 */
export interface AuditLogEntry {
  /** Unique Snowflake ID of the audit log entry. */
  id: Snowflake;
  /** Action identifier (for example `'MEMBER_BAN_ADD'` or `'ROOM_CREATE'`). */
  action_type: string;
  /** User Snowflake ID of the moderator or bot that performed the action. */
  user_id: Snowflake;
  /** Target entity Snowflake ID affected by the action. */
  target_id?: Snowflake;
  /** Diff payload describing modified fields. */
  changes?: unknown;
  /** Optional audit log reason provided with the action. */
  reason?: string;
  /** ISO-8601 timestamp when the action was recorded. */
  created_at: string;
}

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
export class REST {
  private baseUrl: string;
  private token?: string;
  private authScheme: 'Bot' | 'Bearer';
  private retries: number;
  private userAgent: string;

  /**
   * Creates a new {@link REST} client instance.
   */
  constructor(opts: RESTOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.token = opts.token;
    this.authScheme = opts.authScheme ?? 'Bot';
    this.retries = opts.retries ?? 3;
    this.userAgent = opts.userAgent ?? 'strafebot-js/1.1';
  }

  /**
   * Updates the authentication token used for subsequent HTTP requests.
   */
  setToken(token: string): this {
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
  async request<T = unknown>(opts: RequestOptions): Promise<T> {
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = opts.path.startsWith('/') ? opts.path : `/${opts.path}`;
    const url = new URL(`${cleanBase}${cleanPath}`);

    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      Accept: 'application/json',
      ...(opts.headers ?? {}),
    };
    if (this.token) headers['Authorization'] = `${this.authScheme} ${this.token}`;

    const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
    let body: BodyInit | undefined;

    if (opts.body !== undefined) {
      if (isFormData) {
        body = opts.body as FormData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(opts.body);
      }
    }

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const res = await fetch(url, { method: opts.method, headers, body });

      if (res.status === 204) return undefined as T;

      const text = await res.text();
      let data: unknown = undefined;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (res.status === 429) {
        const retryHeader = Number(res.headers.get('retry-after'));
        const retryBody =
          typeof data === 'object' && data && 'retry_after' in data
            ? Number((data as { retry_after: unknown }).retry_after)
            : NaN;
        const waitSec = !Number.isNaN(retryBody)
          ? retryBody
          : !Number.isNaN(retryHeader)
          ? retryHeader
          : 1;
        if (attempt < this.retries) {
          await sleep(waitSec * 1000);
          continue;
        }
        throw new RateLimitError(waitSec, data);
      }

      if (!res.ok) {
        const msg =
          typeof data === 'object' && data && 'error' in data
            ? String((data as { error: unknown }).error)
            : `HTTP ${res.status} ${res.statusText}`;
        const code =
          typeof data === 'object' && data && 'code' in data
            ? String((data as { code: unknown }).code)
            : undefined;
        throw new StrafeError(msg, res.status, code, data);
      }

      return data as T;
    }

    throw new StrafeError('Exhausted retries', 500);
  }

  /**
   * Sends a `GET` request with optional URL query parameters (`undefined` values are skipped).
   */
  get<T = unknown>(path: string, query?: RequestOptions['query']): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }
  /**
   * Sends a `POST` request with an optional JSON or `FormData` body.
   */
  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }
  /**
   * Sends a `PATCH` request with a partial JSON update payload.
   */
  patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }
  /**
   * Sends a `PUT` request with an optional JSON replacement payload.
   */
  put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }
  /**
   * Sends a `DELETE` request and resolves to `undefined` on `204 No Content`.
   */
  delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, body });
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
  getMe(): Promise<User> {
    return this.get<User>('/users/@me');
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
  updateProfile(body: {
    display_name?: string;
    bio?: string;
    about_me?: string;
    pronouns?: string;
    birthday_opt_in?: boolean;
    accent_color?: string;
    presence?: { status: 'online' | 'idle' | 'dnd' | 'invisible'; custom_status?: string };
  }): Promise<User> {
    return this.patch<User>('/users/@me', body);
  }
  /**
   * Lists all spaces the authenticated user belongs to via `GET /users/@me/spaces`.
   */
  getMySpaces(): Promise<Space[]> {
    return this.get<Space[]>('/users/@me/spaces');
  }
  /**
   * Lists spaces visible to the current token via `GET /spaces`.
   */
  getSpaces(): Promise<Space[]> {
    return this.get<Space[]>('/spaces');
  }

  /**
   * Fetches a space and its metadata by ID via `GET /spaces/:spaceId`.
   */
  getSpace(spaceId: Snowflake): Promise<Space> {
    return this.get<Space>(`/spaces/${spaceId}`);
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
  editSpace(
    spaceId: Snowflake,
    body: {
      name?: string;
      description?: string;
      system_room_id?: Snowflake | '';
      system_room_flags?: number;
      default_message_notifications?: 0 | 1;
      afk_room_id?: Snowflake | '';
      afk_timeout?: 60 | 300 | 900 | 1800 | 3600;
      widget_enabled?: boolean;
      widget_room_id?: Snowflake | '';
      birthday_channel_id?: Snowflake | '';
      birthday_message?: string;
    },
  ): Promise<Space> {
    return this.patch<Space>(`/spaces/${spaceId}`, body);
  }
  /**
   * Removes the authenticated user from a space via `POST /spaces/:spaceId/leave`.
   */
  leaveSpace(spaceId: Snowflake): Promise<void> {
    return this.post<void>(`/spaces/${spaceId}/leave`);
  }
  /**
   * Fetches audit log entries and hydrated actor profiles via `GET /spaces/:spaceId/audit-log`.
   *
   * @example
   * ```ts
   * const { entries, users } = await client.rest.getAuditLog(spaceId, { limit: 25 });
   * ```
   */
  getAuditLog(
    spaceId: Snowflake,
    params?: { limit?: number; before?: Snowflake; action?: string },
  ): Promise<{ entries: AuditLogEntry[]; users: Record<Snowflake, User> }> {
    return this.get(`/spaces/${spaceId}/audit-log`, params);
  }
  /**
   * Lists all rooms in a space via `GET /spaces/:spaceId/rooms`.
   */
  getSpaceRooms(spaceId: Snowflake): Promise<Room[]> {
    return this.get<Room[]>(`/spaces/${spaceId}/rooms`);
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
  createRoom(
    spaceId: Snowflake,
    body: {
      name: string;
      type: RoomTypeValue;
      parent_id?: Snowflake;
      e2ee_enabled?: boolean;
      user_limit?: number;
      bitrate?: number;
    },
  ): Promise<Room> {
    return this.post<Room>(`/spaces/${spaceId}/rooms`, body);
  }
  /**
   * Modifies a space room's name, topic, slowmode, voice limits, or ordering via
   * `PATCH /spaces/:spaceId/rooms/:roomId`. Requires `Permission.ManageRooms`.
   */
  editRoom(
    spaceId: Snowflake,
    roomId: Snowflake,
    body: {
      name?: string;
      topic?: string;
      slowmode_seconds?: number;
      e2ee_enabled?: boolean;
      user_limit?: number;
      bitrate?: number;
      position?: number;
    },
  ): Promise<Room> {
    return this.patch<Room>(`/spaces/${spaceId}/rooms/${roomId}`, body);
  }
  /**
   * Permanently deletes a room from a space via `DELETE /spaces/:spaceId/rooms/:roomId`.
   * Requires `Permission.ManageRooms`.
   */
  deleteRoom(spaceId: Snowflake, roomId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/rooms/${roomId}`);
  }
  /**
   * Fetches a single room by ID via `GET /rooms/:roomId`. Requires `Permission.ViewRoom`.
   */
  getRoom(roomId: Snowflake): Promise<Room> {
    return this.get<Room>(`/rooms/${roomId}`);
  }
  /**
   * Lists open 1-on-1 DM and Group DM rooms for the authenticated user via `GET /rooms`.
   */
  getPMRooms(): Promise<Room[]> {
    return this.get<Room[]>('/rooms');
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
  openPM(body: { recipient_id?: Snowflake; recipient_handle?: string; name?: string; recipient_ids?: Snowflake[] }): Promise<Room> {
    return this.post<Room>('/rooms', body);
  }
  /**
   * Marks messages up to `messageId` as read in `roomId` via `POST /rooms/:roomId/ack`.
   */
  ackRoom(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.post<void>(`/rooms/${roomId}/ack`, { message_id: messageId });
  }

  /**
   * Lists all members in a space via `GET /spaces/:spaceId/members`.
   * Prefer `client.fetchMembers(spaceId)` when using `Client` so `client.members` stays populated.
   */
  getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]> {
    return this.get<SpaceMember[]>(`/spaces/${spaceId}/members`);
  }
  /**
   * Fetches a single space member via `GET /spaces/:spaceId/members/:userId`.
   */
  getSpaceMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember> {
    return this.get<SpaceMember>(`/spaces/${spaceId}/members/${userId}`);
  }
  /**
   * Replaces the full set of roles assigned to a member via `PUT /spaces/:spaceId/members/:userId/roles`.
   * Requires `Permission.ManageRoles` and a highest role above every role in `roleIds`.
   */
  setMemberRoles(spaceId: Snowflake, userId: Snowflake, roleIds: Snowflake[]): Promise<void> {
    return this.put<void>(`/spaces/${spaceId}/members/${userId}/roles`, { role_ids: roleIds });
  }
  /**
   * Kicks a member from a space via `DELETE /spaces/:spaceId/members/:userId`.
   * Requires `Permission.KickMembers`.
   */
  kickMember(spaceId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/members/${userId}`);
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
  banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<void> {
    return this.post<void>(
      `/spaces/${spaceId}/bans/${userId}`,
      reason ? { reason } : {},
    );
  }
  /**
   * Removes an active ban for `userId` via `DELETE /spaces/:spaceId/bans/:userId`.
   * Requires `Permission.BanMembers`.
   */
  unbanMember(spaceId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/bans/${userId}`);
  }
  /**
   * Lists all active bans and associated user profiles in a space via `GET /spaces/:spaceId/bans`.
   * Requires `Permission.BanMembers`.
   */
  getSpaceBans(spaceId: Snowflake): Promise<{ bans: { user_id: Snowflake; reason?: string; banned_by: Snowflake; created_at: string }[]; users: Record<Snowflake, User> }> {
    return this.get(`/spaces/${spaceId}/bans`);
  }
  /**
   * Lists all roles defined in a space via `GET /spaces/:spaceId/roles`.
   */
  getSpaceRoles(spaceId: Snowflake): Promise<Role[]> {
    return this.get<Role[]>(`/spaces/${spaceId}/roles`);
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
  createRole(
    spaceId: Snowflake,
    body: { name: string; permissions?: number; color?: number; hoist?: boolean; mentionable?: boolean },
  ): Promise<Role> {
    return this.post<Role>(`/spaces/${spaceId}/roles`, body);
  }
  /**
   * Updates a role's name, permission bitmask, RGB color, hoist flag, or hierarchy position via
   * `PATCH /spaces/:spaceId/roles/:roleId`. Requires `Permission.ManageRoles`.
   */
  editRole(
    spaceId: Snowflake,
    roleId: Snowflake,
    body: { name?: string; permissions?: number; color?: number; hoist?: boolean; mentionable?: boolean; position?: number },
  ): Promise<Role> {
    return this.patch<Role>(`/spaces/${spaceId}/roles/${roleId}`, body);
  }
  /**
   * Deletes a role from a space via `DELETE /spaces/:spaceId/roles/:roleId`.
   * Requires `Permission.ManageRoles`.
   */
  deleteRole(spaceId: Snowflake, roleId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/roles/${roleId}`);
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
  createMessage(
    roomId: Snowflake,
    body: CreateMessageBody | string,
  ): Promise<Message> {
    const payload: CreateMessageBody =
      typeof body === 'string' ? { plaintext: body } : body;
    return this.post<Message>(`/rooms/${roomId}/messages`, payload);
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
  editMessage(
    roomId: Snowflake,
    messageId: Snowflake,
    body: EditMessageBody | string,
  ): Promise<Message> {
    const payload: EditMessageBody =
      typeof body === 'string' ? { plaintext: body } : body;
    return this.patch<Message>(
      `/rooms/${roomId}/messages/${messageId}`,
      payload,
    );
  }
  /**
   * Deletes a message via `DELETE /rooms/:roomId/messages/:messageId`.
   * Deleting another user's message in a space requires `Permission.ManageMessages`.
   */
  deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${roomId}/messages/${messageId}`);
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
  listMessages(
    roomId: Snowflake,
    params?: { limit?: number; before?: Snowflake; after?: Snowflake },
  ): Promise<Message[]> {
    return this.get<Message[]>(`/rooms/${roomId}/messages`, params);
  }
  /**
   * Fetches a single message by ID via `GET /rooms/:roomId/messages/:messageId`.
   * Requires `Permission.ReadMessageHistory`.
   */
  getMessage(roomId: Snowflake, messageId: Snowflake): Promise<Message> {
    return this.get<Message>(`/rooms/${roomId}/messages/${messageId}`);
  }
  /**
   * Searches messages within a single room via `GET /rooms/:roomId/messages/search`.
   */
  searchRoomMessages(
    roomId: Snowflake,
    params: { q?: string; has?: 'link' | 'file' | 'image' | 'video' | 'audio'; limit?: number },
  ): Promise<Message[]> {
    return this.get<Message[]>(`/rooms/${roomId}/messages/search`, params);
  }
  /**
   * Searches messages across all accessible rooms in a space via `GET /spaces/:spaceId/messages/search`.
   */
  searchSpaceMessages(
    spaceId: Snowflake,
    params: { q?: string; has?: 'link' | 'file' | 'image' | 'video' | 'audio'; limit?: number },
  ): Promise<Message[]> {
    return this.get<Message[]>(`/spaces/${spaceId}/messages/search`, params);
  }
  /**
   * Broadcasts a typing indicator in `roomId` via `POST /rooms/:roomId/typing`.
   */
  triggerTyping(roomId: Snowflake): Promise<void> {
    return this.post<void>(`/rooms/${roomId}/typing`);
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
  addReaction(
    roomId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<void> {
    const enc = encodeURIComponent(emoji);
    return this.put<void>(
      `/rooms/${roomId}/messages/${messageId}/reactions/${enc}`,
    );
  }
  /**
   * Removes a reaction from a message via `DELETE /rooms/:roomId/messages/:messageId/reactions/:emoji[/:userId]`.
   * Omit `userId` (or pass `'@me'`) to remove the bot's own reaction; pass another user's Snowflake ID to remove theirs
   * (requires `Permission.ManageMessages`).
   */
  removeReaction(
    roomId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    userId?: Snowflake,
  ): Promise<void> {
    const enc = encodeURIComponent(emoji);
    const suffix = userId && userId !== '@me' ? `/${userId}` : '';
    return this.delete<void>(
      `/rooms/${roomId}/messages/${messageId}/reactions/${enc}${suffix}`,
    );
  }
  /**
   * Lists users who reacted with `emoji` on a message via `GET /rooms/:roomId/messages/:messageId/reactions/:emoji`.
   */
  getReactions(
    roomId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ): Promise<User[]> {
    const enc = encodeURIComponent(emoji);
    return this.get<User[]>(
      `/rooms/${roomId}/messages/${messageId}/reactions/${enc}`,
    );
  }
  /**
   * Pins a message in `roomId` via `PUT /rooms/:roomId/messages/:messageId/pin`.
   * Requires `Permission.ManageMessages`.
   */
  pinMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.put<void>(`/rooms/${roomId}/messages/${messageId}/pin`);
  }
  /**
   * Unpins a message in `roomId` via `DELETE /rooms/:roomId/messages/:messageId/pin`.
   * Requires `Permission.ManageMessages`.
   */
  unpinMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${roomId}/messages/${messageId}/pin`);
  }
  /**
   * Lists pinned messages in `roomId` via `GET /rooms/:roomId/pins`.
   */
  getPinnedMessages(
    roomId: Snowflake,
  ): Promise<{ items: { pinned_at: string; pinned_by: Snowflake; message: Message }[]; has_more: boolean }> {
    return this.get(`/rooms/${roomId}/pins`);
  }

  /**
   * Spawns a public discussion thread attached to an existing message via
   * `POST /rooms/:roomId/messages/:messageId/threads`. Requires `Permission.CreatePublicThreads`.
   */
  createThreadFromMessage(
    roomId: Snowflake,
    messageId: Snowflake,
    body: { name: string; auto_archive_minutes?: 60 | 1440 | 4320 | 10080 },
  ): Promise<Room> {
    return this.post<Room>(`/rooms/${roomId}/messages/${messageId}/threads`, body);
  }
  /**
   * Creates a standalone public or private thread in `roomId` via `POST /rooms/:roomId/threads`.
   * Requires `Permission.CreatePublicThreads` or `Permission.CreatePrivateThreads`.
   */
  createThread(
    roomId: Snowflake,
    body: { name: string; auto_archive_minutes?: 60 | 1440 | 4320 | 10080; private?: boolean; invitable?: boolean },
  ): Promise<Room> {
    return this.post<Room>(`/rooms/${roomId}/threads`, body);
  }
  /**
   * Fetches thread room details and {@link ThreadMetadata} via `GET /rooms/:threadId/thread`.
   */
  getThread(threadId: Snowflake): Promise<Room & { thread: ThreadMetadata }> {
    return this.get(`/rooms/${threadId}/thread`);
  }
  /**
   * Updates thread state (name, `archived`, `locked`, `invitable`, `auto_archive_minutes`, or `slowmode_seconds`)
   * via `PATCH /rooms/:threadId/thread`. Locking or editing another user's thread requires `Permission.ManageThreads`.
   */
  editThread(
    threadId: Snowflake,
    body: {
      name?: string;
      archived?: boolean;
      locked?: boolean;
      invitable?: boolean;
      auto_archive_minutes?: 60 | 1440 | 4320 | 10080;
      slowmode_seconds?: number;
    },
  ): Promise<Room> {
    return this.patch<Room>(`/rooms/${threadId}/thread`, body);
  }
  /**
   * Permanently deletes a thread via `DELETE /rooms/:threadId/thread`. Requires `Permission.ManageThreads`.
   */
  deleteThread(threadId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${threadId}/thread`);
  }
  /**
   * Lists members currently joined to `threadId` via `GET /rooms/:threadId/thread-members`.
   */
  getThreadMembers(threadId: Snowflake): Promise<{ user_id: Snowflake; joined_at: string; user?: User }[]> {
    return this.get(`/rooms/${threadId}/thread-members`);
  }
  /**
   * Joins the authenticated bot user to `threadId` via `PUT /rooms/:threadId/thread-members/@me`.
   */
  joinThread(threadId: Snowflake): Promise<void> {
    return this.put<void>(`/rooms/${threadId}/thread-members/@me`);
  }
  /**
   * Removes the authenticated bot user from `threadId` via `DELETE /rooms/:threadId/thread-members/@me`.
   */
  leaveThread(threadId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${threadId}/thread-members/@me`);
  }
  /**
   * Adds `userId` to a thread via `PUT /rooms/:threadId/thread-members/:userId`.
   */
  addThreadMember(threadId: Snowflake, userId: Snowflake): Promise<void> {
    return this.put<void>(`/rooms/${threadId}/thread-members/${userId}`);
  }
  /**
   * Removes `userId` from a thread via `DELETE /rooms/:threadId/thread-members/:userId`.
   */
  removeThreadMember(threadId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${threadId}/thread-members/${userId}`);
  }
  /**
   * Lists all active (non-archived) threads in a space via `GET /spaces/:spaceId/threads/active`.
   */
  getActiveThreads(spaceId: Snowflake): Promise<{ threads: Room[] }> {
    return this.get(`/spaces/${spaceId}/threads/active`);
  }
  /**
   * Lists archived threads in `roomId` via `GET /rooms/:roomId/threads/archived`.
   */
  getArchivedThreads(
    roomId: Snowflake,
    params?: { before?: string; limit?: number },
  ): Promise<{ threads: Room[]; has_more: boolean }> {
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
  createInvite(
    spaceId: Snowflake,
    opts?: { max_uses?: number; max_age_seconds?: number; max_age?: number; room_id?: Snowflake },
  ): Promise<Invite> {
    const payload: Record<string, unknown> = {};
    if (opts?.max_uses !== undefined) payload.max_uses = opts.max_uses;
    if (opts?.max_age_seconds !== undefined) payload.max_age_seconds = opts.max_age_seconds;
    else if (opts?.max_age !== undefined) payload.max_age_seconds = opts.max_age;
    if (opts?.room_id !== undefined) payload.room_id = opts.room_id;
    return this.post<Invite>(`/spaces/${spaceId}/invites`, payload);
  }
  /**
   * Lists all active invites in a space via `GET /spaces/:spaceId/invites`.
   * Requires `Permission.ManageSpace` or `Permission.ManageRooms`.
   */
  getSpaceInvites(spaceId: Snowflake): Promise<Invite[]> {
    return this.get<Invite[]>(`/spaces/${spaceId}/invites`);
  }
  /**
   * Revokes an invite code in a space via `DELETE /spaces/:spaceId/invites/:code`.
   */
  deleteInvite(spaceId: Snowflake, code: string): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/invites/${code}`);
  }
  /**
   * Resolves public preview information for an invite code via `GET /spaces/invites/:code`.
   */
  getInvite(code: string): Promise<{ space: Partial<Space>; inviter_display_name?: string }> {
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
  async uploadAttachment(
    roomIdOrFile: Snowflake | Blob | Buffer,
    fileOrFilename: Blob | Buffer | string,
    filenameOrOpts?: string | { width?: number; height?: number },
    opts?: { width?: number; height?: number },
  ): Promise<Attachment> {
    const form = new FormData();
    let path: string;
    let file: Blob | Buffer;
    let filename: string;
    let dimensions: { width?: number; height?: number } | undefined;

    if (typeof roomIdOrFile === 'string') {
      path = `/rooms/${roomIdOrFile}/attachments`;
      file = fileOrFilename as Blob | Buffer;
      filename = typeof filenameOrOpts === 'string' ? filenameOrOpts : 'attachment';
      dimensions = opts;
    } else {
      file = roomIdOrFile;
      filename = fileOrFilename as string;
      path = typeof filenameOrOpts === 'string' ? filenameOrOpts : '/attachments';
    }

    const blob =
      file instanceof Blob
        ? file
        : new Blob([new Uint8Array(file as Buffer)]);
    form.append('file', blob, filename);
    if (dimensions?.width !== undefined) form.append('width', String(dimensions.width));
    if (dimensions?.height !== undefined) form.append('height', String(dimensions.height));
    return this.request<Attachment>({
      method: 'POST',
      path,
      body: form,
    });
  }
}
