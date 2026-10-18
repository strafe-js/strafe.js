"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
exports.createHelpCommand = createHelpCommand;
const util_1 = require("@strafe-js/util");
const Command_js_1 = require("./Command.js");
const Context_js_1 = require("./Context.js");
const CommandArgument_js_1 = require("./CommandArgument.js");
/**
 * Registry and dispatcher for prefix commands on a {@link Client}.
 * Evaluates longest-prefix matching, quote-aware tokenization, `guildOnly`/`dmOnly` guards,
 * owner guards, caller and bot Equinox permissions, per-user cooldowns, and schema argument validation.
 */
class CommandHandler {
    /** Parent {@link Client} instance. */
    client;
    /** Registered commands keyed by primary lowercase command name. */
    commands = new Map();
    /** Alias lookup table mapping `alias -> primaryCommandName`. */
    aliases = new Map();
    /** Active cooldown expiration timestamps (`Date.now() + cooldown`) keyed by `${commandName}:${userId}`. */
    cooldowns = new Map();
    /** Set of bot owner user Snowflake IDs permitted to run `botOwnerOnly` commands. */
    owners;
    /** Active command prefixes sorted from longest to shortest so multi-character prefixes match before shorter prefixes. */
    prefixes;
    /** Whether bot mention prefixes (`<@botId>`) are enabled. */
    mentionPrefix;
    /** Whether messages from bot accounts (`msg.bot === true`) are ignored. */
    ignoreBots;
    /** Whether messages from `client.user.id` are ignored. */
    ignoreSelf;
    /** Registered middleware pipeline executed in registration order before `command.run(ctx)`. */
    middlewares = [];
    _bound = false;
    /**
     * Creates a new {@link CommandHandler} bound to `client`.
     */
    constructor(client, opts = {}) {
        this.client = client;
        this.prefixes = (Array.isArray(opts.prefix) ? opts.prefix : [opts.prefix ?? '!'])
            .map((p) => p ?? '')
            .sort((a, b) => b.length - a.length);
        this.mentionPrefix = opts.mentionPrefix !== false;
        this.owners = new Set(opts.owners ?? []);
        this.ignoreBots = opts.ignoreBots !== false;
        this.ignoreSelf = opts.ignoreSelf !== false;
    }
    /**
     * Appends a middleware function to the execution pipeline.
     * Middleware runs after guards and argument validation, right before `command.run(ctx)`.
     *
     * @example
     * ```ts
     * client.commands.use(async (ctx, next) => {
     *   console.log(`[CMD] ${ctx.commandName} by ${ctx.authorId}`);
     *   await next();
     * });
     * ```
     */
    use(fn) {
        this.middlewares.push(fn);
        return this;
    }
    /**
     * Replaces the active prefix list and re-sorts prefixes from longest to shortest.
     */
    setPrefix(prefix) {
        this.prefixes = (Array.isArray(prefix) ? prefix : [prefix])
            .map((p) => p ?? '')
            .sort((a, b) => b.length - a.length);
        return this;
    }
    /**
     * Replaces the set of bot owner Snowflake IDs allowed to run `botOwnerOnly` commands.
     */
    setOwners(ids) {
        this.owners.clear();
        for (const id of ids)
            this.owners.add(id);
        return this;
    }
    /**
     * Registers a {@link Command} or {@link CommandOptions} object and indexes its aliases.
     *
     * @throws {Error} When the command name or any alias collides with an already registered command or alias.
     */
    register(cmd) {
        const command = cmd instanceof Command_js_1.Command ? cmd : new Command_js_1.Command(cmd);
        if (this.commands.has(command.name)) {
            throw new Error(`Duplicate command name: ${command.name}`);
        }
        if (this.aliases.has(command.name)) {
            throw new Error(`Command name "${command.name}" conflicts with an existing alias`);
        }
        for (const alias of command.aliases) {
            if (this.commands.has(alias)) {
                throw new Error(`Alias "${alias}" conflicts with an existing command name`);
            }
            if (this.aliases.has(alias)) {
                throw new Error(`Duplicate alias: ${alias}`);
            }
        }
        this.commands.set(command.name, command);
        for (const alias of command.aliases) {
            this.aliases.set(alias, command.name);
        }
        return this;
    }
    /**
     * Registers an array of commands sequentially via {@link CommandHandler.register}.
     */
    registerAll(list) {
        for (const c of list)
            this.register(c);
        return this;
    }
    /**
     * Resolves a registered {@link Command} by its primary name or alias (case-insensitive),
     * or returns `null` if not found.
     */
    get(name) {
        const key = name.toLowerCase();
        const realName = this.commands.has(key) ? key : this.aliases.get(key);
        if (!realName)
            return null;
        return this.commands.get(realName) ?? null;
    }
    /**
     * Subscribes this handler to `client.on('messageCreate')`. Idempotent if called multiple times.
     */
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
        if (usedPrefix === null && this.mentionPrefix && this.client.user?.id) {
            const botId = this.client.user.id;
            const mentionMatch = new RegExp(`^<@!?${botId}>\\s*`).exec(content);
            if (mentionMatch) {
                usedPrefix = mentionMatch[0];
            }
        }
        if (usedPrefix === null)
            return;
        const without = content.slice(usedPrefix.length).trim();
        if (!without)
            return;
        const rawTokens = (0, CommandArgument_js_1.tokenizeArguments)(without);
        const commandName = (rawTokens.shift() ?? '').toLowerCase();
        if (!commandName)
            return;
        const command = this.get(commandName);
        if (!command)
            return;
        const room = this.client.rooms.get(msg.room_id) ?? null;
        const spaceId = room?.space_id ?? msg.space_id ?? null;
        const space = spaceId ? this.client.spaces.get(spaceId) ?? null : null;
        if (command.guildOnly && !spaceId) {
            await this._safeReply(msg, 'This command can only be used in a space.');
            return;
        }
        if (command.dmOnly && spaceId) {
            await this._safeReply(msg, 'This command can only be used in direct messages.');
            return;
        }
        if (command.botOwnerOnly) {
            if (!this.owners.has(msg.sender_id)) {
                await this._safeReply(msg, 'Only bot owners can use this command.');
                return;
            }
        }
        if (command.spaceOwnerOnly) {
            if (!space || space.owner_id !== msg.sender_id) {
                await this._safeReply(msg, 'Only the space owner can use this command.');
                return;
            }
        }
        let memberPermissions = 0;
        if (command.permissions.length || command.permissionMask) {
            memberPermissions = this.client.resolveMemberPermissions(msg.sender_id, spaceId, msg.room_id);
            const need = command.permissionMask || (0, util_1.resolvePermission)(command.permissions);
            if ((memberPermissions & need) !== need) {
                await this._safeReply(msg, 'You do not have the required permissions to execute this command.');
                return;
            }
        }
        let botPermissions = 0;
        const botUserId = this.client.user?.id;
        if (command.botPermissions.length || command.botPermissionMask) {
            if (!botUserId) {
                await this._safeReply(msg, 'Unable to verify bot permissions (bot user not loaded).');
                return;
            }
            if (spaceId) {
                let botMember = this.client.members.get(spaceId)?.get(botUserId);
                if (!botMember) {
                    botMember = (await this.client.fetchMember(spaceId, botUserId)) ?? undefined;
                }
                if (!botMember) {
                    await this._safeReply(msg, 'Unable to verify bot permissions in this space.');
                    return;
                }
                botPermissions = this.client.resolveMemberPermissions(botUserId, spaceId, msg.room_id);
            }
            else {
                botPermissions = (0, util_1.resolvePermission)(command.botPermissions) | command.botPermissionMask;
            }
            const needBot = command.botPermissionMask || (0, util_1.resolvePermission)(command.botPermissions);
            if ((botPermissions & needBot) !== needBot) {
                await this._safeReply(msg, 'The bot is missing the required permissions to perform this action.');
                return;
            }
        }
        if (command.cooldown > 0) {
            const key = `${command.name}:${msg.sender_id}`;
            const now = Date.now();
            const until = this.cooldowns.get(key) ?? 0;
            if (now < until) {
                const remainingMs = until - now;
                const left = Math.ceil(remainingMs / 1000);
                this.client.emit('commandCooldown', remainingMs, msg, command);
                await this._safeReply(msg, `Please wait ${left}s before reusing the \`${command.name}\` command.`);
                return;
            }
            if (this.cooldowns.size > 1000) {
                for (const [k, exp] of this.cooldowns.entries()) {
                    if (now >= exp)
                        this.cooldowns.delete(k);
                }
            }
            this.cooldowns.set(key, now + command.cooldown);
        }
        let parsedArgs;
        if (command.argumentsSchema) {
            try {
                parsedArgs = (0, CommandArgument_js_1.parseAndValidateArguments)(command.argumentsSchema, rawTokens, msg.attachments ?? []);
            }
            catch (err) {
                if (err instanceof CommandArgument_js_1.ArgumentValidationError) {
                    await this._safeReply(msg, `Invalid argument \`${err.argumentName}\`: ${err.message}`);
                    this.client.emit('commandArgumentError', err, msg, command);
                    return;
                }
                throw err;
            }
        }
        else {
            if (rawTokens.length < command.minArgs) {
                await this._safeReply(msg, `Usage: ${usedPrefix}${command.name} ${command.usage}`.trim());
                return;
            }
            if (rawTokens.length > command.maxArgs) {
                await this._safeReply(msg, 'Too many arguments provided.');
                return;
            }
        }
        const ctx = new Context_js_1.Context({
            client: this.client,
            message: msg,
            args: rawTokens,
            prefix: usedPrefix,
            commandName,
            command,
            space,
            room,
            memberPermissions,
            botPermissions,
            parsedArguments: parsedArgs,
        });
        try {
            const invokeChain = async (index) => {
                if (index < this.middlewares.length) {
                    const mw = this.middlewares[index];
                    if (mw.length >= 2) {
                        await mw(ctx, () => invokeChain(index + 1));
                    }
                    else {
                        const res = await mw(ctx);
                        if (res !== false) {
                            await invokeChain(index + 1);
                        }
                    }
                    return;
                }
                await command.run(ctx);
            };
            await invokeChain(0);
        }
        catch (err) {
            if (command.onError) {
                try {
                    await command.onError(err, ctx);
                }
                catch (secondaryErr) {
                    this.client.emit('commandError', secondaryErr, ctx);
                }
            }
            else {
                this.client.emit('commandError', err, ctx);
                await this._safeReply(msg, 'An error occurred while executing the command.');
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
            /* ignore reply failure safely */
        }
    }
}
exports.CommandHandler = CommandHandler;
/**
 * Creates a ready-to-register {@link Command} that lists all registered commands grouped by `category`
 * or inspects a single command's aliases, usage signature, required permissions, cooldown, and argument schema.
 *
 * @example
 * ```ts
 * import { Client, createHelpCommand } from '@strafe-js/strafebot';
 *
 * client.commands.register(createHelpCommand({ title: '**MyBot Commands**' }));
 * ```
 */
