import type { Snowflake } from '@RUTUJEKWIELKI/util';

export function userMention(id: Snowflake): string {
  return `<@${id}>`;
}

export function roleMention(id: Snowflake): string {
  return `<@&${id}>`;
}

export function roomMention(id: Snowflake): string {
  return `<#${id}>`;
}

export function customEmoji(name: string, id: Snowflake, animated = false): string {
  return animated ? `<a:${name}:${id}>` : `<:${name}:${id}>`;
}

export function escapeMarkdown(text: string): string {
  return String(text).replace(/([*_`~|\\])/g, '\\$1');
}
