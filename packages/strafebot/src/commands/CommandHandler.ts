import {
  Permission,
  resolvePermission,
  type Message,
  type Snowflake,
  type SpaceMember,
} from '@strafe-js/util';
import type { Client } from '../Client.js';
import { Command, type CommandOptions } from './Command.js';
import { Context } from './Context.js';
import {
  ArgumentValidationError,
  parseAndValidateArguments,
  tokenizeArguments,
  type CommandArgumentsSchema,
} from './CommandArgument.js';

export interface CommandHandlerOptions {
  prefix?: string | string[];
  owners?: Snowflake[];
  ignoreBots?: boolean;
  ignoreSelf?: boolean;
}

export class CommandHandler {
  readonly client: Client;
  readonly commands = new Map<string, Command<any>>();
  readonly aliases = new Map<string, string>();
  readonly cooldowns = new Map<string, number>();
  readonly owners: Set<Snowflake>;

  prefixes: string[];
  ignoreBots: boolean;
  ignoreSelf: boolean;
  private _bound = false;

  constructor(client: Client, opts: CommandHandlerOptions = {}) {
    this.client = client;
    this.prefixes = (Array.isArray(opts.prefix) ? opts.prefix : [opts.prefix ?? '!'])
      .map((p) => p ?? '')
      .sort((a, b) => b.length - a.length); // longest prefix first
    this.owners = new Set(opts.owners ?? []);
    this.ignoreBots = opts.ignoreBots !== false;
    this.ignoreSelf = opts.ignoreSelf !== false;
  }

  setPrefix(prefix: string | string[]): this {
    this.prefixes = (Array.isArray(prefix) ? prefix : [prefix])
      .map((p) => p ?? '')
      .sort((a, b) => b.length - a.length);
    return this;
  }

  setOwners(ids: Snowflake[]): this {
    this.owners.clear();
    for (const id of ids) this.owners.add(id);
    return this;
  }

  register(cmd: Command<any> | CommandOptions<any>): this {
    const command = cmd instanceof Command ? cmd : new Command(cmd);

    // Check duplicate main name or collision with alias
    if (this.commands.has(command.name)) {
      throw new Error(`Duplicate command name: ${command.name}`);
    }
    if (this.aliases.has(command.name)) {
      throw new Error(`Command name "${command.name}" conflicts with an existing alias`);
    }

    // Check aliases
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

  registerAll(list: Array<Command<any> | CommandOptions<any>>): this {
    for (const c of list) this.register(c);
    return this;
  }

  get(name: string): Command<any> | null {
    const key = name.toLowerCase();
    const realName = this.commands.has(key) ? key : this.aliases.get(key);
    if (!realName) return null;
    return this.commands.get(realName) ?? null;
  }

  attach(): this {
    if (this._bound) return this;
    this._bound = true;
    this.client.on('messageCreate', (msg: Message) => {
      void this._onMessage(msg);
    });
    return this;
  }

  private async _onMessage(msg: Message): Promise<void> {
    if (!msg.plaintext) return;
    if (this.ignoreSelf && msg.sender_id === this.client.user?.id) return;
    if (this.ignoreBots && msg.bot === true) return;

    const content = msg.plaintext;
    let usedPrefix: string | null = null;
    for (const p of this.prefixes) {
      if (content.startsWith(p)) {
        usedPrefix = p;
        break;
      }
    }
    if (usedPrefix === null) return;

    const without = content.slice(usedPrefix.length).trim();
    if (!without) return;

    // Tokenize text taking into account quotes and escape characters
    const rawTokens = tokenizeArguments(without);
    const commandName = (rawTokens.shift() ?? '').toLowerCase();
    if (!commandName) return;

    const command = this.get(commandName);
    if (!command) return;

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

    // 1. Calculate caller/member permissions
    let memberPermissions = 0;
    if (command.permissions.length || command.permissionMask) {
      memberPermissions = this.client.resolveMemberPermissions(msg.sender_id, spaceId, msg.room_id);
      const need = command.permissionMask || resolvePermission(command.permissions);
      if ((memberPermissions & need) !== need) {
        await this._safeReply(msg, 'You do not have the required permissions to execute this command.');
        return;
      }
    }

    // 2. Calculate bot permissions
    let botPermissions = 0;
    const botUserId = this.client.user?.id;
    if (command.botPermissions.length || command.botPermissionMask) {
      if (!botUserId) {
        await this._safeReply(msg, 'Unable to verify bot permissions (bot user not loaded).');
        return;
      }

      if (spaceId) {
        // Check cache for bot member
        let botMember = this.client.members.get(spaceId)?.get(botUserId);
        if (!botMember) {
          // Attempt single fetch via REST
          botMember = (await this.client.fetchMember(spaceId, botUserId)) ?? undefined;
        }

        if (!botMember) {
          await this._safeReply(msg, 'Unable to verify bot permissions in this space.');
          return;
        }

        botPermissions = this.client.resolveMemberPermissions(botUserId, spaceId, msg.room_id);
      } else {
        // DMs - bot has full permissions
        botPermissions = resolvePermission(command.botPermissions) | command.botPermissionMask;
      }

      const needBot = command.botPermissionMask || resolvePermission(command.botPermissions);
      if ((botPermissions & needBot) !== needBot) {
        await this._safeReply(msg, 'The bot is missing the required permissions to perform this action.');
        return;
      }
    }

    // 3. Cooldown check & cleanup
    if (command.cooldown > 0) {
      const key = `${command.name}:${msg.sender_id}`;
      const now = Date.now();
      const until = this.cooldowns.get(key) ?? 0;

      if (now < until) {
        const left = Math.ceil((until - now) / 1000);
        await this._safeReply(msg, `Please wait ${left}s before reusing the \`${command.name}\` command.`);
        return;
      }

      // Cleanup old expired cooldowns periodically to prevent memory leaks
      if (this.cooldowns.size > 1000) {
        for (const [k, exp] of this.cooldowns.entries()) {
          if (now >= exp) this.cooldowns.delete(k);
        }
      }

      this.cooldowns.set(key, now + command.cooldown);
    }

    // 4. Parse arguments (New schema or positional fallback)
    let parsedArgs;
    if (command.argumentsSchema) {
      try {
        parsedArgs = parseAndValidateArguments(command.argumentsSchema, rawTokens, msg.attachments ?? []);
      } catch (err) {
        if (err instanceof ArgumentValidationError) {
          await this._safeReply(msg, `Invalid argument \`${err.argumentName}\`: ${err.message}`);
          this.client.emit('commandArgumentError', err, msg, command);
          return;
        }
        throw err;
      }
    } else {
      // Legacy positional arguments check
      if (rawTokens.length < command.minArgs) {
        await this._safeReply(msg, `Usage: ${usedPrefix}${command.name} ${command.usage}`.trim());
        return;
      }
      if (rawTokens.length > command.maxArgs) {
        await this._safeReply(msg, 'Too many arguments provided.');
        return;
      }
    }

    const ctx = new Context({
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
      await command.run(ctx);
    } catch (err) {
      if (command.onError) {
        try {
          await command.onError(err, ctx);
        } catch (secondaryErr) {
          this.client.emit('commandError', secondaryErr, ctx);
        }
      } else {
        this.client.emit('commandError', err, ctx);
        await this._safeReply(msg, 'An error occurred while executing the command.');
      }
    }
  }

  private async _safeReply(msg: Message, text: string): Promise<void> {
    try {
      await this.client.rest.createMessage(msg.room_id, {
        plaintext: text,
        reply_to_id: msg.id,
      });
    } catch {
      /* ignore reply failure safely */
    }
  }
}
