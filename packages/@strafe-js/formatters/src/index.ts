import { Snowflake } from '@strafe-js/util';

export const userMention = (id: Snowflake): string => `<@${id}>`;

export const roleMention = (id: Snowflake): string => `<@&${id}>`;

export const roomMention = (id: Snowflake): string => `<#${id}>`;

export const customEmoji = (
  name: string,
  id: Snowflake,
  animated = false,
): string => `<${animated ? 'a' : ''}:${name}:${id}>`;

export const customReactionEmoji = (id: Snowflake): string => `custom:${id}`;

export const escapeMarkdown = (text: string): string =>
  text.replace(/([*_`~|\\])/g, '\\$1');
