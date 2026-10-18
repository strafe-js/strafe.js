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

/**
 * Configuration options for {@link Client}.
 */
export interface ClientOptions {
  /** Base URL for the Strafe REST API (for example `'https://app.strafe.chat/api'`). */
  apiBase: string;
  /** Full WebSocket URL for the Strafe Gateway (for example `'wss://app.strafe.chat/gateway/events'`). */
  gatewayUrl: string;
  /** Bot authentication token. Can also be supplied later via {@link Client.login}. */
  token?: string;
  /** Authorization header prefix (`'Bot'` or `'Bearer'`). Defaults to `'Bot'`. */
  authScheme?: 'Bot' | 'Bearer';
  /** Single prefix string or array of prefixes matched by {@link CommandHandler}. Defaults to `'!'`. */
  prefix?: string | string[];
  /** Bot owner user Snowflake IDs allowed to execute `botOwnerOnly` commands. */
  owners?: Snowflake[];
  /** Whether to automatically send `GatewayOp.Subscribe` (`op: 1`) for every space on `READY` and `SPACE_CREATE`. Defaults to `true`. */
  autoSubscribeSpaces?: boolean;
  /** Interval in milliseconds between gateway heartbeat pings (`op: 6`). Defaults to `45000`. */
  heartbeatIntervalMs?: number;
  /** Additional overrides forwarded to the underlying {@link REST} constructor. */
  rest?: Partial<RESTOptions>;
  /** Additional overrides forwarded to the underlying {@link Gateway} constructor. */
  gateway?: Partial<GatewayOptions>;
  /** Additional overrides forwarded to the underlying {@link CommandHandler} constructor. */
  commands?: Partial<CommandHandlerOptions>;
}

/**
 * Options for collecting incoming messages in a room via {@link Client.awaitMessages} or {@link Context.awaitMessages}.
 */
export interface AwaitMessagesOptions {
  /** Optional predicate to filter incoming messages in the target room. */
  filter?: (message: Message) => boolean | Promise<boolean>;
  /** Maximum number of matching messages to collect before resolving early. Defaults to `1`. */
  max?: number;
  /** Maximum wait duration in milliseconds before resolving with collected messages. Defaults to `30000`. */
  timeoutMs?: number;
}

/**
 * Payload received when a user adds a reaction to a message (`MESSAGE_REACTION_ADD`).
 */
export interface ReactionEventPayload {
  /** Room Snowflake ID where the reaction occurred. */
  room_id: Snowflake;
  /** Target Message Snowflake ID. */
  message_id: Snowflake;
  /** User Snowflake ID who added the reaction. */
  user_id: Snowflake;
  /** Unicode emoji or `custom:<id>` identifier. */
  emoji: string;
}

/**
 * Options for collecting incoming reactions on a message via {@link Client.awaitReactions} or {@link Context.awaitReactions}.
 */
export interface AwaitReactionsOptions {
  /** Optional predicate to filter incoming reactions on the target message. */
  filter?: (reaction: ReactionEventPayload) => boolean | Promise<boolean>;
  /** Maximum number of matching reactions to collect before resolving early. Defaults to `1`. */
  max?: number;
  /** Maximum wait duration in milliseconds before resolving with collected reactions. Defaults to `30000`. */
  timeoutMs?: number;
}

/**
 * Combined event map emitted by {@link Client}, merging real-time {@link GatewayEvents}, {@link CommandEvents},
 * and E2EE room notifications.
 */
export type ClientEvents = GatewayEvents &
  CommandEvents & {
    /** Emitted when a `MESSAGE_CREATE` frame arrives from an end-to-end encrypted room (`ciphertext` without `plaintext`). */
    encryptedMessageCreate: (message: Message) => void;
  };

export declare interface Client {
  /** Registers a typed listener for a {@link ClientEvents} event. */
  on<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
  /** Registers a listener for a custom or unmapped event name. */
  on(event: string, listener: (...args: any[]) => void): this;
  /** Registers a one-time typed listener for a {@link ClientEvents} event. */
  once<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
  /** Registers a one-time listener for a custom or unmapped event name. */
  once(event: string, listener: (...args: any[]) => void): this;
  /** Emits a typed {@link ClientEvents} event to all registered listeners. */
  emit<E extends keyof ClientEvents>(event: E, ...args: Parameters<ClientEvents[E]>): boolean;
  /** Emits a custom event to all registered listeners. */
  emit(event: string, ...args: any[]): boolean;
}

