import { SlashCommandSubcommandBuilder, SlashCommandBuilder,  PermissionResolvable, SlashCommandSubcommandsOnlyBuilder } from "discord.js"

export type CommandType = {
  data: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  permissions?: Array<PermissionResolvable>,
  execute: Function,
  isDm?: boolean
}