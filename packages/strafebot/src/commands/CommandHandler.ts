import { Permission, resolvePermission, type Message, type Snowflake } from '@strafe-js/util';
import type { Client } from '../Client.js';
import { Command, type CommandOptions } from './Command.js';
import { Context } from './Context.js';

export interface CommandHandlerOptions {
  prefix?: string | string[];
  owners?: Snowflake[];
  ignoreBots?: boolean;
  ignoreSelf?: boolean;
}

export class CommandHandler {
  readonly client: Client;
  readonly commands = new Map<string, Command>();
  readonly aliases = new Map<string, string>();
  readonly cooldowns = new Map<string, number>();
  readonly owners: Set<Snowflake>;

  prefixes: string[];
  ignoreBots: boolean;
  ignoreSelf: boolean;
  private _bound = false;

  constructor(client: Client, opts: CommandHandlerOptions = {}) {
    this.client = client;
    this.prefixes = Array.isArray(opts.prefix) ? opts.prefix : [opts.prefix ?? '!'];
    this.owners = new Set(opts.owners ?? []);
    this.ignoreBots = opts.ignoreBots !== false;
    this.ignoreSelf = opts.ignoreSelf !== false;
  }

  setPrefix(prefix: string | string[]): this {
    this.prefixes = Array.isArray(prefix) ? prefix : [prefix];
    return this;
  }

  setOwners(ids: Snowflake[]): this {
    this.owners.clear();
    for (const id of ids) this.owners.add(id);
    return this;
  }

  register(cmd: Command | CommandOptions): this {
    const command = cmd instanceof Command ? cmd : new Command(cmd);
    if (this.commands.has(command.name)) {
      throw new Error(`duplicate command: ${command.name}`);
    }
    this.commands.set(command.name, command);
    for (const alias of command.aliases) {
      this.aliases.set(alias, command.name);
    }
    return this;
  }

  registerAll(list: Array<Command | CommandOptions>): this {
    for (const c of list) this.register(c);
    return this;
  }

  get(name: string): Command | null {
    const key = name.toLowerCase();
    const real = this.commands.get(key) ?? this.commands.get(this.aliases.get(key) ?? '');
    return real ?? null;
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
    if (!usedPrefix) return;

    const without = content.slice(usedPrefix.length).trim();
    if (!without) return;

    const parts = without.split(/\s+/);
    const commandName = (parts.shift() ?? '').toLowerCase();
    const args = parts;

    const command = this.get(commandName);
    if (!command) return;

    if (args.length < command.minArgs) {
      await this._safeReply(msg, `usage: ${usedPrefix}${command.name} ${command.usage}`.trim());
      return;
    }
    if (args.length > command.maxArgs) {
      await this._safeReply(msg, 'too many arguments');
      return;
    }

    const room = this.client.rooms.get(msg.room_id) ?? null;
    const spaceId = room?.space_id ?? msg.space_id ?? null;
    const space = spaceId ? this.client.spaces.get(spaceId) ?? null : null;

    if (command.guildOnly && !spaceId) {
      await this._safeReply(msg, 'this command only works in a space');
      return;
    }
    if (command.dmOnly && spaceId) {
      await this._safeReply(msg, 'this command only works in DMs');
      return;
    }

    if (command.ownerOnly || command.botOwnerOnly) {
      if (!this.owners.has(msg.sender_id)) {
        await this._safeReply(msg, 'you cannot use this command');
        return;
      }
    }

    let memberPermissions = 0;
    if (command.permissions.length || command.permissionMask) {
      memberPermissions = this.client.resolveMemberPermissions(msg.sender_id, spaceId, msg.room_id);
      const need = command.permissionMask || resolvePermission(command.permissions);
      if ((memberPermissions & need) !== need) {
        await this._safeReply(msg, 'missing permissions');
        return;
      }
    }

    if (command.cooldown > 0) {
      const key = `${command.name}:${msg.sender_id}`;
      const until = this.cooldowns.get(key) ?? 0;
      const now = Date.now();
      if (now < until) {
        const left = Math.ceil((until - now) / 1000);
        await this._safeReply(msg, `cooldown: ${left}s`);
        return;
      }
      this.cooldowns.set(key, now + command.cooldown);
    }

    const ctx = new Context({
      client: this.client,
      message: msg,
      args,
      prefix: usedPrefix,
      commandName,
      command,
      space,
      room,
      memberPermissions,
    });

    try {
      await command.run(ctx);
    } catch (err) {
      if (command.onError) {
        try {
          await command.onError(err, ctx);
        } catch {
          /* swallow secondary */
        }
      } else {
        this.client.emit('commandError', err, ctx);
        await this._safeReply(msg, 'command failed');
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
      /* ignore */
    }
  }
}
