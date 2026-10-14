import {
  Attachment,
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

export interface RESTOptions {
  baseUrl: string;
  token?: string;
  authScheme?: 'Bot' | 'Bearer';
  retries?: number;
  userAgent?: string;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface CreateMessageBody {
  plaintext?: string;
  reply_to_id?: Snowflake;
  mentions?: Snowflake[];
  mention_roles?: Snowflake[];
  mention_everyone?: boolean;
  attachments?: Snowflake[];
}

export interface EditMessageBody {
  plaintext: string;
}

export interface Invite {
  code: string;
  space_id?: Snowflake;
  inviter_id?: Snowflake;
  max_uses?: number;
  current_uses?: number;
  expires_at?: string;
  created_at?: string;
}

export interface AuditLogEntry {
  id: Snowflake;
  action_type: string;
  user_id: Snowflake;
  target_id?: Snowflake;
  changes?: unknown;
  reason?: string;
  created_at: string;
}

export class REST {
  private baseUrl: string;
  private token?: string;
  private authScheme: 'Bot' | 'Bearer';
  private retries: number;
  private userAgent: string;

  constructor(opts: RESTOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.token = opts.token;
    this.authScheme = opts.authScheme ?? 'Bot';
    this.retries = opts.retries ?? 3;
    this.userAgent = opts.userAgent ?? 'strafebot-js/1.1';
  }

  setToken(token: string): this {
    this.token = token;
    return this;
  }

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

  get<T = unknown>(path: string, query?: RequestOptions['query']): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }
  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }
  patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }
  put<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }
  delete<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'DELETE', path, body });
  }

  // ---- Users ----
  getMe(): Promise<User> {
    return this.get<User>('/users/@me');
  }
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
  getMySpaces(): Promise<Space[]> {
    return this.get<Space[]>('/users/@me/spaces');
  }
  getSpaces(): Promise<Space[]> {
    return this.get<Space[]>('/spaces');
  }

  // ---- Spaces & Rooms ----
  getSpace(spaceId: Snowflake): Promise<Space> {
    return this.get<Space>(`/spaces/${spaceId}`);
  }
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
  leaveSpace(spaceId: Snowflake): Promise<void> {
    return this.post<void>(`/spaces/${spaceId}/leave`);
  }
  getAuditLog(
    spaceId: Snowflake,
    params?: { limit?: number; before?: Snowflake; action?: string },
  ): Promise<{ entries: AuditLogEntry[]; users: Record<Snowflake, User> }> {
    return this.get(`/spaces/${spaceId}/audit-log`, params);
  }
  getSpaceRooms(spaceId: Snowflake): Promise<Room[]> {
    return this.get<Room[]>(`/spaces/${spaceId}/rooms`);
  }
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
  deleteRoom(spaceId: Snowflake, roomId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/rooms/${roomId}`);
  }
  getRoom(roomId: Snowflake): Promise<Room> {
    return this.get<Room>(`/rooms/${roomId}`);
  }
  getPMRooms(): Promise<Room[]> {
    return this.get<Room[]>('/rooms');
  }
  openPM(body: { recipient_id?: Snowflake; recipient_handle?: string; name?: string; recipient_ids?: Snowflake[] }): Promise<Room> {
    return this.post<Room>('/rooms', body);
  }
  ackRoom(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.post<void>(`/rooms/${roomId}/ack`, { message_id: messageId });
  }

  // ---- Members, Roles & Bans ----
  getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]> {
    return this.get<SpaceMember[]>(`/spaces/${spaceId}/members`);
  }
  getSpaceMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember> {
    return this.get<SpaceMember>(`/spaces/${spaceId}/members/${userId}`);
  }
  setMemberRoles(spaceId: Snowflake, userId: Snowflake, roleIds: Snowflake[]): Promise<void> {
    return this.put<void>(`/spaces/${spaceId}/members/${userId}/roles`, { role_ids: roleIds });
  }
  kickMember(spaceId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/members/${userId}`);
  }
  banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<void> {
    return this.post<void>(
      `/spaces/${spaceId}/bans/${userId}`,
      reason ? { reason } : {},
    );
  }
  unbanMember(spaceId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/bans/${userId}`);
  }
  getSpaceBans(spaceId: Snowflake): Promise<{ bans: { user_id: Snowflake; reason?: string; banned_by: Snowflake; created_at: string }[]; users: Record<Snowflake, User> }> {
    return this.get(`/spaces/${spaceId}/bans`);
  }
  getSpaceRoles(spaceId: Snowflake): Promise<Role[]> {
    return this.get<Role[]>(`/spaces/${spaceId}/roles`);
  }
  createRole(
    spaceId: Snowflake,
    body: { name: string; permissions?: number; color?: number; hoist?: boolean; mentionable?: boolean },
  ): Promise<Role> {
    return this.post<Role>(`/spaces/${spaceId}/roles`, body);
  }
  editRole(
    spaceId: Snowflake,
    roleId: Snowflake,
    body: { name?: string; permissions?: number; color?: number; hoist?: boolean; mentionable?: boolean; position?: number },
  ): Promise<Role> {
    return this.patch<Role>(`/spaces/${spaceId}/roles/${roleId}`, body);
  }
  deleteRole(spaceId: Snowflake, roleId: Snowflake): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/roles/${roleId}`);
  }

  // ---- Messages, Pins & Reactions ----
  createMessage(
    roomId: Snowflake,
    body: CreateMessageBody | string,
  ): Promise<Message> {
    const payload: CreateMessageBody =
      typeof body === 'string' ? { plaintext: body } : body;
    return this.post<Message>(`/rooms/${roomId}/messages`, payload);
  }
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
  deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${roomId}/messages/${messageId}`);
  }
  listMessages(
    roomId: Snowflake,
    params?: { limit?: number; before?: Snowflake; after?: Snowflake },
  ): Promise<Message[]> {
    return this.get<Message[]>(`/rooms/${roomId}/messages`, params);
  }
  getMessage(roomId: Snowflake, messageId: Snowflake): Promise<Message> {
    return this.get<Message>(`/rooms/${roomId}/messages/${messageId}`);
  }
  searchRoomMessages(
    roomId: Snowflake,
    params: { q?: string; has?: 'link' | 'file' | 'image' | 'video' | 'audio'; limit?: number },
  ): Promise<Message[]> {
    return this.get<Message[]>(`/rooms/${roomId}/messages/search`, params);
  }
  searchSpaceMessages(
    spaceId: Snowflake,
    params: { q?: string; has?: 'link' | 'file' | 'image' | 'video' | 'audio'; limit?: number },
  ): Promise<Message[]> {
    return this.get<Message[]>(`/spaces/${spaceId}/messages/search`, params);
  }
  triggerTyping(roomId: Snowflake): Promise<void> {
    return this.post<void>(`/rooms/${roomId}/typing`);
  }
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
  pinMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.put<void>(`/rooms/${roomId}/messages/${messageId}/pin`);
  }
  unpinMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${roomId}/messages/${messageId}/pin`);
  }
  getPinnedMessages(
    roomId: Snowflake,
  ): Promise<{ items: { pinned_at: string; pinned_by: Snowflake; message: Message }[]; has_more: boolean }> {
    return this.get(`/rooms/${roomId}/pins`);
  }

  // ---- Threads ----
  createThreadFromMessage(
    roomId: Snowflake,
    messageId: Snowflake,
    body: { name: string; auto_archive_minutes?: 60 | 1440 | 4320 | 10080 },
  ): Promise<Room> {
    return this.post<Room>(`/rooms/${roomId}/messages/${messageId}/threads`, body);
  }
  createThread(
    roomId: Snowflake,
    body: { name: string; auto_archive_minutes?: 60 | 1440 | 4320 | 10080; private?: boolean; invitable?: boolean },
  ): Promise<Room> {
    return this.post<Room>(`/rooms/${roomId}/threads`, body);
  }
  getThread(threadId: Snowflake): Promise<Room & { thread: ThreadMetadata }> {
    return this.get(`/rooms/${threadId}/thread`);
  }
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
  deleteThread(threadId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${threadId}/thread`);
  }
  getThreadMembers(threadId: Snowflake): Promise<{ user_id: Snowflake; joined_at: string; user?: User }[]> {
    return this.get(`/rooms/${threadId}/thread-members`);
  }
  joinThread(threadId: Snowflake): Promise<void> {
    return this.put<void>(`/rooms/${threadId}/thread-members/@me`);
  }
  leaveThread(threadId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${threadId}/thread-members/@me`);
  }
  addThreadMember(threadId: Snowflake, userId: Snowflake): Promise<void> {
    return this.put<void>(`/rooms/${threadId}/thread-members/${userId}`);
  }
  removeThreadMember(threadId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete<void>(`/rooms/${threadId}/thread-members/${userId}`);
  }
  getActiveThreads(spaceId: Snowflake): Promise<{ threads: Room[] }> {
    return this.get(`/spaces/${spaceId}/threads/active`);
  }
  getArchivedThreads(
    roomId: Snowflake,
    params?: { before?: string; limit?: number },
  ): Promise<{ threads: Room[]; has_more: boolean }> {
    return this.get(`/rooms/${roomId}/threads/archived`, params);
  }

  // ---- Invites & Attachments ----
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
  getSpaceInvites(spaceId: Snowflake): Promise<Invite[]> {
    return this.get<Invite[]>(`/spaces/${spaceId}/invites`);
  }
  deleteInvite(spaceId: Snowflake, code: string): Promise<void> {
    return this.delete<void>(`/spaces/${spaceId}/invites/${code}`);
  }
  getInvite(code: string): Promise<{ space: Partial<Space>; inviter_display_name?: string }> {
    return this.get(`/spaces/invites/${code}`);
  }

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
      // Official signature: uploadAttachment(roomId, file, filename, { width?, height? })
      path = `/rooms/${roomIdOrFile}/attachments`;
      file = fileOrFilename as Blob | Buffer;
      filename = typeof filenameOrOpts === 'string' ? filenameOrOpts : 'attachment';
      dimensions = opts;
    } else {
      // Backwards-compatible signature: uploadAttachment(file, filename, uploadUrl?)
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
