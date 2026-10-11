import {
  StrafeError,
  RateLimitError,
  sleep,
  type Snowflake,
  type User,
  type Space,
  type Room,
  type Message,
  type SpaceMember,
  type CreateMessageBody,
  type Attachment,
} from '@strafe-js/util';

export interface RESTOptions {
  apiBase: string;
  token?: string;
  tokenType?: 'Bot' | 'Bearer';
  retries?: number;
}

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  headers?: Record<string, string>;
  raw?: boolean;
}

export class REST {
  apiBase: string;
  token: string | null;
  tokenType: 'Bot' | 'Bearer';
  retries: number;

  constructor(opts: RESTOptions) {
    this.apiBase = opts.apiBase.replace(/\/$/, '');
    this.token = opts.token ?? null;
    this.tokenType = opts.tokenType ?? 'Bot';
    this.retries = opts.retries ?? 3;
  }

  setToken(token: string, type: 'Bot' | 'Bearer' = 'Bot'): void {
    this.token = token;
    this.tokenType = type;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(`${this.apiBase}${path.startsWith('/') ? path : `/${path}`}`);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v != null) url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = { ...(opts.headers ?? {}) };
    if (this.token) headers['Authorization'] = `${this.tokenType} ${this.token}`;

    let payload: BodyInit | undefined;
    if (opts.body !== undefined && opts.body !== null) {
      if (typeof FormData !== 'undefined' && opts.body instanceof FormData) {
        payload = opts.body;
      } else {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(opts.body);
      }
    }

    let attempt = 0;
    while (true) {
      const res = await fetch(url, { method, headers, body: payload });

      if (res.status === 429) {
        const retryAfterHeader = Number(res.headers.get('Retry-After') || 1);
        let bodyJson: { error?: string; retry_after?: number } | null = null;
        try {
          bodyJson = (await res.json()) as { error?: string; retry_after?: number };
        } catch {
          /* ignore */
        }
        const wait = bodyJson?.retry_after ?? retryAfterHeader;
        if (attempt >= this.retries) {
          throw new RateLimitError(bodyJson?.error || 'rate limited', wait, res.status);
        }
        await sleep(wait * 1000);
        attempt++;
        continue;
      }

      if (res.status === 204) return null as T;

      const text = await res.text();
      let data: unknown = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!res.ok) {
        const msg =
          data && typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: string }).error)
            : `HTTP ${res.status}`;
        const code =
          data && typeof data === 'object' && data !== null && 'code' in data
            ? (data as { code: string | number }).code
            : null;
        throw new StrafeError(msg, res.status, code, data);
      }

      return data as T;
    }
  }

  get<T = unknown>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, opts);
  }
  post<T = unknown>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, opts);
  }
  patch<T = unknown>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, opts);
  }
  put<T = unknown>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, opts);
  }
  delete<T = unknown>(path: string, opts?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, opts);
  }

  getMe(): Promise<User> {
    return this.get<User>('/users/@me');
  }

  getMySpaces(): Promise<Space[]> {
    return this.get<Space[]>('/users/@me/spaces');
  }

  getSpaces(): Promise<Space[]> {
    return this.get<Space[]>('/spaces');
  }

  getSpace(id: Snowflake): Promise<Space> {
    return this.get<Space>(`/spaces/${id}`);
  }

  getSpaceRooms(spaceId: Snowflake): Promise<Room[]> {
    return this.get<Room[]>(`/spaces/${spaceId}/rooms`);
  }

  getSpaceMembers(spaceId: Snowflake): Promise<SpaceMember[]> {
    return this.get<SpaceMember[]>(`/spaces/${spaceId}/members`);
  }

  getSpaceMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember> {
    return this.get<SpaceMember>(`/spaces/${spaceId}/members/${userId}`);
  }

  createMessage(roomId: Snowflake, body: CreateMessageBody): Promise<Message> {
    return this.post<Message>(`/rooms/${roomId}/messages`, { body });
  }

  editMessage(roomId: Snowflake, messageId: Snowflake, body: { plaintext: string }): Promise<Message> {
    return this.patch<Message>(`/rooms/${roomId}/messages/${messageId}`, { body });
  }

  deleteMessage(roomId: Snowflake, messageId: Snowflake): Promise<null> {
    return this.delete<null>(`/rooms/${roomId}/messages/${messageId}`);
  }

  listMessages(
    roomId: Snowflake,
    params: { before?: Snowflake; after?: Snowflake; around?: Snowflake; limit?: number } = {},
  ): Promise<Message[]> {
    return this.get<Message[]>(`/rooms/${roomId}/messages`, { query: params });
  }

  getMessage(roomId: Snowflake, messageId: Snowflake): Promise<Message> {
    return this.get<Message>(`/rooms/${roomId}/messages/${messageId}`);
  }

  triggerTyping(roomId: Snowflake): Promise<null> {
    return this.post<null>(`/rooms/${roomId}/typing`);
  }

  addReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<null> {
    return this.put<null>(`/rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
  }

  removeReaction(roomId: Snowflake, messageId: Snowflake, emoji: string): Promise<null> {
    return this.delete<null>(`/rooms/${roomId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
  }

  createInvite(
    spaceId: Snowflake,
    opts: { max_age_seconds?: number; max_uses?: number } = {},
  ): Promise<{ code: string; space_id: Snowflake; inviter_id: Snowflake }> {
    return this.post(`/spaces/${spaceId}/invites`, { body: opts });
  }

  kickMember(spaceId: Snowflake, userId: Snowflake): Promise<null> {
    return this.delete<null>(`/spaces/${spaceId}/members/${userId}`);
  }

  banMember(spaceId: Snowflake, userId: Snowflake, reason?: string): Promise<null> {
    return this.post<null>(`/spaces/${spaceId}/bans/${userId}`, {
      body: reason ? { reason } : {},
    });
  }

  async uploadAttachment(
    roomId: Snowflake,
    file: Blob | Buffer,
    opts: { filename?: string; width?: number; height?: number } = {},
  ): Promise<Attachment> {
    const form = new FormData();
    const blob =
      file instanceof Blob
        ? file
        : new Blob([file as BlobPart]);
    form.append('file', blob, opts.filename ?? 'upload');
    if (opts.width != null) form.append('width', String(opts.width));
    if (opts.height != null) form.append('height', String(opts.height));
    return this.post<Attachment>(`/rooms/${roomId}/attachments`, { body: form });
  }
}
