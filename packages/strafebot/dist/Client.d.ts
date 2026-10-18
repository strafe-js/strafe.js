import { EventEmitter } from 'node:events';
import { BotInviteUrlOptions, Message, Room, Snowflake, Space, SpaceMember, User } from '@strafe-js/util';
import { Collection } from '@strafe-js/collection';
import { REST, RESTOptions } from '@strafe-js/rest';
import { Gateway, GatewayOptions, GatewayEvents } from '@strafe-js/ws';
import { CommandHandler, CommandHandlerOptions, CommandEvents } from './commands/CommandHandler.js';
/**
 * Configuration options for {@link Client}.
 */
export interface ClientOptions {
    /** Base URL for the Strafe REST API (for example `'https://app.strafe.chat/api'`). */
    apiBase: string;
    /** Full WebSocket URL for the Strafe Gateway (for example `'wss://app.strafe.chat/gateway/events'`). */
    gatewayUrl: string;
    /** Bot authentication token. Can also be supplied later via {@link Client.login}. */
    token?: string;
    /** Authorization header prefix (`'Bot'` or `'Bearer'`). Defaults to `'Bot'`. */
    authScheme?: 'Bot' | 'Bearer';
    /** Single prefix string or array of prefixes matched by {@link CommandHandler}. Defaults to `'!'`. */
    prefix?: string | string[];
    /** Bot owner user Snowflake IDs allowed to execute `botOwnerOnly` commands. */
    owners?: Snowflake[];
    /** Whether to automatically send `GatewayOp.Subscribe` (`op: 1`) for every space on `READY` and `SPACE_CREATE`. Defaults to `true`. */
    autoSubscribeSpaces?: boolean;
    /** Interval in milliseconds between gateway heartbeat pings (`op: 6`). Defaults to `45000`. */
    heartbeatIntervalMs?: number;
    /** Additional overrides forwarded to the underlying {@link REST} constructor. */
    rest?: Partial<RESTOptions>;
    /** Additional overrides forwarded to the underlying {@link Gateway} constructor. */
    gateway?: Partial<GatewayOptions>;
    /** Additional overrides forwarded to the underlying {@link CommandHandler} constructor. */
    commands?: Partial<CommandHandlerOptions>;
}
/**
 * Options for collecting incoming messages in a room via {@link Client.awaitMessages} or {@link Context.awaitMessages}.
 */
export interface AwaitMessagesOptions {
    /** Optional predicate to filter incoming messages in the target room. */
    filter?: (message: Message) => boolean | Promise<boolean>;
    /** Maximum number of matching messages to collect before resolving early. Defaults to `1`. */
    max?: number;
    /** Maximum wait duration in milliseconds before resolving with collected messages. Defaults to `30000`. */
    timeoutMs?: number;
}
/**
 * Payload received when a user adds a reaction to a message (`MESSAGE_REACTION_ADD`).
 */
export interface ReactionEventPayload {
    /** Room Snowflake ID where the reaction occurred. */
    room_id: Snowflake;
    /** Target Message Snowflake ID. */
    message_id: Snowflake;
    /** User Snowflake ID who added the reaction. */
    user_id: Snowflake;
    /** Unicode emoji or `custom:<id>` identifier. */
    emoji: string;
}
/**
 * Options for collecting incoming reactions on a message via {@link Client.awaitReactions} or {@link Context.awaitReactions}.
 */
export interface AwaitReactionsOptions {
    /** Optional predicate to filter incoming reactions on the target message. */
    filter?: (reaction: ReactionEventPayload) => boolean | Promise<boolean>;
    /** Maximum number of matching reactions to collect before resolving early. Defaults to `1`. */
    max?: number;
    /** Maximum wait duration in milliseconds before resolving with collected reactions. Defaults to `30000`. */
    timeoutMs?: number;
}
/**
 * Combined event map emitted by {@link Client}, merging real-time {@link GatewayEvents}, {@link CommandEvents},
 * and E2EE room notifications.
 */
