"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const node_events_1 = require("node:events");
const rest_1 = require("@strafe-js/rest");
const ws_1 = require("@strafe-js/ws");
const collection_1 = require("@strafe-js/collection");
const util_1 = require("@strafe-js/util");
const CommandHandler_js_1 = require("./commands/CommandHandler.js");
class Client extends node_events_1.EventEmitter {
    options;
    token = null;
    user = null;
    rest;
    gateway = null;
    spaces = new collection_1.Collection();
    rooms = new collection_1.Collection();
    spaceRooms = new collection_1.Collection();
    members = new collection_1.Collection();
    commands;
    constructor(options) {
        super();
        if (!options.apiBase || !options.gatewayUrl) {
            throw new util_1.StrafeError('apiBase and gatewayUrl are required');
        }
        this.options = options;
        this.rest = new rest_1.REST({ apiBase: options.apiBase });
        this.commands = new CommandHandler_js_1.CommandHandler(this, {
            prefix: options.prefix,
            owners: options.owners,
            ignoreBots: options.ignoreBots,
            ignoreSelf: options.ignoreSelf,
        });
    }
    async login(token) {
        if (!token)
            throw new util_1.StrafeError('token is required');
        this.token = token;
        this.rest.setToken(token, 'Bot');
        this.gateway = new ws_1.Gateway({
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
    connect(token) {
        return this.login(token);
    }
    destroy() {
        this.gateway?.disconnect();
        this.removeAllListeners();
    }
    async fetchMembers(spaceId) {
        const list = await this.rest.getSpaceMembers(spaceId);
        let col = this.members.get(spaceId);
        if (!col) {
            col = new collection_1.Collection();
            this.members.set(spaceId, col);
        }
        for (const m of list) {
            const id = (m.id ?? m.user_id);
            col.set(id, m);
        }
        return col;
    }
    /**
     * Resolve effective permission mask for a user in a space/room.
     * Owner → Administrator. Else OR of roles, then room overrides.
     */
    resolveMemberPermissions(userId, spaceId, roomId) {
        if (!spaceId)
            return 0;
        const space = this.spaces.get(spaceId);
        if (!space)
            return 0;
        if (space.owner_id === userId)
            return util_1.Permission.Administrator;
        const memberCol = this.members.get(spaceId);
        const member = memberCol?.get(userId);
        if (!member)
            return 0;
        const roles = space.roles ?? [];
        const roleMap = new Map(roles.map((r) => [r.id, r]));
        let mask = 0;
        const everyone = roleMap.get(space.everyone_role_id);
        if (everyone)
            mask |= everyone.permissions || 0;
        const memberRoles = member.role_ids ?? member.roles ?? [];
        for (const rid of memberRoles) {
            const role = roleMap.get(rid);
            if (role)
                mask |= role.permissions || 0;
        }
        if (mask & util_1.Permission.Administrator)
            return util_1.Permission.Administrator;
        const room = roomId ? this.rooms.get(roomId) : null;
        if (room?.permission_overrides) {
            for (const ov of room.permission_overrides) {
                if (!ov.role_id)
                    continue;
                const holds = ov.role_id === space.everyone_role_id || memberRoles.includes(ov.role_id);
                if (holds) {
                    mask = (mask & ~ov.deny) | ov.allow;
                }
            }
        }
        if (room?.user_overrides) {
            const uov = room.user_overrides.find((o) => o.user_id === userId);
            if (uov)
                mask = (mask & ~uov.deny) | uov.allow;
        }
        return mask;
    }
    _wireGateway() {
        const gw = this.gateway;
        gw.on('ready', (payload) => {
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
            const spaceRooms = (payload.space_rooms ?? {});
            for (const spaceId of Object.keys(spaceRooms)) {
                const roomList = spaceRooms[spaceId] ?? [];
                const col = new collection_1.Collection();
                for (const room of roomList) {
                    col.set(room.id, room);
                    this.rooms.set(room.id, room);
                }
                this.spaceRooms.set(spaceId, col);
            }
            this.emit('ready', this.user, payload);
        });
        gw.on('messageCreate', (msg, envelope) => {
            this.emit('messageCreate', msg, envelope);
        });
        gw.on('messageUpdate', (msg, envelope) => {
            this.emit('messageUpdate', msg, envelope);
        });
        gw.on('messageDelete', (data, envelope) => {
            this.emit('messageDelete', data, envelope);
        });
        gw.on('messageReactionAdd', (data, envelope) => {
            this.emit('messageReactionAdd', data, envelope);
        });
        gw.on('messageReactionRemove', (data, envelope) => {
            this.emit('messageReactionRemove', data, envelope);
        });
        gw.on('spaceCreate', (space) => {
            const s = space;
            this.spaces.set(s.id, s);
            this.emit('spaceCreate', s);
        });
        gw.on('spaceLeave', (data) => {
            const d = data;
            this.spaces.delete(d.space_id);
            this.spaceRooms.delete(d.space_id);
            this.members.delete(d.space_id);
            this.emit('spaceLeave', d);
        });
        gw.on('spaceDelete', (data) => {
            const d = data;
            this.spaces.delete(d.space_id);
            this.spaceRooms.delete(d.space_id);
            this.members.delete(d.space_id);
            this.emit('spaceDelete', d);
        });
        gw.on('spaceRoomCreate', (room) => {
            const r = room;
            this.rooms.set(r.id, r);
            if (r.space_id) {
                let col = this.spaceRooms.get(r.space_id);
                if (!col) {
                    col = new collection_1.Collection();
                    this.spaceRooms.set(r.space_id, col);
                }
                col.set(r.id, r);
            }
            this.emit('spaceRoomCreate', r);
        });
        gw.on('spaceRoomDelete', (data) => {
            const d = data;
            this.rooms.delete(d.room_id);
            this.spaceRooms.get(d.space_id)?.delete(d.room_id);
            this.emit('spaceRoomDelete', d);
        });
        gw.on('spaceMemberAdd', (member) => {
            const m = member;
            const spaceId = m.space_id;
            if (!spaceId)
                return;
            let col = this.members.get(spaceId);
            if (!col) {
                col = new collection_1.Collection();
                this.members.set(spaceId, col);
            }
            col.set((m.id ?? m.user_id), m);
            this.emit('spaceMemberAdd', m);
        });
        gw.on('spaceMemberRemove', (data) => {
            const d = data;
            this.members.get(d.space_id)?.delete(d.user_id);
            this.emit('spaceMemberRemove', d);
        });
        gw.on('spaceMemberUpdate', (data) => {
            const d = data;
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
        gw.on('typingStart', (data) => this.emit('typingStart', data));
        gw.on('sessionRevoked', (data) => {
            this.emit('sessionRevoked', data);
            this.destroy();
        });
        gw.on('error', (err) => this.emit('error', err));
        gw.on('disconnect', (code) => this.emit('disconnect', code));
        gw.on('debug', (msg) => this.emit('debug', msg));
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map