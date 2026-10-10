import type { PermissionName } from '@strafe-js/util';
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
export declare class Command {
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
    constructor(opts: CommandOptions);
    get names(): string[];
}
export declare function command(opts: CommandOptions): Command;
//# sourceMappingURL=Command.d.ts.map