/**
 * High-level Strafe bot client combining the {@link REST} HTTP client, {@link Gateway} WebSocket manager,
 * live entity caches (`spaces`, `rooms`, `spaceRooms`, `members`), the 6-stage Equinox permission resolver,
 * and the prefix {@link CommandHandler}.
 *
 * @example
 * ```ts
 * import { Client, command } from '@strafe-js/strafebot';
 *
 * const client = new Client({
 *   apiBase: 'https://app.strafe.chat/api',
 *   gatewayUrl: 'wss://app.strafe.chat/gateway/events',
 *   prefix: '!',
 * });
 *
 * client.commands.register(
 *   command({
 *     name: 'ping',
 *     async run(ctx) {
 *       await ctx.reply('Pong!');
 *     },
 *   }),
 * );
 *
 * await client.login(process.env.BOT_TOKEN!);
 * ```
 */
export class Client extends EventEmitter {
  /** Underlying HTTP client for direct Strafe REST API calls. */
  readonly rest: REST;
  /** Underlying WebSocket gateway connection (initialized when {@link Client.login} is called). */
  gateway!: Gateway;
  /** Built-in prefix command registry and message dispatcher. */
  readonly commands: CommandHandler;
  /** Authenticated bot {@link User} profile populated once the `ready` event fires (`null` before ready). */
  user: User | null = null;
  /** Live cache of spaces keyed by `spaceId`. */
  readonly spaces = new Collection<Snowflake, Space>();
  /** Live cache of rooms across all spaces and DMs keyed by `roomId`. */
  readonly rooms = new Collection<Snowflake, Room>();
  /** Live cache of space rooms grouped by `spaceId -> Collection<roomId, Room>`. */
  readonly spaceRooms = new Collection<Snowflake, Collection<Snowflake, Room>>();
  /** Live cache of space members grouped by `spaceId -> Collection<userId, SpaceMember>`. */
  readonly members = new Collection<Snowflake, Collection<Snowflake, SpaceMember>>();

  private opts: ClientOptions;
  private _fetchingMembers = new Map<string, Promise<SpaceMember | null>>();

  /**
   * Initializes the REST client and command handler without opening a network connection.
   * Call {@link Client.login} to connect to the Gateway.
   */
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

  /**
   * Configures the bot token on the REST client, attaches the command handler,
   * and opens the WebSocket connection to `gatewayUrl`.
   *
   * @throws {Error} When neither `token` nor `ClientOptions.token` is provided.
   */
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

  /**
   * Alias for {@link Client.login}.
   */
  connect(token?: string): Promise<this> {
    return this.login(token);
  }

  /**
   * Closes the active Gateway WebSocket connection (`1000`), stops automatic reconnection,
   * and removes all registered event listeners from this `Client`.
   */
  destroy(): void {
    this.gateway?.disconnect();
    this.removeAllListeners();
  }

  /**
   * Fetches all members of `spaceId` via `GET /spaces/:spaceId/members`, normalizes `role_ids`,
   * and populates `client.members.get(spaceId)`.
   * Call this on `ready` for spaces where `resolveMemberPermissions` needs member role data.
   */
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

  /**
   * Fetches a single member via `GET /spaces/:spaceId/members/:userId` with in-flight request deduplication,
   * caches the result in `client.members`, and returns `null` if the user is not in the space.
   */
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

  /**
   * Returns a cached {@link SpaceMember} from `client.members` without making a network request.
   */
  getMember(spaceId: Snowflake, userId: Snowflake): SpaceMember | undefined {
    return this.members.get(spaceId)?.get(userId);
  }

  /**
   * Checks whether a cached room has end-to-end encryption (`e2ee_enabled`) enabled.
   * Bots cannot read or post plaintext messages in encrypted rooms.
   */
  isRoomEncrypted(roomId: Snowflake): boolean {
    return isEncryptedRoom(this.rooms.get(roomId));
  }

