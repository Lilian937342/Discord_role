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
import Guild from "../../../schemas/guild";
import { Command } from "../../../structures/Command";
import { getRandomColor } from "../../../utils/embed";
import { get_username } from "../../../utils/guilds";
import { getMentionFromId } from "../../../utils/mentions";

export default new Command({
    data: new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a role to role reaction message")
        .addRoleOption((opt) =>
            opt.setName("role").setDescription("Role to add").setRequired(true)
        )
        .addNumberOption((opt) =>
            opt.setName("id").setDescription("id").setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName("name")
                .setDescription("Name of the role to show on button")
                .setRequired(false)
        ),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const role = interaction.options.getRole("role") as Role;
        const id = interaction.options.getNumber("id") ;
        const name = interaction.options.getString("name") || role.name;
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

        const guild = await Guild.findById(interaction.guild.id)
        if (id > guild.roleReacts.length - 1) {
            interaction.reply("eh non");
            return;
        }
        const roleReactMsg = guild.roleReacts.sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )[id];
        
        const existing = roleReactMsg.reactions.filter((r)=>r.roleId == role.id)
        console.log(existing)
        if (existing.length != 0) {
            embed.setDescription(
                `${roleMention(
                    role.id
                )} is already in the role reaction message`
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const named = roleReactMsg.reactions.filter(r=>r.label == name)
        if (named.length != 0) {
            embed.setDescription(
                `**${name}** is already used in the role reaction message. Use ${'`/role react remove'} to remove it`
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const roleReact = roleReactMsg.reactions.push({label: name, roleId: role.id})
        await guild.save()
        embed.setDescription(
            `Role ${roleMention(
                role.id
            )} added to the role reaction message\nUse ${"`/role react msg`"} to send the message`
        );
        interaction.reply({ embeds: [embed] });
    },
});
