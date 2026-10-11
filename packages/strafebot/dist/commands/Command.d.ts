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
export declare class Command<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
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
    constructor(opts: CommandOptions<Schema>);
    get names(): string[];
}
export declare function command<Schema extends CommandArgumentsSchema = CommandArgumentsSchema>(opts: CommandOptions<Schema>): Command<Schema>;
//# sourceMappingURL=Command.d.ts.map