import {
  Permission,
  resolvePermission,
  type Message,
  type Space,
  type Room,
  type CreateMessageBody,
  type PermissionResolvable,
  type Snowflake,
  type User,
  type SpaceMember,
} from '@strafe-js/util';
import type { Client } from '../Client.js';
import type { Command } from './Command.js';
import {
  ParsedArguments,
  type CommandArgumentsSchema,
  type InferArguments,
} from './CommandArgument.js';

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

export class Context<Schema extends CommandArgumentsSchema = CommandArgumentsSchema> {
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

  constructor(opts: ContextOptions<Schema>) {
    this.client = opts.client;
    this.message = opts.message;
    this.args = opts.args;
    this.prefix = opts.prefix;
    this.commandName = opts.commandName;
    this.command = opts.command;
    this.space = opts.space;
    this.room = opts.room;
    this.memberPermissions = opts.memberPermissions;
    this.botPermissions = opts.botPermissions;
    this.parsedArguments = opts.parsedArguments ?? new ParsedArguments<Schema>();
  }

  get arguments(): ParsedArguments<Schema> {
    return this.parsedArguments;
  }

  get authorId(): Snowflake {
    return this.message.sender_id;
  }

  get author(): User | null {
    return this.client.user?.id === this.authorId ? this.client.user : null;
  }

  get roomId(): Snowflake {
    return this.message.room_id;
  }

  get spaceId(): Snowflake | null {
    return this.space?.id ?? this.message.space_id ?? null;
  }

  get content(): string {
    return this.message.plaintext ?? '';
  }

  get member(): SpaceMember | null {
    if (!this.spaceId) return null;
    return this.client.members.get(this.spaceId)?.get(this.authorId) ?? null;
  }

  get botMember(): SpaceMember | null {
    if (!this.spaceId || !this.client.user?.id) return null;
    return this.client.members.get(this.spaceId)?.get(this.client.user.id) ?? null;
  }

  async reply(content: string | CreateMessageBody, extra: Partial<CreateMessageBody> = {}): Promise<Message> {
    const body: CreateMessageBody =
      typeof content === 'string'
        ? { plaintext: content, ...extra }
        : { ...content, ...extra };

    if (body.reply_to_id === undefined) {
      body.reply_to_id = this.message.id;
    }

    return this.client.rest.createMessage(this.roomId, body);
  }

  async send(content: string | CreateMessageBody, extra: Partial<CreateMessageBody> = {}): Promise<Message> {
    const body: CreateMessageBody =
      typeof content === 'string'
        ? { plaintext: content, ...extra }
        : { ...content, ...extra };
    return this.client.rest.createMessage(this.roomId, body);
  }

  async typing(): Promise<null> {
    await this.client.rest.triggerTyping(this.roomId);
    return null;
  }

  async react(emoji: string): Promise<null> {
    await this.client.rest.addReaction(this.roomId, this.message.id, emoji);
    return null;
  }

  hasPermissions(required: PermissionResolvable): boolean {
    const mask = resolvePermission(required);
    return (this.memberPermissions & mask) === mask;
  }

  hasBotPermissions(required: PermissionResolvable): boolean {
    const mask = resolvePermission(required);
    return (this.botPermissions & mask) === mask;
  }

  isBotOwner(): boolean {
    return this.client.commands.owners.has(this.authorId);
  }

  isOwner(): boolean {
    return this.isBotOwner();
  }

  isSpaceOwner(): boolean {
    if (!this.space) return false;
    return this.space.owner_id === this.authorId;
  }
}

// re-export for consumers who import Permission from context path
export { Permission };
