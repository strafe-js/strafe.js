import { EventEmitter } from 'node:events';
import { Room, Snowflake, Space, SpaceMember, User } from '@strafe-js/util';
import { Collection } from '@strafe-js/collection';
import { REST, RESTOptions } from '@strafe-js/rest';
import { Gateway, GatewayOptions, GatewayEvents } from '@strafe-js/ws';
import { CommandHandler, CommandHandlerOptions, CommandEvents } from './commands/CommandHandler.js';
export interface ClientOptions {
    apiBase: string;
    gatewayUrl: string;
    token?: string;
    authScheme?: 'Bot' | 'Bearer';
    prefix?: string | string[];
    owners?: Snowflake[];
    autoSubscribeSpaces?: boolean;
    heartbeatIntervalMs?: number;
    rest?: Partial<RESTOptions>;
    gateway?: Partial<GatewayOptions>;
    commands?: Partial<CommandHandlerOptions>;
}
export type ClientEvents = GatewayEvents & CommandEvents;
export declare interface Client {
    on<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
    on(event: string, listener: (...args: any[]) => void): this;
    once<E extends keyof ClientEvents>(event: E, listener: ClientEvents[E]): this;
    once(event: string, listener: (...args: any[]) => void): this;
    emit<E extends keyof ClientEvents>(event: E, ...args: Parameters<ClientEvents[E]>): boolean;
    emit(event: string, ...args: any[]): boolean;
}
export declare class Client extends EventEmitter {
    readonly rest: REST;
    gateway: Gateway;
    readonly commands: CommandHandler;
    user: User | null;
    readonly spaces: Collection<string, Space>;
    readonly rooms: Collection<string, Room>;
    readonly spaceRooms: Collection<string, Collection<string, Room>>;
    readonly members: Collection<string, Collection<string, SpaceMember>>;
    private opts;
    private _fetchingMembers;
    constructor(opts: ClientOptions);
    login(token?: string): Promise<this>;
    connect(token?: string): Promise<this>;
    destroy(): void;
    fetchMembers(spaceId: Snowflake): Promise<Collection<Snowflake, SpaceMember>>;
    fetchMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember | null>;
    getMember(spaceId: Snowflake, userId: Snowflake): SpaceMember | undefined;
    resolveMemberPermissions(userId: Snowflake, spaceId?: Snowflake | null, roomId?: Snowflake | null): number;
    private _cacheRoom;
    private _wireGateway;
}
//# sourceMappingURL=Client.d.ts.map