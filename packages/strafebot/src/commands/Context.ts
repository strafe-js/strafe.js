import {
  isEncryptedRoom,
  Permission,
  resolvePermission,
  type Message,
  type Space,
  type Room,
  type CreateMessageBody,
  type PermissionResolvable,
  type Snowflake,
  type User,
  type SpaceMember,
} from '@strafe-js/util';
import type {
  Client,
  AwaitMessagesOptions,
  AwaitReactionsOptions,
  ReactionEventPayload,
} from '../Client.js';
import type { Collection } from '@strafe-js/collection';
import type { Command } from './Command.js';
import {
  ParsedArguments,
  type CommandArgumentsSchema,
  type InferArguments,
} from './CommandArgument.js';

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
export class Context<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
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
  constructor(opts: ContextOptions<Schema>) {
    this.client = opts.client;
    this.message = opts.message;
    this.args = opts.args;
    this.prefix = opts.prefix;
    this.commandName = opts.commandName;
    this.command = opts.command;
    this.space = opts.space;
    this.room = opts.room;
    this.memberPermissions = opts.memberPermissions;
    this.botPermissions = opts.botPermissions;
    this.parsedArguments = opts.parsedArguments ?? new ParsedArguments<Schema>();
  }

  /**
   * Typed schema arguments container (`ctx.arguments.get('key')`).
   */
  get arguments(): ParsedArguments<Schema> {
    return this.parsedArguments;
  }

  /**
   * Snowflake ID of the user who sent the triggering message (`this.message.sender_id`).
   */
  get authorId(): Snowflake {
    return this.message.sender_id;
  }

  /**
   * Cached {@link User} object if the author is the bot itself, otherwise `null`.
   */
  get author(): User | null {
    return this.client.user?.id === this.authorId ? this.client.user : null;
  }

  /**
   * Snowflake ID of the room where the command was invoked (`this.message.room_id`).
   */
  get roomId(): Snowflake {
    return this.message.room_id;
  }

  /**
   * Snowflake ID of the space where the command was invoked, or `null` in Direct Messages.
   */
  get spaceId(): Snowflake | null {
    return this.space?.id ?? this.message.space_id ?? null;
  }

  /**
   * Raw plaintext content of the triggering message (`''` when empty).
   */
  get content(): string {
    return this.message.plaintext ?? '';
  }

  /**
   * Whether the room where the command was invoked has end-to-end encryption (`e2ee_enabled`) enabled.
   */
  get isEncryptedRoom(): boolean {
    return isEncryptedRoom(this.room);
  }

  /**
   * Cached {@link SpaceMember} record for the caller in the current space, or `null` in DMs / if uncached.
   */
  get member(): SpaceMember | null {
    if (!this.spaceId) return null;
    return this.client.members.get(this.spaceId)?.get(this.authorId) ?? null;
  }

  /**
   * Cached {@link SpaceMember} record for the bot user in the current space, or `null` in DMs / if uncached.
   */
  get botMember(): SpaceMember | null {
    if (!this.spaceId || !this.client.user?.id) return null;
    return this.client.members.get(this.spaceId)?.get(this.client.user.id) ?? null;
  }

  /**
   * Sends a message in the current room replying to the triggering message (`reply_to_id` defaults to `this.message.id`).
   *
   * @example
   * ```ts
   * await ctx.reply('Command executed!');
   * await ctx.reply('With attachment', { attachments: [att.id] });
   * ```
   */
  async reply(content: string | CreateMessageBody, extra: Partial<CreateMessageBody> = {}): Promise<Message> {
    const body: CreateMessageBody =
      typeof content === 'string'
        ? { plaintext: content, ...extra }
        : { ...content, ...extra };

    if (body.reply_to_id === undefined) {
      body.reply_to_id = this.message.id;
    }

    return this.client.rest.createMessage(this.roomId, body);
  }

  /**
   * Sends a standalone message in the current room without setting `reply_to_id`.
   */
  async send(content: string | CreateMessageBody, extra: Partial<CreateMessageBody> = {}): Promise<Message> {
    const body: CreateMessageBody =
      typeof content === 'string'
        ? { plaintext: content, ...extra }
        : { ...content, ...extra };
    return this.client.rest.createMessage(this.roomId, body);
  }

  /**
   * Triggers a typing indicator in the current room via `POST /rooms/:roomId/typing`.
   */
  async typing(): Promise<null> {
    await this.client.rest.triggerTyping(this.roomId);
    return null;
  }

  /**
   * Adds an emoji reaction to the triggering message (`PUT /rooms/:roomId/messages/:messageId/reactions/:emoji`).
   */
  async react(emoji: string): Promise<null> {
    await this.client.rest.addReaction(this.roomId, this.message.id, emoji);
    return null;
  }

  /**
   * Deletes the triggering message via `DELETE /rooms/:roomId/messages/:messageId`.
   */
  async deleteMessage(): Promise<null> {
    await this.client.rest.deleteMessage(this.roomId, this.message.id);
    return null;
  }

  /**
   * Returns the caller's {@link SpaceMember} from cache or fetches it via `GET /spaces/:spaceId/members/:userId`.
   * Returns `null` in Direct Messages or if the member is not found.
   */
  async fetchMember(): Promise<SpaceMember | null> {
    if (!this.spaceId) return null;
    return this.member ?? this.client.fetchMember(this.spaceId, this.authorId);
  }

  /**
   * Collects subsequent messages in the current room via {@link Client.awaitMessages}.
   *
   * @example
   * ```ts
   * await ctx.reply('Type "confirm" within 10 seconds:');
   * const replies = await ctx.awaitMessages({
   *   filter: (m) => m.sender_id === ctx.authorId && m.plaintext === 'confirm',
   *   max: 1,
   *   timeoutMs: 10_000,
   * });
   * ```
   */
  awaitMessages(opts: AwaitMessagesOptions = {}): Promise<Collection<Snowflake, Message>> {
    return this.client.awaitMessages(this.roomId, opts);
  }

  /**
   * Collects reactions on `messageId` (defaults to the triggering message `this.message.id`) in the current room
   * via {@link Client.awaitReactions}.
   */
  awaitReactions(
    opts: AwaitReactionsOptions = {},
    messageId: Snowflake = this.message.id,
  ): Promise<ReactionEventPayload[]> {
    return this.client.awaitReactions(this.roomId, messageId, opts);
  }

  /**
   * Checks whether the caller has all permissions specified in `required` within the current room.
   * If `this.memberPermissions` was not precomputed by a command guard, resolves permissions on demand.
   */
  hasPermissions(required: PermissionResolvable): boolean {
    const mask = resolvePermission(required);
    return (this.memberPermissions & mask) === mask;
  }

  /**
   * Checks whether the bot user has all permissions specified in `required` within the current room.
   */
  hasBotPermissions(required: PermissionResolvable): boolean {
    const mask = resolvePermission(required);
    return (this.botPermissions & mask) === mask;
  }

  /**
   * Returns `true` if `this.authorId` is included in `client.commands.owners`.
   */
  isBotOwner(): boolean {
    return this.client.commands.owners.has(this.authorId);
  }

  /**
   * Alias for {@link Context.isBotOwner}.
   */
  isOwner(): boolean {
    return this.isBotOwner();
  }

  /**
   * Returns `true` if the command was invoked in a space and `this.authorId === this.space.owner_id`.
   */
  isSpaceOwner(): boolean {
    if (!this.space) return false;
    return this.space.owner_id === this.authorId;
  }
}

export { Permission };
