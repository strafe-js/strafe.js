import { EventEmitter } from 'node:events';
import {
  ALL_PERMISSIONS,
  BitField,
  Permission,
  ReadyPayload,
  Room,
  Snowflake,
  Space,
  SpaceMember,
  User,
} from '@strafe-js/util';
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
  heartbeatIntervalMs?: number;
  rest?: Partial<RESTOptions>;
  gateway?: Partial<GatewayOptions>;
  commands?: Partial<CommandHandlerOptions>;
}

export type ClientEvents = GatewayEvents & CommandEvents;

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

  resolveMemberPermissions(
    userId: Snowflake,
    spaceId?: Snowflake | null,
    roomId?: Snowflake | null,
  ): number {
    if (!spaceId) return 0;
    const space = this.spaces.get(spaceId);
    if (!space) return 0;

    // 1. Space Owner Check
    if (space.owner_id === userId) return ALL_PERMISSIONS;

    const member = this.getMember(spaceId, userId);
    const rolesById = new Map((space.roles ?? []).map((r) => [r.id, r]));

    // 2. Base Permissions (@everyone + Member Roles)
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

    // 3. Administrator Check
    if ((mask & Permission.Administrator) === Permission.Administrator) {
      return ALL_PERMISSIONS;
    }

    // 4. Room Permission Overrides
    if (roomId) {
      const room = this.rooms.get(roomId);
      const roleOverrides = room?.permission_overrides ?? [];
      const userOverrides = room?.user_overrides ?? [];

      if (roleOverrides.length > 0) {
        // Step 4a: @everyone room override
        if (space.everyone_role_id) {
          const everyoneOv = roleOverrides.find((o) => o.role_id === space.everyone_role_id);
          if (everyoneOv) {
            mask &= ~everyoneOv.deny;
            mask |= everyoneOv.allow;
          }
        }

        // Step 4b: Aggregated Member Role overrides
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

        // Step 4c: Individual User override (in permission_overrides or user_overrides)
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
    }

    // 5. Implicit ViewRoom Denial: Without ViewRoom, user has 0 permissions in that room
    if ((mask & Permission.ViewRoom) === 0) {
      return 0;
    }

    // 6. Dependent Permissions: Without SendMessages, revoke dependent sending permissions
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

      // Keep caches in sync
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
        name === 'spaceRoomUpdate'
      ) {
        const r = d as unknown as Room;
        if (r?.id) {
          const prev = this.rooms.get(r.id);
          const merged = { ...prev, ...r };
          this._cacheRoom(merged, envelopeSpaceId);
          if (
            (name === 'roomCreate' || name === 'spaceRoomCreate') &&
            (this.opts.autoSubscribeSpaces ?? true)
          ) {
            this.gateway.subscribe(merged.id);
          }
        }
      } else if (name === 'roomDelete' || name === 'spaceRoomDelete') {
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
