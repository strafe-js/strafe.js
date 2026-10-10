import { type CreateMessageBody, type PermissionName, type PermissionResolvable, type Snowflake } from '@strafe-js/util';
export declare class MessageBuilder {
    private data;
    setContent(text: string): this;
    setReply(messageId: Snowflake): this;
    setMentions(userIds: Snowflake[]): this;
    setRoleMentions(roleIds: Snowflake[]): this;
    mentionEveryone(value?: boolean): this;
    setAttachments(ids: Snowflake[]): this;
    toJSON(): CreateMessageBody;
}
export declare function message(): MessageBuilder;
export declare function permissions(list: PermissionName[]): number;
export declare function permissionMask(...bits: PermissionResolvable[]): number;
//# sourceMappingURL=index.d.ts.map