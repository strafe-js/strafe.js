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
    botPermissions;
    botPermissionMask;
    ownerOnly;
    botOwnerOnly;
    spaceOwnerOnly;
    cooldown;
    guildOnly;
    dmOnly;
    minArgs;
    maxArgs;
    argumentsSchema;
    run;
    onError;
    constructor(opts) {
        if (!opts?.name || typeof opts.run !== 'function') {
            throw new Error('Command requires name and run()');
        }
        const name = opts.name.trim().toLowerCase();
        if (!name) {
            throw new Error('Command name cannot be empty');
        }
        this.name = name;
        this.aliases = (opts.aliases ?? []).map((a) => a.trim().toLowerCase()).filter(Boolean);
        this.description = opts.description ?? '';
        this.usage = opts.usage ?? '';
        this.permissions = opts.permissions ?? [];
        this.permissionMask = opts.permissionMask ?? 0;
        this.botPermissions = opts.botPermissions ?? [];
        this.botPermissionMask = opts.botPermissionMask ?? 0;
        // ownerOnly / botOwnerOnly both refer to bot owners
        this.botOwnerOnly = !!(opts.botOwnerOnly || opts.ownerOnly);
        this.ownerOnly = this.botOwnerOnly;
        this.spaceOwnerOnly = !!opts.spaceOwnerOnly;
        this.cooldown = opts.cooldown ?? 0;
        this.guildOnly = !!opts.guildOnly;
        this.dmOnly = !!opts.dmOnly;
        this.minArgs = opts.minArgs ?? 0;
        this.maxArgs = opts.maxArgs ?? Infinity;
        this.argumentsSchema = opts.arguments ?? null;
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