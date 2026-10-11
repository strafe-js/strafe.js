import { Permission, type Message, type Space, type Room, type CreateMessageBody, type PermissionResolvable, type Snowflake, type User, type SpaceMember } from '@strafe-js/util';
import type { Client } from '../Client.js';
import type { Command } from './Command.js';
import { ParsedArguments, type CommandArgumentsSchema } from './CommandArgument.js';
export interface ContextOptions<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
    client: Client;
    message: Message;
    args: string[];
    prefix: string;
    commandName: string;
    command: Command<Schema>;
    space: Space | null;
    room: Room | null;
    memberPermissions: number;
    botPermissions: number;
    parsedArguments?: ParsedArguments<Schema>;
}
export declare class Context<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
    readonly client: Client;
    readonly message: Message;
    readonly args: string[];
    readonly prefix: string;
    readonly commandName: string;
    readonly command: Command<Schema>;
    readonly space: Space | null;
    readonly room: Room | null;
    readonly memberPermissions: number;
    readonly botPermissions: number;
    readonly parsedArguments: ParsedArguments<Schema>;
    constructor(opts: ContextOptions<Schema>);
    get arguments(): ParsedArguments<Schema>;
    get authorId(): Snowflake;
    get author(): User | null;
    get roomId(): Snowflake;
    get spaceId(): Snowflake | null;
    get content(): string;
    get member(): SpaceMember | null;
    get botMember(): SpaceMember | null;
    reply(content: string | CreateMessageBody, extra?: Partial<CreateMessageBody>): Promise<Message>;
    send(content: string | CreateMessageBody, extra?: Partial<CreateMessageBody>): Promise<Message>;
    typing(): Promise<null>;
    react(emoji: string): Promise<null>;
    hasPermissions(required: PermissionResolvable): boolean;
    hasBotPermissions(required: PermissionResolvable): boolean;
    isBotOwner(): boolean;
    isOwner(): boolean;
    isSpaceOwner(): boolean;
}
export { Permission };
//# sourceMappingURL=Context.d.ts.map