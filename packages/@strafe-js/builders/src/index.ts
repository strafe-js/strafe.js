import {
  BitField,
  resolvePermission,
  type CreateMessageBody,
  type PermissionName,
  type PermissionResolvable,
  type Snowflake,
} from '@strafe-js/util';

export class MessageBuilder {
  private data: CreateMessageBody = {};

  setContent(text: string): this {
    this.data.plaintext = text;
    return this;
  }

  setReply(messageId: Snowflake): this {
    this.data.reply_to_id = messageId;
    return this;
  }

  setMentions(userIds: Snowflake[]): this {
    this.data.mentions = userIds;
    return this;
  }

  setRoleMentions(roleIds: Snowflake[]): this {
    this.data.mention_roles = roleIds;
    return this;
  }

  mentionEveryone(value = true): this {
    this.data.mention_everyone = value;
    return this;
  }

  setAttachments(ids: Snowflake[]): this {
    this.data.attachments = ids;
    return this;
  }

  toJSON(): CreateMessageBody {
    return { ...this.data };
  }
}

export function message(): MessageBuilder {
  return new MessageBuilder();
}

export function permissions(list: PermissionName[]): number {
  return resolvePermission(list);
}

export function permissionMask(...bits: PermissionResolvable[]): number {
  return new BitField().add(...bits).bitfield;
}
