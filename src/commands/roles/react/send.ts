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
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
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
import { RoleReact } from "../../../models/RoleReact";
import Guild from "../../../schemas/guild";

function chunkArray(myArray, chunk_size: number) {
    var results = [];
    var newArray = [...myArray];
    while (newArray.length) {
        results.push(newArray.splice(0, chunk_size));
    }

    return results;
}

export default new Command({
    data: new SlashCommandSubcommandBuilder()
        .setName("send")
        .setDescription("Send the role reaction message")
        .addNumberOption((opt) =>
            opt
                .setName("id")
                .setDescription("Id of the message reaction")
                .setRequired(true)
        ),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const id = interaction.options.getNumber("id");
        const embed = new EmbedBuilder()
            .setTitle("Role reaction")
            .setDescription("React to get a role")
            .setColor(getRandomColor());
        
        const guild = await Guild.findById(interaction.guild.id);
        const roleReactMsg = guild.roleReacts.sort((a,b) =>a.createdAt.getTime() - b.createdAt.getTime())[id]
        const roleReactions = roleReactMsg.reactions
        console.log(guild.roleReacts[0]);
        const sortedRoleReactions = roleReactions
            .map((r) => {
                if (!interaction.guild.roles.cache.has(r.roleId)) return null;
                return r;
            })
            .filter((r) => r !== null);
        
        if (sortedRoleReactions.length == 0) {
            embed.setDescription(
                "There is no role in role reaction message!\nUse `/role react add` to add a role !"
            );
            interaction.reply({ embeds: [embed] });
            return;
        }


        embed.addFields({
            name: "Roles",
            value: sortedRoleReactions
                .map((r) => {
                    return `**${r.label}** - ${roleMention(r.roleId)}`;
                })
                .join("\n"),
        });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => {
                console.log(
                    "CUSTOM",
                    i.customId,
                    sortedRoleReactions.map((r) => `role__${r.roleId}`)
                );
                return sortedRoleReactions
                    .map((r) => `role__${r.roleId}`)
                    .includes(i.customId);
            },
        });

        collector.on("collect", async (i) => {
            const member = i.member as GuildMember;
            const id = i.customId.replace("role__", "");
            const embed = new EmbedBuilder();
            if (member.roles.cache.has(id)) {
                await member.roles.remove(id).then((r) => {
                    embed
                        .setTitle("Role reaction removed")
                        .setDescription(`Role ${roleMention(id)} removed ! `)
                        .setColor(getRandomColor());
                });
            } else {
                await member.roles.add(id).then((r) => {
                    embed
                        .setTitle("Role reaction added")
                        .setDescription(`Role ${roleMention(id)} added ! `)
                        .setColor(getRandomColor());
                });
            }
            i.reply({ embeds: [embed], ephemeral: true });
        });

        interaction.reply({
            embeds: [embed],
            components: [
                ...chunkArray(sortedRoleReactions, 5).map((a) => {
                    return new ActionRowBuilder<ButtonBuilder>().setComponents(
                        a.map((r) => {
                            return new ButtonBuilder()
                                .setLabel(r.label)
                                .setCustomId(`role__` + r.roleId)
                                .setStyle(ButtonStyle.Primary);
                        })
                    );
                }),
            ],
        });

    },
});
/* execute: async (interaction: ChatInputCommandInteraction) => {
        const embed = new EmbedBuilder()
            .setTitle("Role reaction")
            .setDescription("React to get a role")
            .setColor(getRandomColor());

        const rolesReactions = await db.manager.findBy(RoleReact, {
            guildId: interaction.guild.id,
        });
        const sortedRoleReactions = rolesReactions
            .map((r) => {
                if (!interaction.guild.roles.cache.has(r.roleId)) return null;
                return r;
            })
            .filter((r) => r !== null);
        if (sortedRoleReactions.length == 0) {
            embed.setDescription(
                "There is no role in role reaction message!\nUse `/role react add` to add a role !"
            );
            interaction.reply({ embeds: [embed] });
            return;
        }
        embed.addFields({
            name: "Roles",
            value: sortedRoleReactions
                .map((r) => {
                    return `**${r.name}** - ${roleMention(r.roleId)}`;
                })
                .join("\n"),
        });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => {
                console.log(
                    "CUSTOM",
                    i.customId,
                    sortedRoleReactions
                        .map((r) => `role__${r.roleId}`)
                );
                return sortedRoleReactions
                    .map((r) => `role__${r.roleId}`)
                    .includes(i.customId);
            },
        });

        collector.on("collect", async (i) => {
            const member = i.member as GuildMember;
            const id = i.customId.replace("role__", "");
            const embed = new EmbedBuilder();
            if (member.roles.cache.has(id)) {
                await member.roles.remove(id).then((r) => {
                    embed
                        .setTitle("Role reaction removed")
                        .setDescription(`Role ${roleMention(id)} removed ! `)
                        .setColor(getRandomColor());
                });
            } else {
                await member.roles.add(id).then((r) => {
                    embed
                        .setTitle("Role reaction added")
                        .setDescription(`Role ${roleMention(id)} added ! `)
                        .setColor(getRandomColor());
                });
            }
            i.reply({ embeds: [embed], ephemeral: true });
        });
            
        interaction.reply({
            embeds: [embed],
            components: [
                ...chunkArray(sortedRoleReactions, 5).map((a) => {
                    return new ActionRowBuilder<ButtonBuilder>().setComponents(
                        a.map((r) => {
                            return new ButtonBuilder()
                                .setLabel(r.name)
                                .setCustomId(`role__` + r.roleId).setStyle(ButtonStyle.Primary);
                        })
                    );
                }),
            ],
        });
    }, */