  /**
   * Collects incoming `messageCreate` events in `roomId` that satisfy `opts.filter` up to `opts.max` messages
   * or until `opts.timeoutMs` elapses.
   *
   * @example
   * ```ts
   * const collected = await client.awaitMessages(roomId, {
   *   filter: (m) => m.sender_id === userId,
   *   max: 1,
   *   timeoutMs: 15_000,
   * });
   * const reply = collected.first();
   * ```
   */
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
          if (collected.size >= max) {
            cleanup();
          }
        } catch {
          /* ignore filter errors */
        }
      };

      const timer = setTimeout(cleanup, timeoutMs);
      this.on('messageCreate', onMessage);
    });
  }

  /**
   * Collects incoming `messageReactionAdd` events on `messageId` in `roomId` that satisfy `opts.filter`
   * up to `opts.max` reactions or until `opts.timeoutMs` elapses.
   *
   * @example
   * ```ts
   * const reactions = await client.awaitReactions(roomId, promptMsg.id, {
   *   filter: (r) => r.user_id === authorId && (r.emoji === '👍' || r.emoji === '👎'),
   *   max: 1,
   *   timeoutMs: 15_000,
   * });
   * ```
   */
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
          if (collected.length >= max) {
            cleanup();
          }
        } catch {
          /* ignore filter errors */
        }
      };

      const timer = setTimeout(cleanup, timeoutMs);
      this.on('messageReactionAdd', onReaction);
    });
  }

  /**
   * Generates an OAuth2 bot installation link (`/oauth2/authorize?scope=bot...`) for this bot.
   * Defaults `clientId` to `client.user.id` and `baseUrl` to `ClientOptions.apiBase`.
   *
   * @throws {Error} When neither `opts.clientId` nor `client.user.id` is available.
   * @example
   * ```ts
   * const url = client.generateInviteUrl({
   *   permissions: ['ViewRoom', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
   * });
   * ```
   */
  generateInviteUrl(
    opts: Omit<BotInviteUrlOptions, 'clientId' | 'baseUrl'> & {
      clientId?: Snowflake;
      baseUrl?: string;
    } = {},
  ): string {
    const clientId = opts.clientId ?? this.user?.id;
    if (!clientId) {
      throw new Error('clientId is required before client is ready');
    }
    return generateBotInviteUrl({
      ...opts,
      clientId,
      baseUrl: opts.baseUrl ?? this.opts.apiBase,
    });
  }

  /**
   * Computes the effective 28-bit permission bitmask for `userId` in `spaceId` (and optionally `roomId`)
   * using the 6-stage Equinox permission cascade:
   * 1. Space owner receives {@link ALL_PERMISSIONS}.
   * 2. Base permissions combine `@everyone` (`space.everyone_role_id`) and assigned member roles.
   * 3. `Permission.Administrator` short-circuits to {@link ALL_PERMISSIONS}.
   * 4. Room overrides apply in order: `@everyone` override -> bitwise union of role overrides -> individual user override.
   * 5. Missing `Permission.ViewRoom` zeroes out the entire room bitmask (`0`).
   * 6. Missing `Permission.SendMessages` clears `AttachFiles` and `MentionEveryone`.
   *
   * Returns `0` if `spaceId` is omitted or not present in `client.spaces`.
   */
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

    if ((mask & Permission.ViewRoom) === 0) {
      return 0;
    }

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
            if (s.rooms?.length) {
              for (const r of s.rooms) {
                this._cacheRoom(r, s.id);
                this.gateway.subscribe(r.id);
              }
            } else {
              void this.rest
                .getSpaceRooms(s.id)
                .then((rooms) => {
                  for (const r of rooms ?? []) {
                    this._cacheRoom(r, s.id);
                    this.gateway.subscribe(r.id);
                  }
                })
                .catch(() => {});
            }
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
          const merged = { ...prev, ...r };
          this._cacheRoom(merged, envelopeSpaceId);
          if (
            (name === 'roomCreate' ||
              name === 'spaceRoomCreate' ||
              name === 'threadCreate') &&
            (this.opts.autoSubscribeSpaces ?? true)
          ) {
            this.gateway.subscribe(merged.id);
          }
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
          if (targetSid) {
            this.spaceRooms.get(targetSid)?.delete(id);
          }
        }
      } else if (name === 'spaceRoleCreate' || name === 'spaceRoleUpdate') {
        const role = d as unknown as Role & { space_id?: Snowflake };
        const sid = role?.space_id ?? envelopeSpaceId;
        if (sid && role?.id) {
          const space = this.spaces.get(sid);
          if (space) {
            const roles = [...(space.roles ?? [])];
            const idx = roles.findIndex((r) => r.id === role.id);
            if (idx >= 0) roles[idx] = { ...roles[idx], ...role };
            else roles.push(role);
            space.roles = roles;
          }
        }
      } else if (name === 'spaceRoleDelete') {
        const roleId = d?.role_id as Snowflake | undefined;
        const sid = (d?.space_id ?? envelopeSpaceId) as Snowflake | undefined;
        if (sid && roleId) {
          const space = this.spaces.get(sid);
          if (space?.roles) {
            space.roles = space.roles.filter((r) => r.id !== roleId);
          }
        }
      } else if (name === 'spaceRoomOverrideUpdate') {
        const ov = d as unknown as PermissionOverride & { room_id?: Snowflake };
        const rid = ov?.room_id ?? (isNested ? (rawD?.room_id as Snowflake | undefined) : frame.room_id);
        if (rid && ov?.role_id) {
          const room = this.rooms.get(rid);
          if (room) {
            const list = [...(room.permission_overrides ?? [])];
            const idx = list.findIndex((o) => o.role_id === ov.role_id);
            if (idx >= 0) list[idx] = { ...list[idx], ...ov };
            else list.push(ov);
            room.permission_overrides = list;
          }
        }
      } else if (name === 'spaceRoomOverrideDelete') {
        const roleId = d?.role_id as Snowflake | undefined;
        const rid = (d?.room_id ?? (isNested ? rawD?.room_id : frame.room_id)) as Snowflake | undefined;
        if (rid && roleId) {
          const room = this.rooms.get(rid);
          if (room?.permission_overrides) {
            room.permission_overrides = room.permission_overrides.filter((o) => o.role_id !== roleId);
          }
        }
      } else if (name === 'spaceRoomUserOverrideUpdate') {
        const ov = d as unknown as PermissionOverride & { room_id?: Snowflake };
        const rid = ov?.room_id ?? (isNested ? (rawD?.room_id as Snowflake | undefined) : frame.room_id);
        if (rid && ov?.user_id) {
          const room = this.rooms.get(rid);
          if (room) {
            const list = [...(room.user_overrides ?? [])];
            const idx = list.findIndex((o) => o.user_id === ov.user_id);
            if (idx >= 0) list[idx] = { ...list[idx], ...ov };
            else list.push(ov);
            room.user_overrides = list;
          }
        }
      } else if (name === 'spaceRoomUserOverrideDelete') {
        const userId = d?.user_id as Snowflake | undefined;
        const rid = (d?.room_id ?? (isNested ? rawD?.room_id : frame.room_id)) as Snowflake | undefined;
        if (rid && userId) {
          const room = this.rooms.get(rid);
          if (room?.user_overrides) {
            room.user_overrides = room.user_overrides.filter((o) => o.user_id !== userId);
          }
        }
      } else if (name === 'userUpdate') {
        const u = d as unknown as Partial<User> & { user_id?: Snowflake };
        const uid = u?.user_id ?? u?.id;
        if (uid && this.user && uid === this.user.id) {
          this.user = { ...this.user, ...u };
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
          col.set(m.user_id, { ...prev, ...m } as SpaceMember);
        }
      } else if (name === 'spaceMemberRemove') {
        const m = d as { user_id?: Snowflake; space_id?: Snowflake };
        const sid = m?.space_id ?? envelopeSpaceId;
        if (sid && m?.user_id) {
          this.members.get(sid)?.delete(m.user_id);
        }
      } else if (name === 'spaceMembersChunk') {
        const chunk = d as { space_id?: Snowflake; members?: SpaceMember[] };
        const sid = chunk?.space_id ?? envelopeSpaceId;
        if (sid && Array.isArray(chunk?.members)) {
          let col = this.members.get(sid);
          if (!col) {
            col = new Collection();
            this.members.set(sid, col);
          }
          for (const m of chunk.members) {
            if (!m.role_ids && m.roles) m.role_ids = m.roles;
            col.set(m.user_id, m);
          }
        }
      }

      this.emit(name, d, frame);
      if (name === 'messageCreate' && isEncryptedMessage(d as unknown as Message)) {
        this.emit('encryptedMessageCreate', d as unknown as Message);
      }
      if (name === 'spaceRoomCreate') this.emit('roomCreate', d as unknown as Room);
      else if (name === 'spaceRoomUpdate') this.emit('roomUpdate', d as unknown as Room);
      else if (name === 'spaceRoomDelete') this.emit('roomDelete', d as any);
    });

    this.gateway.on('error', (err) => this.emit('error', err));
    this.gateway.on('close', (code, reason) =>
      this.emit('close', code, reason),
    );
  }
}
