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
} from "discord.js";
import db from "../../../dbInit";
import { RoleReact } from "../../../models/RoleReact";
import { Command } from "../../../structures/Command";
import { getRandomColor } from "../../../utils/embed";
import { get_username } from "../../../utils/guilds";
import { getMentionFromId } from "../../../utils/mentions";

export default new Command({
    data: new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Remove a role to role reaction message")
        .addRoleOption((opt) =>
            opt
                .setName("role")
                .setDescription("Role to remove")
                .setRequired(true)
        ),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const role = interaction.options.getRole("role") as Role;
        const embed = new EmbedBuilder()
            .setTitle("Role reaction")
            .setColor(getRandomColor());

        if (!role.editable) {
            embed.setDescription(
                `I don't have the permissions to manage role ${roleMention(
                    role.id
                )}`
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const highest = (interaction.member.roles as GuildMemberRoleManager)
            .highest;

        if (highest.position < role.position) {
            embed.setDescription(
                `You can't add role ${roleMention(
                    role.id
                )} because it is better than your highest role (${roleMention(
                    highest.id
                )}) !
                    `
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const roleReact = await db.manager.findOneBy(RoleReact, {
            guildId: interaction.guild.id,
            roleId: role.id,
        });
        if (roleReact === null) {
            embed.setDescription(
                `Role ${roleMention(
                    role.id
                )} is not in the role reaction message !\nUse ${"`/role react add`"} to add it`
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return
        }
        db.manager.delete(RoleReact, { ...roleReact }).then((r) => {
            embed.setDescription(
                `Role ${roleMention(
                    role.id
                )} removed to the role reaction message\nUse ${"`/role react msg`"} to send the message`
            );
            interaction.reply({ embeds: [embed] });
        });
    },
});
