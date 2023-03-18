import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    GuildMemberRoleManager,
    PermissionsBitField,
    Role,
    roleMention,
    SlashCommandSubcommandBuilder,
    userMention,
} from "discord.js";
import { Command } from "../../structures/Command";
import { getRandomColor } from "../../utils/embed";

export default new Command({
    data: new SlashCommandSubcommandBuilder()
        .setName("toggle")
        .setDescription("Toggle a role to user")

        .addRoleOption((opt) =>
            opt.setName("role").setDescription("Role to toggle").setRequired(true)
        )
        .addUserOption((opt) =>
            opt.setName("target").setDescription("User who receive or lose the role")
        )
        .addStringOption((opt) =>
            opt
                .setName("reason")
                .setDescription("Reason to toggle the role")
                .setRequired(false)
        ),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: (interaction: ChatInputCommandInteraction) => {
        const member =
            (interaction.options.getMember("target") as GuildMember) ||
            (interaction.member as GuildMember);
        const role = interaction.options.getRole("role") as Role;
        const embed = new EmbedBuilder()
            .setTitle("Role").setColor(getRandomColor())
        if (!role.editable) {
            embed.setDescription(
                `I don't have the permissions to manage role ${roleMention(
                    role.id
                )}`
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return
        }
        const reason = interaction.options.getString("reason");

        const roleManager = member.roles as GuildMemberRoleManager;

        const highest = (interaction.member.roles as GuildMemberRoleManager)
            .highest;;

        if (highest.position < role.position) {
            embed
                .setDescription(
                    `You can't manage role ${roleMention(
                        role.id
                    )} because it is better than your highest role (${roleMention(
                        highest.id
                    )}) !
                    `
                )
            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (roleManager.cache.has(role.id)) {
            roleManager.remove(role, reason).then((r) => {
                embed
                    .setDescription(
                        `Role ${roleMention(
                            role.id
                        )} **removed** to ${userMention(
                            member.id
                        )} by ${userMention(interaction.user.id)} ${
                            reason != null ? `with reason : **${reason}**` : "!"
                        }`
                    )
                    .setColor(getRandomColor());
                interaction.reply({ embeds: [embed] });
            });
            return;
        }

        roleManager.add(role, reason).then((r) => {
            embed
                .setDescription(
                    `Role ${roleMention(role.id)} **added** to ${userMention(
                        member.id
                    )} by ${userMention(interaction.user.id)} ${
                        reason != null ? `with reason : **${reason}**` : "!"
                    }`
                )
                .setColor(getRandomColor());
            interaction.reply({ embeds: [embed] });
        });
    },
});