export type ClientEvents = GatewayEvents & CommandEvents & {
    /** Emitted when a `MESSAGE_CREATE` frame arrives from an end-to-end encrypted room (`ciphertext` without `plaintext`). */
    encryptedMessageCreate: (message: Message) => void;
};
export declare interface Client {
    /** Registers a typed listener for a {@link ClientEvents} event. */
    on<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
    /** Registers a listener for a custom or unmapped event name. */
    on(event: string, listener: (...args: any[]) => void): this;
    /** Registers a one-time typed listener for a {@link ClientEvents} event. */
    once<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
    /** Registers a one-time listener for a custom or unmapped event name. */
    once(event: string, listener: (...args: any[]) => void): this;
    /** Emits a typed {@link ClientEvents} event to all registered listeners. */
    emit<E extends keyof ClientEvents>(event: E, ...args: Parameters<ClientEvents[E]>): boolean;
    /** Emits a custom event to all registered listeners. */
    emit(event: string, ...args: any[]): boolean;
}
/**
 * High-level Strafe bot client combining the {@link REST} HTTP client, {@link Gateway} WebSocket manager,
 * live entity caches (`spaces`, `rooms`, `spaceRooms`, `members`), the 6-stage Equinox permission resolver,
 * and the prefix {@link CommandHandler}.
 *
 * @example
 * ```ts
 * import { Client, command } from '@strafe-js/strafebot';
 *
 * const client = new Client({
 *   apiBase: 'https://app.strafe.chat/api',
 *   gatewayUrl: 'wss://app.strafe.chat/gateway/events',
 *   prefix: '!',
 * });
 *
 * client.commands.register(
 *   command({
 *     name: 'ping',
 *     async run(ctx) {
 *       await ctx.reply('Pong!');
 *     },
 *   }),
 * );
 *
 * await client.login(process.env.BOT_TOKEN!);
 * ```
 */
