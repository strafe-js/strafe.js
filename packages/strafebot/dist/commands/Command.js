"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
exports.command = command;
class Command {
    name;
    aliases;
    description;
    usage;
    permissions;
    permissionMask;
    ownerOnly;
    botOwnerOnly;
    cooldown;
    guildOnly;
    dmOnly;
    minArgs;
    maxArgs;
    run;
    onError;
    constructor(opts) {
        if (!opts?.name || typeof opts.run !== 'function') {
            throw new Error('Command requires name and run()');
        }
        this.name = opts.name.toLowerCase();
        this.aliases = (opts.aliases ?? []).map((a) => a.toLowerCase());
        this.description = opts.description ?? '';
        this.usage = opts.usage ?? '';
        this.permissions = opts.permissions ?? [];
        this.permissionMask = opts.permissionMask ?? 0;
        this.ownerOnly = !!opts.ownerOnly;
        this.botOwnerOnly = !!opts.botOwnerOnly;
        this.cooldown = opts.cooldown ?? 0;
        this.guildOnly = !!opts.guildOnly;
        this.dmOnly = !!opts.dmOnly;
        this.minArgs = opts.minArgs ?? 0;
        this.maxArgs = opts.maxArgs ?? Infinity;
        this.run = opts.run;
        this.onError = opts.onError ?? null;
    }
    get names() {
        return [this.name, ...this.aliases];
    }
}
exports.Command = Command;
function command(opts) {
    return new Command(opts);
}
//# sourceMappingURL=Command.js.map