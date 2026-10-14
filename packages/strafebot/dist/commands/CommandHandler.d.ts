import { type Message, type Snowflake } from '@strafe-js/util';
import type { Client } from '../Client.js';
import { Command, type CommandOptions } from './Command.js';
import { Context } from './Context.js';
import { ArgumentValidationError } from './CommandArgument.js';
export interface CommandHandlerOptions {
    prefix?: string | string[];
    owners?: Snowflake[];
    ignoreBots?: boolean;
    ignoreSelf?: boolean;
}
export interface CommandEvents {
    commandError: (err: unknown, ctx: Context<any>) => void;
    commandArgumentError: (err: ArgumentValidationError, msg: Message, command: Command<any>) => void;
}
export declare class CommandHandler {
    readonly client: Client;
    readonly commands: Map<string, Command<any>>;
    readonly aliases: Map<string, string>;
    readonly cooldowns: Map<string, number>;
    readonly owners: Set<Snowflake>;
    prefixes: string[];
    ignoreBots: boolean;
    ignoreSelf: boolean;
    private _bound;
    constructor(client: Client, opts?: CommandHandlerOptions);
    setPrefix(prefix: string | string[]): this;
    setOwners(ids: Snowflake[]): this;
    register(cmd: Command<any> | CommandOptions<any>): this;
    registerAll(list: Array<Command<any> | CommandOptions<any>>): this;
    get(name: string): Command<any> | null;
    attach(): this;
    private _onMessage;
    private _safeReply;
}
//# sourceMappingURL=CommandHandler.d.ts.map