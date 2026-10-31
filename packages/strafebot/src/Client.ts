import { EventEmitter } from 'node:events';
import {
  ALL_PERMISSIONS,
  BitField,
  BotInviteUrlOptions,
  isEncryptedMessage,
  isEncryptedRoom,
  Message,
  Permission,
  PermissionOverride,
  ReadyPayload,
  Role,
  Room,
  RoomType,
  Snowflake,
  Space,
  SpaceMember,
  User,
} from '@strafe-js/util';
import { generateBotInviteUrl } from '@strafe-js/builders';
import { Collection } from '@strafe-js/collection';
import { REST, RESTOptions } from '@strafe-js/rest';
import { Gateway, GatewayOptions, GatewayEvents } from '@strafe-js/ws';
import { CommandHandler, CommandHandlerOptions, CommandEvents } from './commands/CommandHandler.js';

export interface ClientOptions {
  apiBase: string;
  gatewayUrl: string;
  token?: string;
  authScheme?: 'Bot' | 'Bearer';
  prefix?: string | string[];
  owners?: Snowflake[];
  autoSubscribeSpaces?: boolean;
  autoFetchMembersOnReady?: boolean;
  heartbeatIntervalMs?: number;
  rest?: Partial<RESTOptions>;
  gateway?: Partial<GatewayOptions>;
  commands?: Partial<CommandHandlerOptions>;
}

export interface AwaitMessagesOptions {
  filter?: (message: Message) => boolean | Promise<boolean>;
  max?: number;
  timeoutMs?: number;
}

export interface ReactionEventPayload {
  room_id: Snowflake;
  message_id: Snowflake;
  user_id: Snowflake;
  emoji: string;
}

export interface AwaitReactionsOptions {
  filter?: (reaction: ReactionEventPayload) => boolean | Promise<boolean>;
  max?: number;
  timeoutMs?: number;
}

export type ClientEvents = GatewayEvents &
  CommandEvents & {
    encryptedMessageCreate: (message: Message) => void;
  };

export declare interface Client {
  on<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
  on(event: string, listener: (...args: any[]) => void): this;
  once<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
  once(event: string, listener: (...args: any[]) => void): this;
  emit<E extends keyof ClientEvents>(event: E, ...args: Parameters<ClientEvents[E]>): boolean;
  emit(event: string, ...args: any[]): boolean;
}

export class Client extends EventEmitter {
  readonly rest: REST;
  gateway!: Gateway;
  readonly commands: CommandHandler;
  user: User | null = null;
  readonly spaces = new Collection<Snowflake, Space>();
  readonly rooms = new Collection<Snowflake, Room>();
  readonly spaceRooms = new Collection<Snowflake, Collection<Snowflake, Room>>();
  readonly members = new Collection<Snowflake, Collection<Snowflake, SpaceMember>>();

  private opts: ClientOptions;
  private _fetchingMembers = new Map<string, Promise<SpaceMember | null>>();

  constructor(opts: ClientOptions) {
    super();
    this.opts = opts;
    this.rest = new REST({
      baseUrl: opts.apiBase,
      token: opts.token,
      authScheme: opts.authScheme,
      ...opts.rest,
    });
    this.commands = new CommandHandler(this, {
      prefix: opts.prefix,
      owners: opts.owners,
      ...opts.commands,
    });
  }

  async login(token?: string): Promise<this> {
    const tok = token ?? this.opts.token;
    if (!tok) throw new Error('Bot token required to login');
    this.opts.token = tok;
    this.rest.setToken(tok);

    this.gateway = new Gateway({
      url: this.opts.gatewayUrl,
      token: tok,
      authScheme: this.opts.authScheme ?? 'Bot',
      heartbeatIntervalMs: this.opts.heartbeatIntervalMs,
      ...this.opts.gateway,
    });

    this._wireGateway();
    this.commands.attach();
    this.gateway.connect();
    return this;
  }

  connect(token?: string): Promise<this> {
    return this.login(token);
  }

  destroy(): void {
    this.gateway?.disconnect();
    this.removeAllListeners();
  }

  async fetchMembers(spaceId: Snowflake): Promise<Collection<Snowflake, SpaceMember>> {
    const list = await this.rest.getSpaceMembers(spaceId);
    let col = this.members.get(spaceId);
    if (!col) {
      col = new Collection();
      this.members.set(spaceId, col);
    }
    for (const m of list) {
      if (!m.role_ids && m.roles) m.role_ids = m.roles;
      col.set(m.user_id, m);
    }
    return col;
  }

