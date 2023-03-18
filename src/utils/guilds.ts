import { GuildMember } from "discord.js";

export const get_username = (member: GuildMember) => {
  return member.nickname !== null ? member.nickname: member.user.username
}