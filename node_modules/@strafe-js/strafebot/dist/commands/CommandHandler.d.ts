import { type Snowflake } from '@strafe-js/util';
import type { Client } from '../Client.js';
import { Command, type CommandOptions } from './Command.js';
export interface CommandHandlerOptions {
    prefix?: string | string[];
    owners?: Snowflake[];
    ignoreBots?: boolean;
    ignoreSelf?: boolean;
}
export declare class CommandHandler {
    readonly client: Client;
    readonly commands: Map<string, Command>;
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
    register(cmd: Command | CommandOptions): this;
    registerAll(list: Array<Command | CommandOptions>): this;
    get(name: string): Command | null;
    attach(): this;
    private _onMessage;
    private _safeReply;
}
//# sourceMappingURL=CommandHandler.d.ts.map