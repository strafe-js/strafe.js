"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
exports.command = command;
/**
 * Normalized prefix command definition registered in {@link CommandHandler}.
 *
 * @example
 * ```ts
 * import { Command } from '@strafe-js/strafebot';
 *
 * const ping = new Command({
 *   name: 'ping',
 *   aliases: ['p'],
 *   cooldown: 3000,
 *   async run(ctx) {
 *     await ctx.reply('Pong!');
 *   },
 * });
 * ```
 */
class Command {
    /** Normalized lowercase primary command name. */
    name;
    /** Normalized lowercase command aliases. */
    aliases;
    /** Human-readable command description. */
    description;
    /** Logical category label used to group commands in help listings (`'general'` by default). */
    category;
    /** Whether the command is hidden from general help listings. */
    hidden;
    /** Usage string displayed when `minArgs` validation fails. */
    usage;
    /** Required caller permission names. */
    permissions;
    /** Required caller numeric permission bitmask. */
    permissionMask;
    /** Required bot permission names. */
    botPermissions;
    /** Required bot numeric permission bitmask. */
    botPermissionMask;
    /** Whether only bot owners (`ClientOptions.owners`) can invoke this command. */
    ownerOnly;
    /** Whether only bot owners (`ClientOptions.owners`) can invoke this command. */
    botOwnerOnly;
    /** Whether only the current space owner (`space.owner_id`) can invoke this command. */
    spaceOwnerOnly;
    /** Per-user cooldown in milliseconds (`0` when disabled). */
    cooldown;
    /** Whether this command is restricted to spaces only. */
    guildOnly;
    /** Whether this command is restricted to Direct Messages only. */
    dmOnly;
    /** Minimum positional argument count when `argumentsSchema` is `null`. */
    minArgs;
    /** Maximum positional argument count when `argumentsSchema` is `null`. */
    maxArgs;
    /** Declarative argument schema, or `null` when using raw positional `ctx.args`. */
    argumentsSchema;
    /** Execution callback receiving the typed {@link Context}. */
    run;
    /** Custom error handler for exceptions thrown by `run`, or `null` to fall back to `commandError`. */
    onError;
    /**
     * Validates and normalizes `opts` into an immutable {@link Command} instance.
     *
     * @throws {Error} When `opts.name` is missing/empty or `opts.run` is not a function.
     */
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
        this.category = (opts.category ?? 'general').trim() || 'general';
        this.hidden = !!opts.hidden;
        this.usage = opts.usage ?? '';
        this.permissions = opts.permissions ?? [];
        this.permissionMask = opts.permissionMask ?? 0;
        this.botPermissions = opts.botPermissions ?? [];
        this.botPermissionMask = opts.botPermissionMask ?? 0;
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
    /**
     * Combined array containing `[this.name, ...this.aliases]`.
     */
    get names() {
        return [this.name, ...this.aliases];
    }
    /**
     * Human-readable argument signature generated from `this.usage` or `this.argumentsSchema`
     * (for example `'<target:user> [reason...:string]'`).
     */
    get usageSignature() {
        if (this.usage)
            return this.usage;
        if (!this.argumentsSchema)
            return '';
        return Object.entries(this.argumentsSchema)
            .map(([argName, opt]) => {
            const restMark = opt.rest ? '...' : '';
            const typeLabel = opt.choices?.length ? opt.choices.join('|') : opt.type;
            return opt.required
                ? `<${argName}${restMark}:${typeLabel}>`
                : `[${argName}${restMark}:${typeLabel}]`;
        })
            .join(' ');
    }
}
exports.Command = Command;
/**
 * Type-safe factory helper that creates a {@link Command} while preserving full TypeScript inference
 * for `opts.arguments` inside `run(ctx)`.
 *
 * @example
 * ```ts
 * import { command } from '@strafe-js/strafebot';
 *
 * export default command({
 *   name: 'ban',
 *   permissions: ['BanMembers'],
 *   guildOnly: true,
 *   arguments: {
 *     target: { type: 'user', required: true },
 *     reason: { type: 'string', default: 'No reason provided' },
 *   },
 *   async run(ctx) {
 *     const targetId = ctx.arguments.get('target');
 *     const reason = ctx.arguments.get('reason');
 *     await ctx.client.rest.banMember(ctx.spaceId!, targetId, reason);
 *   },
 * });
 * ```
 */
function command(opts) {
    return new Command(opts);
}
//# sourceMappingURL=Command.js.map