  async fetchMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember | null> {
    const key = `${spaceId}:${userId}`;
    const existing = this._fetchingMembers.get(key);
    if (existing) return existing;

    const promise = (async () => {
      try {
        const m = await this.rest.getSpaceMember(spaceId, userId);
        if (!m.role_ids && m.roles) m.role_ids = m.roles;
        let col = this.members.get(spaceId);
        if (!col) {
          col = new Collection();
          this.members.set(spaceId, col);
        }
        col.set(m.user_id, m);
        return m;
      } catch {
        return null;
      } finally {
        this._fetchingMembers.delete(key);
      }
    })();

    this._fetchingMembers.set(key, promise);
    return promise;
  }

  getMember(spaceId: Snowflake, userId: Snowflake): SpaceMember | undefined {
    return this.members.get(spaceId)?.get(userId);
  }

  isRoomEncrypted(roomId: Snowflake): boolean {
    return isEncryptedRoom(this.rooms.get(roomId));
  }

  awaitMessages(
    roomId: Snowflake,
    opts: AwaitMessagesOptions = {},
  ): Promise<Collection<Snowflake, Message>> {
    const max = opts.max ?? 1;
    const timeoutMs = opts.timeoutMs ?? 30_000;
    const collected = new Collection<Snowflake, Message>();
    if (max <= 0) return Promise.resolve(collected);
    return new Promise((resolve) => {
      let settled = false;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.off('messageCreate', onMessage);
        resolve(collected);
      };
      const onMessage = async (msg: Message) => {
        if (settled || msg.room_id !== roomId) return;
        try {
          const matched = opts.filter ? await opts.filter(msg) : true;
          if (!matched || settled) return;
          collected.set(msg.id, msg);
          if (collected.size >= max) cleanup();
        } catch {
          /* ignore */
        }
      };
      const timer = setTimeout(cleanup, timeoutMs);
      this.on('messageCreate', onMessage);
    });
  }

  awaitReactions(
    roomId: Snowflake,
    messageId: Snowflake,
    opts: AwaitReactionsOptions = {},
  ): Promise<ReactionEventPayload[]> {
    const max = opts.max ?? 1;
    const timeoutMs = opts.timeoutMs ?? 30_000;
    const collected: ReactionEventPayload[] = [];
    if (max <= 0) return Promise.resolve(collected);
    return new Promise((resolve) => {
      let settled = false;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.off('messageReactionAdd', onReaction);
        resolve(collected);
      };
      const onReaction = async (data: ReactionEventPayload) => {
        if (settled || data.room_id !== roomId || data.message_id !== messageId) return;
        try {
          const matched = opts.filter ? await opts.filter(data) : true;
          if (!matched || settled) return;
          collected.push(data);
          if (collected.length >= max) cleanup();
        } catch {
          /* ignore */
        }
      };
      const timer = setTimeout(cleanup, timeoutMs);
      this.on('messageReactionAdd', onReaction);
    });
  }

  generateInviteUrl(
    opts: Omit<BotInviteUrlOptions, 'clientId' | 'baseUrl'> & {
      clientId?: Snowflake;
      baseUrl?: string;
    } = {},
  ): string {
    const clientId = opts.clientId ?? this.user?.id;
    if (!clientId) throw new Error('clientId is required before client is ready');
    return generateBotInviteUrl({
      ...opts,
      clientId,
      baseUrl: opts.baseUrl ?? this.opts.apiBase,
    });
  }

  canModerate(actorId: Snowflake, targetId: Snowflake, spaceId: Snowflake): boolean {
    if (actorId === targetId) return false;
    const space = this.spaces.get(spaceId);
    if (!space) return false;
    if (targetId === space.owner_id) return false;
    if (actorId === space.owner_id) return true;
    const roles = [...(space.roles ?? [])].sort((a, b) => (b.position ?? 0) - (a.position ?? 0));
    const rolePos = (userId: Snowflake): number => {
      const m = this.getMember(spaceId, userId);
      const ids = m?.role_ids ?? m?.roles ?? [];
      let max = -1;
      for (const rid of ids) {
        const r = roles.find((x) => x.id === rid);
        if (r && (r.position ?? 0) > max) max = r.position ?? 0;
      }
      return max;
    };
    return rolePos(actorId) > rolePos(targetId);
  }

  resolveMemberPermissions(
    userId: Snowflake,
    spaceId?: Snowflake | null,
    roomId?: Snowflake | null,
  ): number {
    if (!spaceId) return 0;
    const space = this.spaces.get(spaceId);
    if (!space) return 0;
    if (space.owner_id === userId) return ALL_PERMISSIONS;

    const member = this.getMember(spaceId, userId);
    const rolesById = new Map((space.roles ?? []).map((r) => [r.id, r]));

    let mask = 0;
    if (space.everyone_role_id) {
      const ev = rolesById.get(space.everyone_role_id);
      if (ev) mask |= ev.permissions;
    }
    const memberRoleIds = member?.role_ids ?? member?.roles ?? [];
    if (member) {
      for (const rid of memberRoleIds) {
        const role = rolesById.get(rid);
        if (role) mask |= role.permissions;
      }
    }
    if ((mask & Permission.Administrator) === Permission.Administrator) {
      return ALL_PERMISSIONS;
    }

    if (roomId) {
      const room = this.rooms.get(roomId);
      const effectiveRoom =
        room?.type === RoomType.Thread &&
        room.parent_id &&
        !(room.permission_overrides?.length || room.user_overrides?.length)
          ? this.rooms.get(room.parent_id) ?? room
          : room;
      const roleOverrides = effectiveRoom?.permission_overrides ?? [];
      const userOverrides = effectiveRoom?.user_overrides ?? [];
      if (roleOverrides.length > 0) {
        if (space.everyone_role_id) {
          const everyoneOv = roleOverrides.find((o) => o.role_id === space.everyone_role_id);
          if (everyoneOv) {
            mask &= ~everyoneOv.deny;
            mask |= everyoneOv.allow;
          }
        }
        if (member) {
          let aggregatedAllow = 0;
          let aggregatedDeny = 0;
          for (const rid of memberRoleIds) {
            const roleOv = roleOverrides.find((o) => o.role_id === rid);
            if (roleOv) {
              aggregatedDeny |= roleOv.deny;
              aggregatedAllow |= roleOv.allow;
            }
          }
          mask &= ~aggregatedDeny;
          mask |= aggregatedAllow;
        }
        const userOv =
          userOverrides.find((o) => o.user_id === userId) ??
          roleOverrides.find((o) => o.user_id === userId);
        if (userOv) {
          mask &= ~userOv.deny;
          mask |= userOv.allow;
        }
      } else if (userOverrides.length > 0) {
        const userOv = userOverrides.find((o) => o.user_id === userId);
        if (userOv) {
          mask &= ~userOv.deny;
          mask |= userOv.allow;
        }
      }
      if (
        room?.type === RoomType.Thread &&
        room.thread?.private &&
        (mask & Permission.ManageThreads) === 0 &&
        room.thread.owner_id !== userId &&
        !(userId === this.user?.id && room.thread.joined)
      ) {
        return 0;
      }
    }

    if ((mask & Permission.ViewRoom) === 0) return 0;
    if ((mask & Permission.SendMessages) === 0) {
      mask &= ~(Permission.AttachFiles | Permission.MentionEveryone);
    }
    return mask;
  }

  private _cacheRoom(r: Room, fallbackSpaceId?: Snowflake): void {
    const sid = r.space_id ?? fallbackSpaceId;
    if (sid && !r.space_id) r.space_id = sid;
    this.rooms.set(r.id, r);
    if (sid) {
      let col = this.spaceRooms.get(sid);
      if (!col) {
        col = new Collection();
        this.spaceRooms.set(sid, col);
      }
      col.set(r.id, r);
    }
  }

  private _wireGateway(): void {
    this.gateway.on('ready', (payload: ReadyPayload) => {
      this.user = payload.user;
      for (const s of payload.spaces ?? []) {
        this.spaces.set(s.id, s);
        if (!this.spaceRooms.has(s.id)) {
          this.spaceRooms.set(s.id, new Collection());
        }
        for (const r of s.rooms ?? []) {
          this._cacheRoom(r, s.id);
        }
        if (this.opts.autoSubscribeSpaces ?? true) {
          this.gateway.subscribe(s.id);
        }
      }
      for (const r of payload.rooms ?? []) {
        this._cacheRoom(r);
      }
      if (payload.space_rooms) {
        for (const [spaceId, roomList] of Object.entries(payload.space_rooms)) {
          for (const r of roomList ?? []) {
            this._cacheRoom(r, spaceId);
          }
        }
      }
      if (this.opts.autoFetchMembersOnReady) {
        for (const s of payload.spaces ?? []) {
          void this.fetchMembers(s.id).catch(() => {});
        }
      }
      this.emit('ready', payload);
    });

    this.gateway.on('raw', (frame) => {
      const rawD = frame.d as Record<string, unknown> | undefined;
      const isNested =
        !frame.t &&
        rawD !== null &&
        typeof rawD === 'object' &&
        typeof rawD.t === 'string';
      const eventType = isNested ? (rawD.t as string) : frame.t;
      if (!eventType) return;
      const name = eventType
        .toLowerCase()
        .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      const d = (isNested ? rawD.d : frame.d) as Record<string, unknown> | undefined;
      const envelopeSpaceId = (isNested ? rawD.space_id : frame.space_id) as Snowflake | undefined;

      if (name === 'spaceCreate' || name === 'spaceUpdate') {
        const s = d as unknown as Space;
        if (s?.id) {
          const prev = this.spaces.get(s.id);
          this.spaces.set(s.id, { ...prev, ...s });
          if (name === 'spaceCreate' && (this.opts.autoSubscribeSpaces ?? true)) {
            this.gateway.subscribe(s.id);
          }
        }
      } else if (name === 'spaceDelete' || name === 'spaceLeave') {
        const id = (d?.id ?? d?.space_id ?? envelopeSpaceId) as Snowflake | undefined;
        if (id) {
          this.spaces.delete(id);
          const sr = this.spaceRooms.get(id);
          if (sr) {
            for (const rid of sr.keys()) this.rooms.delete(rid);
            this.spaceRooms.delete(id);
          }
          this.members.delete(id);
        }
      } else if (
        name === 'roomCreate' ||
        name === 'roomUpdate' ||
        name === 'spaceRoomCreate' ||
        name === 'spaceRoomUpdate' ||
        name === 'threadCreate' ||
        name === 'threadUpdate'
      ) {
        const r = d as unknown as Room;
        if (r?.id) {
          const prev = this.rooms.get(r.id);
          this._cacheRoom({ ...prev, ...r }, envelopeSpaceId);
        }
      } else if (
        name === 'roomDelete' ||
        name === 'spaceRoomDelete' ||
        name === 'threadDelete' ||
        name === 'roomLeave'
      ) {
        const id = (d?.id ?? d?.room_id) as Snowflake | undefined;
        const sid = (d?.space_id ?? envelopeSpaceId) as Snowflake | undefined;
        if (id) {
          const existing = this.rooms.get(id);
          this.rooms.delete(id);
          const targetSid = sid ?? existing?.space_id;
          if (targetSid) this.spaceRooms.get(targetSid)?.delete(id);
        }
      } else if (name === 'spaceMemberAdd' || name === 'spaceMemberUpdate') {
        const m = d as unknown as SpaceMember & { space_id?: Snowflake };
        const sid = m?.space_id ?? envelopeSpaceId;
        if (sid && m?.user_id) {
          if (!m.role_ids && m.roles) m.role_ids = m.roles;
          let col = this.members.get(sid);
          if (!col) {
            col = new Collection();
            this.members.set(sid, col);
          }
          const prev = col.get(m.user_id);
          col.set(m.user_id, { ...prev, ...m });
        }
      } else if (name === 'spaceMemberRemove') {
        const uid = d?.user_id as Snowflake | undefined;
        const sid = (d?.space_id ?? envelopeSpaceId) as Snowflake | undefined;
        if (sid && uid) this.members.get(sid)?.delete(uid);
      } else if (name === 'messageCreate') {
        const msg = d as unknown as Message;
        if (msg && isEncryptedMessage(msg)) {
          this.emit('encryptedMessageCreate', msg);
        }
      }
    });

    const forward = [
      'messageCreate',
      'messageUpdate',
      'messageDelete',
      'messageReactionAdd',
      'messageReactionRemove',
      'typingStart',
      'presenceUpdate',
      'userUpdate',
      'sessionRevoked',
      'error',
      'close',
      'open',
      'pong',
    ] as const;
    for (const ev of forward) {
      this.gateway.on(ev as any, (...args: any[]) => {
        this.emit(ev as any, ...args);
      });
    }
  }
}
