import type { PermissionName } from '@strafe-js/util';
import type { Context } from './Context.js';
import type { CommandArgumentsSchema } from './CommandArgument.js';

export interface CommandOptions<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
  name: string;
  aliases?: string[];
  description?: string;
  usage?: string;
  permissions?: PermissionName[];
  permissionMask?: number;
  botPermissions?: PermissionName[];
  botPermissionMask?: number;
  ownerOnly?: boolean;
  botOwnerOnly?: boolean;
  spaceOwnerOnly?: boolean;
  cooldown?: number;
  guildOnly?: boolean;
  dmOnly?: boolean;
  minArgs?: number;
  maxArgs?: number;
  arguments?: Schema;
  run: (ctx: Context<Schema>) => void | Promise<void>;
  onError?: (err: unknown, ctx: Context<Schema>) => void | Promise<void>;
}

export class Command<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;
  readonly usage: string;
  readonly permissions: PermissionName[];
  readonly permissionMask: number;
  readonly botPermissions: PermissionName[];
  readonly botPermissionMask: number;
  readonly ownerOnly: boolean;
  readonly botOwnerOnly: boolean;
  readonly spaceOwnerOnly: boolean;
  readonly cooldown: number;
  readonly guildOnly: boolean;
  readonly dmOnly: boolean;
  readonly minArgs: number;
  readonly maxArgs: number;
  readonly argumentsSchema: Schema | null;
  readonly run: (ctx: Context<Schema>) => void | Promise<void>;
  readonly onError: ((err: unknown, ctx: Context<Schema>) => void | Promise<void>) | null;

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
    this.usage = opts.usage ?? '';
    this.permissions = opts.permissions ?? [];
    this.permissionMask = opts.permissionMask ?? 0;
    this.botPermissions = opts.botPermissions ?? [];
    this.botPermissionMask = opts.botPermissionMask ?? 0;

    // ownerOnly / botOwnerOnly both refer to bot owners
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

  get names(): string[] {
    return [this.name, ...this.aliases];
  }
}

export function command<Schema extends CommandArgumentsSchema = CommandArgumentsSchema>(
  opts: CommandOptions<Schema>,
): Command<Schema> {
  return new Command<Schema>(opts);
}
