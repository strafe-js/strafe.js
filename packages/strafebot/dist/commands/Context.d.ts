import { Permission, type Message, type Space, type Room, type CreateMessageBody, type PermissionResolvable, type Snowflake } from '@strafe-js/util';
import type { Client } from '../Client.js';
import type { Command } from './Command.js';
export interface ContextOptions {
    client: Client;
    message: Message;
    args: string[];
    prefix: string;
    commandName: string;
    command: Command;
    space: Space | null;
    room: Room | null;
    memberPermissions: number;
}
export declare class Context {
    readonly client: Client;
    readonly message: Message;
    readonly args: string[];
    readonly prefix: string;
    readonly commandName: string;
    readonly command: Command;
    readonly space: Space | null;
    readonly room: Room | null;
    readonly memberPermissions: number;
    constructor(opts: ContextOptions);
    get authorId(): Snowflake;
    get roomId(): Snowflake;
    get content(): string;
    reply(content: string | CreateMessageBody, extra?: Partial<CreateMessageBody>): Promise<Message>;
    send(content: string | CreateMessageBody, extra?: Partial<CreateMessageBody>): Promise<Message>;
    typing(): Promise<null>;
    react(emoji: string): Promise<null>;
    hasPermissions(required: PermissionResolvable): boolean;
    isOwner(): boolean;
}
export { Permission };
//# sourceMappingURL=Context.d.ts.map