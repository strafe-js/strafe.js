import { EventEmitter } from 'node:events';
import { REST } from '@strafe-js/rest';
import { Gateway } from '@strafe-js/ws';
import { Collection } from '@strafe-js/collection';
import { type Snowflake, type User, type Space, type Room, type SpaceMember } from '@strafe-js/util';
import { CommandHandler, type CommandHandlerOptions } from './commands/CommandHandler.js';
export interface ClientOptions extends CommandHandlerOptions {
    apiBase: string;
    gatewayUrl: string;
    reconnectDelay?: number;
}
export declare class Client extends EventEmitter {
    readonly options: ClientOptions;
    token: string | null;
    user: User | null;
    readonly rest: REST;
    gateway: Gateway | null;
    readonly spaces: Collection<string, Space>;
    readonly rooms: Collection<string, Room>;
    readonly spaceRooms: Collection<string, Collection<string, Room>>;
    readonly members: Collection<string, Collection<string, SpaceMember>>;
    readonly commands: CommandHandler;
    private _fetchingMembers;
    constructor(options: ClientOptions);
    login(token: string): Promise<this>;
    /** Alias for login. */
    connect(token: string): Promise<this>;
    destroy(): void;
    fetchMembers(spaceId: Snowflake): Promise<Collection<Snowflake, SpaceMember>>;
    fetchMember(spaceId: Snowflake, userId: Snowflake): Promise<SpaceMember | null>;
    /**
     * Resolve effective permission mask for a user in a space/room.
     * Follows exact equinox rules:
     * 1. Space Owner / Administrator bit => ALL_PERMISSIONS
     * 2. @everyone role base + user role bases
     * 3. Room overrides: @everyone deny/allow
     * 4. Room overrides: aggregated role denies, then aggregated role allows
     * 5. Room overrides: user deny, then user allow
     * 6. Dependent permission cascades (e.g. !ViewRoom clears room perms)
     */
    resolveMemberPermissions(userId: Snowflake, spaceId: Snowflake | null | undefined, roomId?: Snowflake): number;
    private _wireGateway;
}
//# sourceMappingURL=Client.d.ts.map