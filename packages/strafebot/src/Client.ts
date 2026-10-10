import { EventEmitter } from 'node:events';
import { REST } from '@RUTUJEKWIELKI/rest';
import { Gateway } from '@RUTUJEKWIELKI/ws';
import { Collection } from '@RUTUJEKWIELKI/collection';
import {
  StrafeError,
  Permission,
  type Snowflake,
  type User,
  type Space,
  type Room,
  type Message,
  type SpaceMember,
  type ReadyPayload,
  type GatewayEventEnvelope,
} from '@RUTUJEKWIELKI/util';
import { CommandHandler, type CommandHandlerOptions } from './commands/CommandHandler.js';

export interface ClientOptions extends CommandHandlerOptions {
  apiBase: string;
  gatewayUrl: string;
  reconnectDelay?: number;
}

export class Client extends EventEmitter {
  readonly options: ClientOptions;
  token: string | null = null;
  user: User | null = null;

  readonly rest: REST;
  gateway: Gateway | null = null;

  readonly spaces = new Collection<Snowflake, Space>();
  readonly rooms = new Collection<Snowflake, Room>();
  readonly spaceRooms = new Collection<Snowflake, Collection<Snowflake, Room>>();
  readonly members = new Collection<Snowflake, Collection<Snowflake, SpaceMember>>();

  readonly commands: CommandHandler;

  constructor(options: ClientOptions) {
    super();
    if (!options.apiBase || !options.gatewayUrl) {
      throw new StrafeError('apiBase and gatewayUrl are required');
    }
    this.options = options;
    this.rest = new REST({ apiBase: options.apiBase });
    this.commands = new CommandHandler(this, {
      prefix: options.prefix,
      owners: options.owners,
      ignoreBots: options.ignoreBots,
      ignoreSelf: options.ignoreSelf,
    });
  }

  async login(token: string): Promise<this> {
    if (!token) throw new StrafeError('token is required');
    this.token = token;
    this.rest.setToken(token, 'Bot');

    this.gateway = new Gateway({
      url: this.options.gatewayUrl,
      token,
      tokenType: 'Bot',
      reconnectDelay: this.options.reconnectDelay,
    });

    this._wireGateway();
    this.commands.attach();
    this.gateway.connect();
    return this;
  }

