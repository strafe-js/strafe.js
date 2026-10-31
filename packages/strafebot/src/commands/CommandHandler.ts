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
  type CommandArgumentOption,
  type CommandArgumentsSchema,
} from './CommandArgument.js';

export interface CommandHandlerOptions {
  prefix?: string | string[];
  mentionPrefix?: boolean;
  owners?: Snowflake[];
  ignoreBots?: boolean;
  ignoreSelf?: boolean;
}

export type CommandMiddleware = (
  ctx: Context<any>,
  next: () => Promise<void>,
) => void | boolean | Promise<void | boolean>;

export interface CommandEvents {
  commandError: (err: unknown, ctx: Context<any>) => void;
  commandArgumentError: (
    err: ArgumentValidationError,
    msg: Message,
    command: Command<any>,
  ) => void;
  commandCooldown: (
    remainingMs: number,
    msg: Message,
    command: Command<any>,
  ) => void;
  commandPermissionDenied: (
    msg: Message,
    command: Command<any>,
    missing: string[],
  ) => void;
  commandBotPermissionDenied: (
    msg: Message,
    command: Command<any>,
    missing: string[],
  ) => void;
}

export class CommandHandler {
  readonly client: Client;
  readonly commands = new Map<string, Command<any>>();
  readonly aliases = new Map<string, string>();
  readonly cooldowns = new Map<string, number>();
  readonly owners: Set<Snowflake>;
  prefixes: string[];
  mentionPrefix: boolean;
  ignoreBots: boolean;
  ignoreSelf: boolean;
  readonly middlewares: CommandMiddleware[] = [];
  private _bound = false;

  constructor(client: Client, opts: CommandHandlerOptions = {}) {
    this.client = client;
    this.prefixes = (Array.isArray(opts.prefix) ? opts.prefix : [opts.prefix ?? '!'])
      .map((p) => p ?? '')
      .sort((a, b) => b.length - a.length);
    this.mentionPrefix = opts.mentionPrefix !== false;
    this.owners = new Set(opts.owners ?? []);
    this.ignoreBots = opts.ignoreBots !== false;
    this.ignoreSelf = opts.ignoreSelf !== false;
  }

  use(fn: CommandMiddleware): this {
    this.middlewares.push(fn);
    return this;
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
    if (usedPrefix === null && this.mentionPrefix && this.client.user?.id) {
      const botId = this.client.user.id;
      const mentionMatch = new RegExp(`^<@!?${botId}>\\s*`).exec(content);
      if (mentionMatch) {
        usedPrefix = mentionMatch[0];
      }
    }
    if (usedPrefix === null) return;

    const without = content.slice(usedPrefix.length).trim();
    if (!without) return;

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

    if (command.botOwnerOnly && !this.owners.has(msg.sender_id)) {
      await this._safeReply(msg, 'Only bot owners can use this command.');
      return;
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
      const need = command.permissionMask || resolvePermission(command.permissions);
      if ((memberPermissions & need) !== need) {
        const missing = this._missingNames(need, memberPermissions);
        const list = missing.length ? missing.map((n) => '`' + n + '`').join(', ') : 'required permissions';
        await this._safeReply(
          msg,
          `You are missing permission${missing.length === 1 ? '' : 's'}: ${list}.`,
        );
        this.client.emit('commandPermissionDenied', msg, command, missing);
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
      } else {
        botPermissions = resolvePermission(command.botPermissions) | command.botPermissionMask;
      }

      const needBot = command.botPermissionMask || resolvePermission(command.botPermissions);
      if ((botPermissions & needBot) !== needBot) {
        const missing = this._missingNames(needBot, botPermissions);
        const list = missing.length ? missing.map((n) => '`' + n + '`').join(', ') : 'required permissions';
        await this._safeReply(
          msg,
          `I am missing permission${missing.length === 1 ? '' : 's'}: ${list}.`,
        );
        this.client.emit('commandBotPermissionDenied', msg, command, missing);
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
          if (now >= exp) this.cooldowns.delete(k);
        }
      }
      this.cooldowns.set(key, now + command.cooldown);
    }

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
      const invokeChain = async (index: number): Promise<void> => {
        if (index < this.middlewares.length) {
          const mw = this.middlewares[index]!;
          if (mw.length >= 2) {
            await mw(ctx, () => invokeChain(index + 1));
          } else {
            const res = await (mw as (c: Context<any>) => boolean | void | Promise<boolean | void>)(ctx);
            if (res !== false) {
              await invokeChain(index + 1);
            }
          }
          return;
        }
        await command.run(ctx);
      };
      await invokeChain(0);
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

  private _missingNames(need: number, have: number): string[] {
    const names: string[] = [];
    const seen = new Set<number>();
    for (const [name, bit] of Object.entries(Permission)) {
      if (typeof bit !== 'number') continue;
      if ((need & bit) !== bit) continue;
      if ((have & bit) === bit) continue;
      if (seen.has(bit)) continue;
      seen.add(bit);
      names.push(name);
    }
    return names;
  }

  private async _safeReply(msg: Message, text: string): Promise<void> {
    try {
      await this.client.rest.createMessage(msg.room_id, {
        plaintext: text,
        reply_to_id: msg.id,
      });
    } catch {
      /* ignore */
    }
  }
}

export interface HelpCommandOptions {
  name?: string;
  aliases?: string[];
  description?: string;
  category?: string;
  title?: string;
  includeHidden?: boolean;
}

export function createHelpCommand(opts: HelpCommandOptions = {}) {
  const name = opts.name ?? 'help';
  const aliases = opts.aliases ?? ['commands', 'h'];
  const description =
    opts.description ??
    'Displays available commands or detailed info for a specific command';
  const category = opts.category ?? 'utility';

  return new Command({
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
        const lines: string[] = [
          `**${displayPrefix}${cmd.name}${sig ? ` ${sig}` : ''}**`,
        ];
        if (cmd.description) lines.push(cmd.description);
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
          const schema = cmd.argumentsSchema as Record<string, CommandArgumentOption>;
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

      const groups = new Map<string, Command<any>[]>();
      for (const cmd of ctx.client.commands.commands.values()) {
        if (cmd.hidden && !opts.includeHidden) continue;
        const cat = cmd.category || 'general';
        let list = groups.get(cat);
        if (!list) {
          list = [];
          groups.set(cat, list);
        }
        list.push(cmd);
      }

      const sections: string[] = [];
      if (opts.title) sections.push(opts.title);
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
      sections.push(
        `Tip: Use \`${displayPrefix}${name} <command>\` for detailed argument information.`,
      );
      await ctx.reply(sections.join('\n\n'));
    },
  });
}