export declare class Client extends EventEmitter {
    /** Underlying HTTP client for direct Strafe REST API calls. */
    readonly rest: REST;
    /** Underlying WebSocket gateway connection (initialized when {@link Client.login} is called). */
    gateway: Gateway;
    /** Built-in prefix command registry and message dispatcher. */
    readonly commands: CommandHandler;
    /** Authenticated bot {@link User} profile populated once the `ready` event fires (`null` before ready). */
    user: User | null;
    /** Live cache of spaces keyed by `spaceId`. */
    readonly spaces: Collection<string, Space>;
    /** Live cache of rooms across all spaces and DMs keyed by `roomId`. */
    readonly rooms: Collection<string, Room>;
    /** Live cache of space rooms grouped by `spaceId -> Collection<roomId, Room>`. */
    readonly spaceRooms: Collection<string, Collection<string, Room>>;
    /** Live cache of space members grouped by `spaceId -> Collection<userId, SpaceMember>`. */
    readonly members: Collection<string, Collection<string, SpaceMember>>;
    private opts;
    private _fetchingMembers;
    /**
     * Initializes the REST client and command handler without opening a network connection.
     * Call {@link Client.login} to connect to the Gateway.
     */
    constructor(opts: ClientOptions);
    /**
     * Configures the bot token on the REST client, attaches the command handler,
     * and opens the WebSocket connection to `gatewayUrl`.
     *
     * @throws {Error} When neither `token` nor `ClientOptions.token` is provided.
     */
    login(token?: string): Promise<this>;
    /**
     * Alias for {@link Client.login}.
     */
    connect(token?: string): Promise<this>;
    /**
     * Closes the active Gateway WebSocket connection (`1000`), stops automatic reconnection,
     * and removes all registered event listeners from this `Client`.
     */
    destroy(): void;
    /**
     * Fetches all members of `spaceId` via `GET /spaces/:spaceId/members`, normalizes `role_ids`,
     * and populates `client.members.get(spaceId)`.
     * Call this on `ready` for spaces where `resolveMemberPermissions` needs member role data.
     */
    fetchMembers(spaceId: Snowflake): Promise<Collection<Snowflake, SpaceMember>>;
    /**
     * Fetches a single member via `GET /spaces/:spaceId/members/:userId` with in-flight request deduplication,
     * caches the result in `client.members`, and returns `null` if the user is not in the space.
     */
    fetchMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember | null>;
    /**
     * Returns a cached {@link SpaceMember} from `client.members` without making a network request.
     */
    getMember(spaceId: Snowflake, userId: Snowflake): SpaceMember | undefined;
    /**
     * Checks whether a cached room has end-to-end encryption (`e2ee_enabled`) enabled.
     * Bots cannot read or post plaintext messages in encrypted rooms.
     */
    isRoomEncrypted(roomId: Snowflake): boolean;
    /**
     * Collects incoming `messageCreate` events in `roomId` that satisfy `opts.filter` up to `opts.max` messages
     * or until `opts.timeoutMs` elapses.
     *
     * @example
     * ```ts
     * const collected = await client.awaitMessages(roomId, {
     *   filter: (m) => m.sender_id === userId,
     *   max: 1,
     *   timeoutMs: 15_000,
     * });
     * const reply = collected.first();
     * ```
     */
    awaitMessages(roomId: Snowflake, opts?: AwaitMessagesOptions): Promise<Collection<Snowflake, Message>>;
    /**
     * Collects incoming `messageReactionAdd` events on `messageId` in `roomId` that satisfy `opts.filter`
     * up to `opts.max` reactions or until `opts.timeoutMs` elapses.
     *
     * @example
     * ```ts
     * const reactions = await client.awaitReactions(roomId, promptMsg.id, {
     *   filter: (r) => r.user_id === authorId && (r.emoji === '👍' || r.emoji === '👎'),
     *   max: 1,
     *   timeoutMs: 15_000,
     * });
     * ```
     */
    awaitReactions(roomId: Snowflake, messageId: Snowflake, opts?: AwaitReactionsOptions): Promise<ReactionEventPayload[]>;
    /**
     * Generates an OAuth2 bot installation link (`/oauth2/authorize?scope=bot...`) for this bot.
     * Defaults `clientId` to `client.user.id` and `baseUrl` to `ClientOptions.apiBase`.
     *
     * @throws {Error} When neither `opts.clientId` nor `client.user.id` is available.
     * @example
     * ```ts
     * const url = client.generateInviteUrl({
     *   permissions: ['ViewRoom', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
     * });
     * ```
     */
    generateInviteUrl(opts?: Omit<BotInviteUrlOptions, 'clientId' | 'baseUrl'> & {
        clientId?: Snowflake;
        baseUrl?: string;
    }): string;
    /**
     * Computes the effective 28-bit permission bitmask for `userId` in `spaceId` (and optionally `roomId`)
     * using the 6-stage Equinox permission cascade:
     * 1. Space owner receives {@link ALL_PERMISSIONS}.
     * 2. Base permissions combine `@everyone` (`space.everyone_role_id`) and assigned member roles.
     * 3. `Permission.Administrator` short-circuits to {@link ALL_PERMISSIONS}.
     * 4. Room overrides apply in order: `@everyone` override -> bitwise union of role overrides -> individual user override.
     * 5. Missing `Permission.ViewRoom` zeroes out the entire room bitmask (`0`).
     * 6. Missing `Permission.SendMessages` clears `AttachFiles` and `MentionEveryone`.
     *
     * Returns `0` if `spaceId` is omitted or not present in `client.spaces`.
     */
    resolveMemberPermissions(userId: Snowflake, spaceId?: Snowflake | null, roomId?: Snowflake | null): number;
    private _cacheRoom;
    private _wireGateway;
}
//# sourceMappingURL=Client.d.ts.map