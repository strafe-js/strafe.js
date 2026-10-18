import type { PermissionName } from '@strafe-js/util';
import type { Context } from './Context.js';
import type { CommandArgumentsSchema } from './CommandArgument.js';

/**
 * Configuration object used to define a prefix command via {@link command} or `new Command(options)`.
 */
export interface CommandOptions<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
  /** Primary trigger name of the command (normalized to lowercase and trimmed). */
  name: string;
  /** Alternative trigger names that resolve to this command (normalized to lowercase). */
  aliases?: string[];
  /** Human-readable summary shown in help commands. */
  description?: string;
  /** Logical category label used to group commands in help output (defaults to `'general'`). */
  category?: string;
  /** When `true`, omits the command from general help listings unless queried directly by name. */
  hidden?: boolean;
  /** Usage syntax string appended when `minArgs` fails (for example `'<user> [reason]'`). */
  usage?: string;
  /** Required caller permissions in the room (`PermissionName[]`). Evaluated via `client.resolveMemberPermissions`. */
  permissions?: PermissionName[];
  /** Raw numeric permission bitmask required for the caller. Takes precedence over `permissions` when non-zero. */
  permissionMask?: number;
  /** Required bot permissions in the room (`PermissionName[]`). Verified before `run` executes. */
  botPermissions?: PermissionName[];
  /** Raw numeric permission bitmask required for the bot user. Takes precedence over `botPermissions` when non-zero. */
  botPermissionMask?: number;
  /** Alias for `botOwnerOnly`. Restricts execution to user IDs listed in `ClientOptions.owners`. */
  ownerOnly?: boolean;
  /** Restricts execution to user IDs listed in `ClientOptions.owners`. */
  botOwnerOnly?: boolean;
  /** Restricts execution to the owner (`space.owner_id`) of the current space. */
  spaceOwnerOnly?: boolean;
  /** Per-user, per-command cooldown duration in milliseconds (`0` disables cooldowns). */
  cooldown?: number;
  /** When `true`, rejects execution in Direct Messages (`spaceId === null`). */
  guildOnly?: boolean;
  /** When `true`, rejects execution inside spaces (`spaceId !== null`). */
  dmOnly?: boolean;
  /** Minimum number of positional `ctx.args` tokens required when `arguments` schema is not set. */
  minArgs?: number;
  /** Maximum number of positional `ctx.args` tokens allowed when `arguments` schema is not set. */
  maxArgs?: number;
  /** Declarative argument schema parsed and validated into `ctx.arguments` before `run` executes. */
  arguments?: Schema;
  /** Command handler invoked once all guards and argument validations pass. */
  run: (ctx: Context<Schema>) => void | Promise<void>;
  /** Optional per-command error hook invoked if `run` throws or rejects. */
  onError?: (err: unknown, ctx: Context<Schema>) => void | Promise<void>;
}

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
export class Command<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
  /** Normalized lowercase primary command name. */
  readonly name: string;
  /** Normalized lowercase command aliases. */
  readonly aliases: string[];
  /** Human-readable command description. */
  readonly description: string;
  /** Logical category label used to group commands in help listings (`'general'` by default). */
  readonly category: string;
  /** Whether the command is hidden from general help listings. */
  readonly hidden: boolean;
  /** Usage string displayed when `minArgs` validation fails. */
  readonly usage: string;
  /** Required caller permission names. */
  readonly permissions: PermissionName[];
  /** Required caller numeric permission bitmask. */
  readonly permissionMask: number;
  /** Required bot permission names. */
  readonly botPermissions: PermissionName[];
  /** Required bot numeric permission bitmask. */
  readonly botPermissionMask: number;
  /** Whether only bot owners (`ClientOptions.owners`) can invoke this command. */
  readonly ownerOnly: boolean;
  /** Whether only bot owners (`ClientOptions.owners`) can invoke this command. */
  readonly botOwnerOnly: boolean;
  /** Whether only the current space owner (`space.owner_id`) can invoke this command. */
  readonly spaceOwnerOnly: boolean;
  /** Per-user cooldown in milliseconds (`0` when disabled). */
  readonly cooldown: number;
  /** Whether this command is restricted to spaces only. */
  readonly guildOnly: boolean;
  /** Whether this command is restricted to Direct Messages only. */
  readonly dmOnly: boolean;
  /** Minimum positional argument count when `argumentsSchema` is `null`. */
  readonly minArgs: number;
  /** Maximum positional argument count when `argumentsSchema` is `null`. */
  readonly maxArgs: number;
  /** Declarative argument schema, or `null` when using raw positional `ctx.args`. */
  readonly argumentsSchema: Schema | null;
  /** Execution callback receiving the typed {@link Context}. */
  readonly run: (ctx: Context<Schema>) => void | Promise<void>;
  /** Custom error handler for exceptions thrown by `run`, or `null` to fall back to `commandError`. */
  readonly onError: ((err: unknown, ctx: Context<Schema>) => void | Promise<void>) | null;

  /**
   * Validates and normalizes `opts` into an immutable {@link Command} instance.
   *
   * @throws {Error} When `opts.name` is missing/empty or `opts.run` is not a function.
   */
  constructor(opts: CommandOptions<Schema>) {
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
  get names(): string[] {
    return [this.name, ...this.aliases];
  }

  /**
   * Human-readable argument signature generated from `this.usage` or `this.argumentsSchema`
   * (for example `'<target:user> [reason...:string]'`).
   */
  get usageSignature(): string {
    if (this.usage) return this.usage;
    if (!this.argumentsSchema) return '';
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
export function command<Schema extends CommandArgumentsSchema = CommandArgumentsSchema>(
  opts: CommandOptions<Schema>,
): Command<Schema> {
  return new Command<Schema>(opts);
}
