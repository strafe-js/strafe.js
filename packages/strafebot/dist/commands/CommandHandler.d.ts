import { type Message, type Snowflake } from '@strafe-js/util';
import type { Client } from '../Client.js';
import { Command, type CommandOptions } from './Command.js';
import { Context } from './Context.js';
import { ArgumentValidationError } from './CommandArgument.js';
/**
 * Configuration options for {@link CommandHandler}.
 */
export interface CommandHandlerOptions {
    /** Single prefix string or array of prefixes matched at the start of incoming messages. Defaults to `'!'`. */
    prefix?: string | string[];
    /** Bot owner user Snowflake IDs allowed to invoke `botOwnerOnly` / `ownerOnly` commands. */
    owners?: Snowflake[];
    /** Whether to ignore messages where `msg.bot === true`. Defaults to `true`. */
    ignoreBots?: boolean;
    /** Whether to ignore messages authored by `client.user.id`. Defaults to `true`. */
    ignoreSelf?: boolean;
}
/**
 * Command lifecycle events emitted on {@link Client}.
 */
export interface CommandEvents {
    /** Emitted when a command's `run` function throws and no `onError` handler caught the error, or when `onError` itself throws. */
    commandError: (err: unknown, ctx: Context<any>) => void;
    /** Emitted when a command invocation fails `arguments` schema validation with an {@link ArgumentValidationError}. */
    commandArgumentError: (err: ArgumentValidationError, msg: Message, command: Command<any>) => void;
}
/**
 * Registry and dispatcher for prefix commands on a {@link Client}.
 * Evaluates longest-prefix matching, quote-aware tokenization, `guildOnly`/`dmOnly` guards,
 * owner guards, caller and bot Equinox permissions, per-user cooldowns, and schema argument validation.
 */
export declare class CommandHandler {
    /** Parent {@link Client} instance. */
    readonly client: Client;
    /** Registered commands keyed by primary lowercase command name. */
    readonly commands: Map<string, Command<any>>;
    /** Alias lookup table mapping `alias -> primaryCommandName`. */
    readonly aliases: Map<string, string>;
    /** Active cooldown expiration timestamps (`Date.now() + cooldown`) keyed by `${commandName}:${userId}`. */
    readonly cooldowns: Map<string, number>;
    /** Set of bot owner user Snowflake IDs permitted to run `botOwnerOnly` commands. */
    readonly owners: Set<Snowflake>;
    /** Active command prefixes sorted from longest to shortest so multi-character prefixes match before shorter prefixes. */
    prefixes: string[];
    /** Whether messages from bot accounts (`msg.bot === true`) are ignored. */
    ignoreBots: boolean;
    /** Whether messages from `client.user.id` are ignored. */
    ignoreSelf: boolean;
    private _bound;
    /**
     * Creates a new {@link CommandHandler} bound to `client`.
     */
    constructor(client: Client, opts?: CommandHandlerOptions);
    /**
     * Replaces the active prefix list and re-sorts prefixes from longest to shortest.
     */
    setPrefix(prefix: string | string[]): this;
    /**
     * Replaces the set of bot owner Snowflake IDs allowed to run `botOwnerOnly` commands.
     */
    setOwners(ids: Snowflake[]): this;
    /**
     * Registers a {@link Command} or {@link CommandOptions} object and indexes its aliases.
     *
     * @throws {Error} When the command name or any alias collides with an already registered command or alias.
     */
    register(cmd: Command<any> | CommandOptions<any>): this;
    /**
     * Registers an array of commands sequentially via {@link CommandHandler.register}.
     */
    registerAll(list: Array<Command<any> | CommandOptions<any>>): this;
    /**
     * Resolves a registered {@link Command} by its primary name or alias (case-insensitive),
     * or returns `null` if not found.
     */
    get(name: string): Command<any> | null;
    /**
     * Subscribes this handler to `client.on('messageCreate')`. Idempotent if called multiple times.
     */
    attach(): this;
    private _onMessage;
    private _safeReply;
}
//# sourceMappingURL=CommandHandler.d.ts.map