function createHelpCommand(opts = {}) {
    const name = opts.name ?? 'help';
    const aliases = opts.aliases ?? ['commands', 'h'];
    const description = opts.description ??
        'Displays available commands or detailed info for a specific command';
    const category = opts.category ?? 'utility';
    return new Command_js_1.Command({
        name,
        aliases,
        description,
        category,
        arguments: {
            command: {
                type: 'string',
                required: false,
                description: 'Command name or alias to inspect',
            },
        },
        async run(ctx) {
            const targetName = ctx.arguments.get('command');
            const displayPrefix = ctx.prefix.startsWith('<@')
                ? ctx.client.commands.prefixes[0] ?? '!'
                : ctx.prefix;
            if (targetName) {
                const cmd = ctx.client.commands.get(String(targetName));
                if (!cmd) {
                    await ctx.reply(`Unknown command: \`${String(targetName)}\``);
                    return;
                }
                const sig = cmd.usageSignature;
                const lines = [
                    `**${displayPrefix}${cmd.name}${sig ? ` ${sig}` : ''}**`,
                ];
                if (cmd.description)
                    lines.push(cmd.description);
                lines.push(`Category: \`${cmd.category}\``);
                if (cmd.aliases.length > 0) {
                    lines.push(`Aliases: ${cmd.aliases.map((a) => `\`${a}\``).join(', ')}`);
                }
                if (cmd.permissions.length > 0) {
                    lines.push(`Permissions: ${cmd.permissions.map((p) => `\`${p}\``).join(', ')}`);
                }
                if (cmd.cooldown > 0) {
                    lines.push(`Cooldown: \`${cmd.cooldown / 1000}s\``);
                }
                if (cmd.argumentsSchema) {
                    const schema = cmd.argumentsSchema;
                    const argLines = Object.entries(schema).map(([argKey, argOpt]) => {
                        const req = argOpt.required ? 'required' : 'optional';
                        const desc = argOpt.description ? ` - ${argOpt.description}` : '';
                        return `  • \`${argKey}\` (\`${argOpt.type}\`, ${req})${desc}`;
                    });
                    if (argLines.length > 0) {
                        lines.push('Arguments:\n' + argLines.join('\n'));
                    }
                }
                await ctx.reply(lines.join('\n'));
                return;
            }
            const groups = new Map();
            for (const cmd of ctx.client.commands.commands.values()) {
                if (cmd.hidden && !opts.includeHidden)
                    continue;
                const cat = cmd.category || 'general';
                let list = groups.get(cat);
                if (!list) {
                    list = [];
                    groups.set(cat, list);
                }
                list.push(cmd);
            }
            const sections = [];
            if (opts.title) {
                sections.push(opts.title);
            }
            for (const [cat, cmds] of groups.entries()) {
                const items = cmds
                    .map((c) => {
                    const sig = c.usageSignature ? ` ${c.usageSignature}` : '';
                    const desc = c.description ? ` - ${c.description}` : '';
                    return `• \`${displayPrefix}${c.name}${sig}\`${desc}`;
                })
                    .join('\n');
                sections.push(`**[${cat}]**\n${items}`);
            }
            sections.push(`Tip: Use \`${displayPrefix}${name} <command>\` for detailed argument information.`);
            await ctx.reply(sections.join('\n\n'));
        },
    });
}
//# sourceMappingURL=CommandHandler.js.map