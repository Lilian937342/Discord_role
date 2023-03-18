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
        .setName("add")
        .setDescription("Add a temporary role to user")

        .addRoleOption((opt) =>
            opt.setName("role").setDescription("Role to add").setRequired(true)
        )
        .addUserOption((opt) =>
            opt.setName("target").setDescription("User who receive the role")
        )
        .addStringOption((opt) =>
            opt
                .setName("reason")
                .setDescription("Reason to adding the role")
                .setRequired(false)
        )
        .addNumberOption((opt) =>
            opt.setName("minutes").setDescription("Minutes").setRequired(false)
        )
        .addNumberOption((opt) =>
            opt.setName("hours").setDescription("Hours").setRequired(false)
        )
        .addNumberOption((opt) =>
            opt.setName("days").setDescription("Days").setRequired(false)
        ),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const member =
            (interaction.options.getMember("target") as GuildMember) ||
            (interaction.member as GuildMember);
        const role = interaction.options.getRole("role") as Role;
        const embed = new EmbedBuilder()
            .setTitle("Temporary role")
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
        const reason = interaction.options.getString("reason");

        const roleManager = member.roles as GuildMemberRoleManager;

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

        if (roleManager.cache.has(role.id)) {
            embed.setDescription(
                `
                    ${userMention(member.id)} already have role ${roleMention(
                    role.id
                )} !
                    `
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        //here
        const minutes = interaction.options.getNumber("minutes") || 0;
        const hours = interaction.options.getNumber("hours") || 0;
        const days = interaction.options.getNumber("days") || 0
        const decaleTime =
            minutes * 60 * 1000 +
            hours * 60 * 60 * 1000 +
            days * 24 * 60 * 60 * 1000;
        if (decaleTime < 60 * 1000) {
            interaction.reply("NOPE");
            return;
        }

        const newDate = Date.now() + decaleTime;
        var tempRole = await db.manager.findOneBy(TempRole, {
            userId: member.id,
            guildId: interaction.guild.id,
            roleId: role.id,
        });
        if (tempRole === null) {
            tempRole = db.manager.create(TempRole, {
                userId: member.id,
                guildId: interaction.guild.id,
                roleId: role.id,
                channelId: interaction.channel.id,
            });
        }
        tempRole.expire = new Date(newDate)
        
        const tempRoleObj = await db.manager.save(tempRole);

        scheduleJob(new Date(newDate), async () => {
            expireRole(member, role, interaction.channel, tempRoleObj)
        });

        await roleManager.add(role, reason).then((r) => {
            embed.setDescription(
                `Role ${roleMention(role.id)} added to ${userMention(
                    member.id
                )} until ${timeFormat(newDate, TimestampStyles.RelativeTime)}`
            );
            interaction.reply({ embeds: [embed] });
        });
    },
});
