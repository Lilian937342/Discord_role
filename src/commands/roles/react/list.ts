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
        .setName("list")
        .setDescription("Send the role reaction message")
        .addNumberOption((opt) =>
            opt
                .setName("id")
                .setDescription("Id of the message reaction")
                .setRequired(false)
        ),
    permissions: [PermissionsBitField.Flags.ManageRoles],
    execute: async (interaction: ChatInputCommandInteraction) => {
        const id = interaction.options.getNumber("id");
        const embed = new EmbedBuilder()
            .setTitle("Role reaction")
            .setDescription("React to get a role")
            .setColor(getRandomColor());
        const guild = await Guild.findOrCreate(interaction.guild.id);
        if (id > (guild.roleReacts.length - 1)) {
            interaction.reply('eh non')
            return
        }
        const reactMsg = guild.roleReacts.sort((a, b)=> a.createdAt.getTime() - b.createdAt.getTime())        
        
        if (id == null) {
            interaction.reply(reactMsg.map((m, i)=>{return `${i + 1} - ${m.name}`}).join('\n '))
        } if (id != null) {
            interaction.reply(`${reactMsg[id]}`)
        }

    },
});
