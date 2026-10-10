"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const util_1 = require("@strafe-js/util");
const Command_js_1 = require("./Command.js");
const Context_js_1 = require("./Context.js");
class CommandHandler {
    client;
    commands = new Map();
    aliases = new Map();
    cooldowns = new Map();
    owners;
    prefixes;
    ignoreBots;
    ignoreSelf;
    _bound = false;
    constructor(client, opts = {}) {
        this.client = client;
        this.prefixes = Array.isArray(opts.prefix) ? opts.prefix : [opts.prefix ?? '!'];
        this.owners = new Set(opts.owners ?? []);
        this.ignoreBots = opts.ignoreBots !== false;
        this.ignoreSelf = opts.ignoreSelf !== false;
    }
    setPrefix(prefix) {
        this.prefixes = Array.isArray(prefix) ? prefix : [prefix];
        return this;
    }
    setOwners(ids) {
        this.owners.clear();
        for (const id of ids)
            this.owners.add(id);
        return this;
    }
    register(cmd) {
        const command = cmd instanceof Command_js_1.Command ? cmd : new Command_js_1.Command(cmd);
        if (this.commands.has(command.name)) {
            throw new Error(`duplicate command: ${command.name}`);
        }
        this.commands.set(command.name, command);
        for (const alias of command.aliases) {
            this.aliases.set(alias, command.name);
        }
        return this;
    }
    registerAll(list) {
        for (const c of list)
            this.register(c);
        return this;
    }
    get(name) {
        const key = name.toLowerCase();
        const real = this.commands.get(key) ?? this.commands.get(this.aliases.get(key) ?? '');
        return real ?? null;
    }
    attach() {
        if (this._bound)
            return this;
        this._bound = true;
        this.client.on('messageCreate', (msg) => {
            void this._onMessage(msg);
        });
        return this;
    }
    async _onMessage(msg) {
        if (!msg.plaintext)
            return;
        if (this.ignoreSelf && msg.sender_id === this.client.user?.id)
            return;
        if (this.ignoreBots && msg.bot === true)
            return;
        const content = msg.plaintext;
        let usedPrefix = null;
        for (const p of this.prefixes) {
            if (content.startsWith(p)) {
                usedPrefix = p;
                break;
            }
        }
        if (!usedPrefix)
            return;
        const without = content.slice(usedPrefix.length).trim();
        if (!without)
            return;
        const parts = without.split(/\s+/);
        const commandName = (parts.shift() ?? '').toLowerCase();
        const args = parts;
        const command = this.get(commandName);
        if (!command)
            return;
        if (args.length < command.minArgs) {
            await this._safeReply(msg, `usage: ${usedPrefix}${command.name} ${command.usage}`.trim());
            return;
        }
        if (args.length > command.maxArgs) {
            await this._safeReply(msg, 'too many arguments');
            return;
        }
        const room = this.client.rooms.get(msg.room_id) ?? null;
        const spaceId = room?.space_id ?? msg.space_id ?? null;
        const space = spaceId ? this.client.spaces.get(spaceId) ?? null : null;
        if (command.guildOnly && !spaceId) {
            await this._safeReply(msg, 'this command only works in a space');
            return;
        }
        if (command.dmOnly && spaceId) {
            await this._safeReply(msg, 'this command only works in DMs');
            return;
        }
        if (command.ownerOnly || command.botOwnerOnly) {
            if (!this.owners.has(msg.sender_id)) {
                await this._safeReply(msg, 'you cannot use this command');
                return;
            }
        }
        let memberPermissions = 0;
        if (command.permissions.length || command.permissionMask) {
            memberPermissions = this.client.resolveMemberPermissions(msg.sender_id, spaceId, msg.room_id);
            const need = command.permissionMask || (0, util_1.resolvePermission)(command.permissions);
            if ((memberPermissions & need) !== need) {
                await this._safeReply(msg, 'missing permissions');
                return;
            }
        }
        if (command.cooldown > 0) {
            const key = `${command.name}:${msg.sender_id}`;
            const until = this.cooldowns.get(key) ?? 0;
            const now = Date.now();
            if (now < until) {
                const left = Math.ceil((until - now) / 1000);
                await this._safeReply(msg, `cooldown: ${left}s`);
                return;
            }
            this.cooldowns.set(key, now + command.cooldown);
        }
        const ctx = new Context_js_1.Context({
            client: this.client,
            message: msg,
            args,
            prefix: usedPrefix,
            commandName,
            command,
            space,
            room,
            memberPermissions,
        });
        try {
            await command.run(ctx);
        }
        catch (err) {
            if (command.onError) {
                try {
                    await command.onError(err, ctx);
                }
                catch {
                    /* swallow secondary */
                }
            }
            else {
                this.client.emit('commandError', err, ctx);
                await this._safeReply(msg, 'command failed');
            }
        }
    }
    async _safeReply(msg, text) {
        try {
            await this.client.rest.createMessage(msg.room_id, {
                plaintext: text,
                reply_to_id: msg.id,
            });
        }
        catch {
            /* ignore */
        }
    }
}
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map