import {
  Attachment,
  CreateMessageBody,
  EditMessageBody,
  Message,
  OAuth2Application,
  OAuth2ApplicationPublic,
  OAuth2Grant,
  OAuth2TokenInfo,
  OAuth2TokenResponse,
  PermissionOverride,
  PushPreferences,
  PushSubscriptionInput,
  PushSubscriptionRecord,
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
  auth?: boolean;
}

export interface Invite {
  code: string;
  space_id?: Snowflake;
  inviter_id?: Snowflake;
  max_uses?: number;
  current_uses?: number;
  max_age?: number;
  temporary?: boolean;
  created_at?: string;
}

export interface AuditLogEntry {
  id: Snowflake;
  action_type?: string;
  actor_id?: Snowflake;
  target_id?: Snowflake;
  reason?: string;
  created_at?: string;
  changes?: unknown[];
}

export class REST {
  private baseUrl: string;
  private token?: string;
  private authScheme: string;
  private retries: number;
  private userAgent: string;

  constructor(opts: RESTOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.token = opts.token;
    this.authScheme = opts.authScheme ?? 'Bot';
    this.retries = opts.retries ?? 3;
    this.userAgent = opts.userAgent ?? 'strafebot-js/1.3.0';
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
    if (this.token && opts.auth !== false && !headers['Authorization']) {
      headers['Authorization'] = `${this.authScheme} ${this.token}`;
    }

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
        const errField =
          typeof data === 'object' && data && 'error' in data
            ? String((data as { error: unknown }).error)
            : undefined;
        const errDesc =
          typeof data === 'object' && data && 'error_description' in data
            ? String((data as { error_description: unknown }).error_description)
            : undefined;
        const msg = errDesc ?? errField ?? `HTTP ${res.status} ${res.statusText}`;
        const code =
          typeof data === 'object' && data && 'code' in data
            ? String((data as { code: unknown }).code)
            : errDesc && errField
            ? errField
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

  delete<T = unknown>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }

  getMe(): Promise<User> {
    return this.get('/users/@me');
  }

  getUser(userId: Snowflake): Promise<User> {
    return this.get(`/users/${userId}`);
  }

  getSpace(spaceId: Snowflake): Promise<Space> {
    return this.get(`/spaces/${spaceId}`);
  }

  getSpaceRooms(spaceId: Snowflake): Promise<Room[]> {
    return this.get(`/spaces/${spaceId}/rooms`);
  }

  getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]> {
    return this.get(`/spaces/${spaceId}/members`);
  }

  getSpaceMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember> {
    return this.get(`/spaces/${spaceId}/members/${userId}`);
  }

  kickMember(spaceId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete(`/spaces/${spaceId}/members/${userId}`);
  }

  banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<void> {
    return this.post(`/spaces/${spaceId}/bans/${userId}`, reason ? { reason } : {});
  }

  unbanMember(spaceId: Snowflake, userId: Snowflake): Promise<void> {
    return this.delete(`/spaces/${spaceId}/bans/${userId}`);
  }

  getSpaceBans(spaceId: Snowflake): Promise<{
    bans: { user_id: Snowflake; reason?: string; banned_by: Snowflake; created_at: string }[];
    users: Record<Snowflake, User>;
  }> {
    return this.get(`/spaces/${spaceId}/bans`);
  }

  getAuditLog(
    spaceId: Snowflake,
    params?: { limit?: number; before?: Snowflake; action_type?: string },
  ): Promise<{ entries: AuditLogEntry[]; users?: Record<Snowflake, User> }> {
    return this.get(`/spaces/${spaceId}/audit-log`, params as RequestOptions['query']);
  }

  getRoom(roomId: Snowflake): Promise<Room> {
    return this.get(`/rooms/${roomId}`);
  }

  getMessages(
    roomId: Snowflake,
    query?: { limit?: number; before?: Snowflake; after?: Snowflake },
  ): Promise<Message[]> {
    return this.get(`/rooms/${roomId}/messages`, query);
  }

  createMessage(
    roomId: Snowflake,
    body: string | CreateMessageBody,
  ): Promise<Message> {
    const payload = typeof body === 'string' ? { plaintext: body } : body;
    return this.post(`/rooms/${roomId}/messages`, payload);
  }

  editMessage(
    roomId: Snowflake,
    messageId: Snowflake,
    body: string | EditMessageBody,
  ): Promise<Message> {
    const payload = typeof body === 'string' ? { plaintext: body } : body;
    return this.patch(`/rooms/${roomId}/messages/${messageId}`, payload);
  }

  deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<void> {
    return this.delete(`/rooms/${roomId}/messages/${messageId}`);
  }

  triggerTyping(roomId: Snowflake): Promise<void> {
    return this.post(`/rooms/${roomId}/typing`);
  }

  addReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    return this.put(
      `/rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
    );
  }

  removeReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<void> {
    return this.delete(
      `/rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
    );
  }

  createDM(recipientId: Snowflake): Promise<Room> {
    return this.post('/users/@me/rooms', { recipient_id: recipientId });
  }

  private async _uploadMultipartFile<T>(
    path: string,
    file: Blob | Buffer,
    filename: string,
  ): Promise<T> {
    const form = new FormData();
    const blob =
      file instanceof Blob
        ? file
        : new Blob([file as any]);
    form.append('file', blob, filename);
    return this.request<T>({ method: 'POST', path, body: form });
  }
}
