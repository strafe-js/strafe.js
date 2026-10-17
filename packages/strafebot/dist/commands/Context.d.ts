import { Permission, type Message, type Space, type Room, type CreateMessageBody, type PermissionResolvable, type Snowflake, type User, type SpaceMember } from '@strafe-js/util';
import type { Client } from '../Client.js';
import type { Command } from './Command.js';
import { ParsedArguments, type CommandArgumentsSchema } from './CommandArgument.js';
/**
 * Constructor payload used by {@link CommandHandler} to instantiate a {@link Context}.
 */
export interface ContextOptions<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
    /** Active {@link Client} instance. */
    client: Client;
    /** Incoming {@link Message} that triggered the command. */
    message: Message;
    /** Tokenized positional arguments after stripping the prefix and command name. */
    args: string[];
    /** Prefix string matched at the start of the message (for example `'!'`). */
    prefix: string;
    /** Lowercase command or alias name used by the caller. */
    commandName: string;
    /** Resolved {@link Command} definition being executed. */
    command: Command<Schema>;
    /** Cached {@link Space} where the command was invoked, or `null` in Direct Messages. */
    space: Space | null;
    /** Cached {@link Room} where the command was invoked, or `null` if uncached. */
    room: Room | null;
    /** Effective 28-bit permission mask computed for the caller in `room`. */
    memberPermissions: number;
    /** Effective 28-bit permission mask computed for the bot user in `room`. */
    botPermissions: number;
    /** Validated schema arguments container when the command defines `arguments`. */
    parsedArguments?: ParsedArguments<Schema>;
}
/**
 * Execution context passed to a command's `run(ctx)` and `onError(err, ctx)` callbacks.
 * Provides shortcuts for replying, sending messages, reacting, checking permissions, and accessing
 * both positional (`ctx.args`) and schema-validated (`ctx.arguments`) command arguments.
 *
 * @example
 * ```ts
 * async run(ctx) {
 *   await ctx.typing();
 *   await ctx.reply(`Hello <@${ctx.authorId}>!`);
 * }
 * ```
 */
export declare class Context<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
    /** Active {@link Client} instance. */
    readonly client: Client;
    /** Incoming {@link Message} that triggered the command. */
    readonly message: Message;
    /** Tokenized positional arguments (double-quotes unwrapped). */
    readonly args: string[];
    /** Matched command prefix string. */
    readonly prefix: string;
    /** Invoked command or alias name (lowercase). */
    readonly commandName: string;
    /** Resolved {@link Command} definition. */
    readonly command: Command<Schema>;
    /** Cached {@link Space} if invoked inside a space, or `null` in DMs. */
    readonly space: Space | null;
    /** Cached {@link Room} where the message was sent, or `null` if not in cache. */
    readonly room: Room | null;
    /** Caller's effective numeric permission bitmask in this room. */
    readonly memberPermissions: number;
    /** Bot's effective numeric permission bitmask in this room. */
    readonly botPermissions: number;
    /** Validated schema arguments container. Prefer the {@link Context.arguments} alias. */
    readonly parsedArguments: ParsedArguments<Schema>;
    /**
     * Creates a new {@link Context} for a single command invocation.
     */
    constructor(opts: ContextOptions<Schema>);
    /**
     * Typed schema arguments container (`ctx.arguments.get('key')`).
     */
    get arguments(): ParsedArguments<Schema>;
    /**
     * Snowflake ID of the user who sent the triggering message (`this.message.sender_id`).
     */
    get authorId(): Snowflake;
    /**
     * Cached {@link User} object if the author is the bot itself, otherwise `null`.
     */
    get author(): User | null;
    /**
     * Snowflake ID of the room where the command was invoked (`this.message.room_id`).
     */
    get roomId(): Snowflake;
    /**
     * Snowflake ID of the space where the command was invoked, or `null` in Direct Messages.
     */
    get spaceId(): Snowflake | null;
    /**
     * Raw plaintext content of the triggering message (`''` when empty).
     */
    get content(): string;
    /**
     * Whether the room where the command was invoked has end-to-end encryption (`e2ee_enabled`) enabled.
     */
    get isEncryptedRoom(): boolean;
    /**
     * Cached {@link SpaceMember} record for the caller in the current space, or `null` in DMs / if uncached.
     */
    get member(): SpaceMember | null;
    /**
     * Cached {@link SpaceMember} record for the bot user in the current space, or `null` in DMs / if uncached.
     */
    get botMember(): SpaceMember | null;
    /**
     * Sends a message in the current room replying to the triggering message (`reply_to_id` defaults to `this.message.id`).
     *
     * @example
     * ```ts
     * await ctx.reply('Command executed!');
     * await ctx.reply('With attachment', { attachments: [att.id] });
     * ```
     */
    reply(content: string | CreateMessageBody, extra?: Partial<CreateMessageBody>): Promise<Message>;
    /**
     * Sends a standalone message in the current room without setting `reply_to_id`.
     */
    send(content: string | CreateMessageBody, extra?: Partial<CreateMessageBody>): Promise<Message>;
    /**
     * Triggers a typing indicator in the current room via `POST /rooms/:roomId/typing`.
     */
    typing(): Promise<null>;
    /**
     * Adds an emoji reaction to the triggering message (`PUT /rooms/:roomId/messages/:messageId/reactions/:emoji`).
     */
    react(emoji: string): Promise<null>;
    /**
     * Checks whether the caller has all permissions specified in `required` within the current room.
     * If `this.memberPermissions` was not precomputed by a command guard, resolves permissions on demand.
     */
    hasPermissions(required: PermissionResolvable): boolean;
    /**
     * Checks whether the bot user has all permissions specified in `required` within the current room.
     */
    hasBotPermissions(required: PermissionResolvable): boolean;
    /**
     * Returns `true` if `this.authorId` is included in `client.commands.owners`.
     */
    isBotOwner(): boolean;
    /**
     * Alias for {@link Context.isBotOwner}.
     */
    isOwner(): boolean;
    /**
     * Returns `true` if the command was invoked in a space and `this.authorId === this.space.owner_id`.
     */
    isSpaceOwner(): boolean;
}
export { Permission };
//# sourceMappingURL=Context.d.ts.map