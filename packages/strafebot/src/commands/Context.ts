import {
  Permission,
  resolvePermission,
  type Message,
  type Space,
  type Room,
  type CreateMessageBody,
  type PermissionResolvable,
  type Snowflake,
} from '@strafe-js/util';
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

export class Context {
  readonly client: Client;
  readonly message: Message;
  readonly args: string[];
  readonly prefix: string;
  readonly commandName: string;
  readonly command: Command;
  readonly space: Space | null;
  readonly room: Room | null;
  readonly memberPermissions: number;

  constructor(opts: ContextOptions) {
    this.client = opts.client;
    this.message = opts.message;
    this.args = opts.args;
    this.prefix = opts.prefix;
    this.commandName = opts.commandName;
    this.command = opts.command;
    this.space = opts.space;
    this.room = opts.room;
    this.memberPermissions = opts.memberPermissions;
  }

  get authorId(): Snowflake {
    return this.message.sender_id;
  }

  get roomId(): Snowflake {
    return this.message.room_id;
  }

  get content(): string {
    return this.message.plaintext ?? '';
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
    return this.client.rest.triggerTyping(this.roomId);
  }

  async react(emoji: string): Promise<null> {
    return this.client.rest.addReaction(this.roomId, this.message.id, emoji);
  }

  hasPermissions(required: PermissionResolvable): boolean {
    const mask = resolvePermission(required);
    return (this.memberPermissions & mask) === mask;
  }

  isOwner(): boolean {
    return this.client.commands.owners.has(this.authorId);
  }
}

// re-export for consumers who import Permission from context path
export { Permission };