  /** Alias for login. */
  connect(token: string): Promise<this> {
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
      const id = (m.id ?? m.user_id) as Snowflake;
      col.set(id, m);
    }
    return col;
  }

  /**
   * Resolve effective permission mask for a user in a space/room.
   * Owner → Administrator. Else OR of roles, then room overrides.
   */
  resolveMemberPermissions(userId: Snowflake, spaceId: Snowflake | null | undefined, roomId?: Snowflake): number {
    if (!spaceId) return 0;
    const space = this.spaces.get(spaceId);
    if (!space) return 0;
    if (space.owner_id === userId) return Permission.Administrator;

    const memberCol = this.members.get(spaceId);
    const member = memberCol?.get(userId);
    if (!member) return 0;

    const roleMap = new Map(space.roles.map((r) => [r.id, r]));
    let mask = 0;

    const everyone = roleMap.get(space.everyone_role_id);
    if (everyone) mask |= everyone.permissions || 0;

    for (const rid of member.role_ids ?? member.roles ?? []) {
      const role = roleMap.get(rid);
      if (role) mask |= role.permissions || 0;
    }

    if (mask & Permission.Administrator) return Permission.Administrator;

    const room = roomId ? this.rooms.get(roomId) : null;
    if (room?.permission_overrides) {
      for (const ov of room.permission_overrides) {
        if (!ov.role_id) continue;
        const holds =
          ov.role_id === space.everyone_role_id ||
          (member.role_ids ?? member.roles ?? []).includes(ov.role_id);
        if (holds) {
          mask = (mask & ~ov.deny) | ov.allow;
        }
      }
    }
    if (room?.user_overrides) {
      const uov = room.user_overrides.find((o) => o.user_id === userId);
      if (uov) mask = (mask & ~uov.deny) | uov.allow;
    }

    return mask;
  }

  private _wireGateway(): void {
    const gw = this.gateway!;

    gw.on('ready', (payload: ReadyPayload) => {
      this.user = payload.user;
      this.spaces.clear();
      this.rooms.clear();
      this.spaceRooms.clear();

      for (const space of payload.spaces ?? []) {
        this.spaces.set(space.id, space);
      }
      for (const room of payload.rooms ?? []) {
        this.rooms.set(room.id, room);
      }
      for (const [spaceId, roomList] of Object.entries(payload.space_rooms ?? {})) {
        const col = new Collection<Snowflake, Room>();
        for (const room of roomList) {
          col.set(room.id, room);
          this.rooms.set(room.id, room);
        }
        this.spaceRooms.set(spaceId, col);
      }
      this.emit('ready', this.user, payload);
    });

    gw.on('messageCreate', (msg: unknown, envelope: GatewayEventEnvelope) => {
      this.emit('messageCreate', msg as Message, envelope);
    });
    gw.on('messageUpdate', (msg: unknown, envelope: GatewayEventEnvelope) => {
      this.emit('messageUpdate', msg as Message, envelope);
    });
    gw.on('messageDelete', (data: unknown, envelope: GatewayEventEnvelope) => {
      this.emit('messageDelete', data, envelope);
    });
    gw.on('messageReactionAdd', (data: unknown, envelope: GatewayEventEnvelope) => {
      this.emit('messageReactionAdd', data, envelope);
    });
    gw.on('messageReactionRemove', (data: unknown, envelope: GatewayEventEnvelope) => {
      this.emit('messageReactionRemove', data, envelope);
    });

    gw.on('spaceCreate', (space: unknown) => {
      const s = space as Space;
      this.spaces.set(s.id, s);
      this.emit('spaceCreate', s);
    });
    gw.on('spaceLeave', (data: unknown) => {
      const d = data as { space_id: Snowflake };
      this.spaces.delete(d.space_id);
      this.spaceRooms.delete(d.space_id);
      this.members.delete(d.space_id);
      this.emit('spaceLeave', d);
    });
    gw.on('spaceDelete', (data: unknown) => {
      const d = data as { space_id: Snowflake };
      this.spaces.delete(d.space_id);
      this.spaceRooms.delete(d.space_id);
      this.members.delete(d.space_id);
      this.emit('spaceDelete', d);
    });
    gw.on('spaceRoomCreate', (room: unknown) => {
      const r = room as Room;
      this.rooms.set(r.id, r);
      if (r.space_id) {
        let col = this.spaceRooms.get(r.space_id);
        if (!col) {
          col = new Collection();
          this.spaceRooms.set(r.space_id, col);
        }
        col.set(r.id, r);
      }
      this.emit('spaceRoomCreate', r);
    });
    gw.on('spaceRoomDelete', (data: unknown) => {
      const d = data as { space_id: Snowflake; room_id: Snowflake };
      this.rooms.delete(d.room_id);
      this.spaceRooms.get(d.space_id)?.delete(d.room_id);
      this.emit('spaceRoomDelete', d);
    });
    gw.on('spaceMemberAdd', (member: unknown) => {
      const m = member as SpaceMember;
      const spaceId = m.space_id;
      if (!spaceId) return;
      let col = this.members.get(spaceId);
      if (!col) {
        col = new Collection();
        this.members.set(spaceId, col);
      }
      col.set((m.id ?? m.user_id) as Snowflake, m);
      this.emit('spaceMemberAdd', m);
    });
    gw.on('spaceMemberRemove', (data: unknown) => {
      const d = data as { space_id: Snowflake; user_id: Snowflake };
      this.members.get(d.space_id)?.delete(d.user_id);
      this.emit('spaceMemberRemove', d);
    });
    gw.on('spaceMemberUpdate', (data: unknown) => {
      const d = data as { space_id?: Snowflake; user_id: Snowflake; role_ids: Snowflake[] };
      // SPACE_MEMBER_UPDATE may not always carry space_id in envelope; try both
      const spaceId = d.space_id;
      if (spaceId) {
        const existing = this.members.get(spaceId)?.get(d.user_id);
        if (existing) {
          existing.role_ids = d.role_ids;
        }
      }
      this.emit('spaceMemberUpdate', d);
    });

    gw.on('typingStart', (data: unknown) => this.emit('typingStart', data));
    gw.on('sessionRevoked', (data: unknown) => {
      this.emit('sessionRevoked', data);
      this.destroy();
    });
    gw.on('error', (err: Error) => this.emit('error', err));
    gw.on('disconnect', (code: number) => this.emit('disconnect', code));
    gw.on('debug', (msg: string) => this.emit('debug', msg));
  }
}
