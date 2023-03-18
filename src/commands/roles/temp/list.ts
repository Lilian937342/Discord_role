import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    GuildMemberRoleManager,
    PermissionsBitField,
    Role,
    SlashCommandSubcommandBuilder,
    ColorResolvable,
    roleMention,
    userMention,
    RoleManager,
    TimestampStyles,
} from "discord.js";
import { Command } from "../../../structures/Command";
import { getRandomColor } from "../../../utils/embed";
import { get_username } from "../../../utils/guilds";
import { getMentionFromId } from "../../../utils/mentions";
import { scheduleJob } from "node-schedule";
import db from "../../../dbInit";
import { TempRole } from "../../../models/TempRole";
import { timeFormat } from "../../../utils/time";
import { expireRole } from "../../../utils/temporaryRoles";
export default new Command({
    data: new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("List temporary role to user")
        .addUserOption((opt) =>
            opt.setName("target").setDescription("User who receive the role")
        ),
    execute: async (interaction: ChatInputCommandInteraction) => {
        const member =
            (interaction.options.getMember("target") as GuildMember) ||
            (interaction.member as GuildMember);

        const tempRoles = await db.manager.find(TempRole, {
            where: {
                userId: member.id,
                guildId: interaction.guild.id,
            },
        });

        const embed = new EmbedBuilder()
            .setTitle(`Temporary roles of ${get_username(member)}`)
            .setDescription(`${userMention(member.id)} has no temporary role`)
            .setColor(getRandomColor());
        
        if (tempRoles.length != 0) {
            embed.setDescription(
                tempRoles
                    .map((t) => {
                        let role = interaction.guild.roles.cache.get(t.roleId);
                        if (!role) {
                            db.manager.delete(TempRole, { ...t });
                            return null
                        }
                        if (!member.roles.cache.has(role.id)) {
                            db.manager.delete(TempRole, { ...t });
                            return null;
                        }
                        let date = t.expire;
                        return `${roleMention(role.id)} - expire ${timeFormat(
                            date.getTime(),
                            TimestampStyles.RelativeTime
                        )}`;
                    }).filter((t)=>t != null)
                    .join("\n")
            );
        }
        interaction.reply({ embeds: [embed] });
    },
});
