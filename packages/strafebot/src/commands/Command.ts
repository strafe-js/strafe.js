import type { PermissionName } from '@RUTUJEKWIELKI/util';
import type { Context } from './Context.js';

export interface CommandOptions {
  name: string;
  aliases?: string[];
  description?: string;
  usage?: string;
  permissions?: PermissionName[];
  permissionMask?: number;
  ownerOnly?: boolean;
  botOwnerOnly?: boolean;
  cooldown?: number;
  guildOnly?: boolean;
  dmOnly?: boolean;
  minArgs?: number;
  maxArgs?: number;
  run: (ctx: Context) => void | Promise<void>;
  onError?: (err: unknown, ctx: Context) => void | Promise<void>;
}

export class Command {
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;
  readonly usage: string;
  readonly permissions: PermissionName[];
  readonly permissionMask: number;
  readonly ownerOnly: boolean;
  readonly botOwnerOnly: boolean;
  readonly cooldown: number;
  readonly guildOnly: boolean;
  readonly dmOnly: boolean;
  readonly minArgs: number;
  readonly maxArgs: number;
  readonly run: (ctx: Context) => void | Promise<void>;
  readonly onError: ((err: unknown, ctx: Context) => void | Promise<void>) | null;

  constructor(opts: CommandOptions) {
    if (!opts?.name || typeof opts.run !== 'function') {
      throw new Error('Command requires name and run()');
    }
    this.name = opts.name.toLowerCase();
    this.aliases = (opts.aliases ?? []).map((a) => a.toLowerCase());
    this.description = opts.description ?? '';
    this.usage = opts.usage ?? '';
    this.permissions = opts.permissions ?? [];
    this.permissionMask = opts.permissionMask ?? 0;
    this.ownerOnly = !!opts.ownerOnly;
    this.botOwnerOnly = !!opts.botOwnerOnly;
    this.cooldown = opts.cooldown ?? 0;
    this.guildOnly = !!opts.guildOnly;
    this.dmOnly = !!opts.dmOnly;
    this.minArgs = opts.minArgs ?? 0;
    this.maxArgs = opts.maxArgs ?? Infinity;
    this.run = opts.run;
    this.onError = opts.onError ?? null;
  }

  get names(): string[] {
    return [this.name, ...this.aliases];
  }
}

export function command(opts: CommandOptions): Command {
  return new Command(opts);
}
