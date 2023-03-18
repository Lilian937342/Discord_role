import { EmbedBuilder, GuildMember, Interaction, PermissionsBitField } from "discord.js";
import { ExtendedClient } from "../structures/Client";
import { Event } from "../structures/Events";

const missingPermissionEmbed = (name: string, permissions: Array<string>) => {
    return new EmbedBuilder()
        .setColor("#ff0000")
        .setDescription(
            `You don't have the required permissions for command **/${name}**`
        )
        .addFields({
            name: `Missing permission${permissions.length > 1 ? "s" : ""}`,
            value: "-" + permissions.join("\n-").replace(/([A-Z])/g, " $1"),
        });
};

export default new Event(
    "interactionCreate",
    async (interaction: Interaction) => {
        // Chat Input Commands
        if (interaction.isChatInputCommand()) {
            const client = interaction.client as ExtendedClient;
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);
            let name = interaction.commandName;

            if (group !== null) {
                name = `${name}__${group}`;
            }
            if (sub !== null) {
                name = `${name}__${sub}`;
            }
            const command = client.commands.get(name);
            if (!command) return;
            if ((command.isDm === false || command.isDm === null) && interaction.channel.isDMBased) return;

            if (command.permissions && !interaction.channel.isDMBased()) {
                let member = interaction.member as GuildMember;
                let permissions = member
                    .permissions as PermissionsBitField;
                if (!permissions.has(command.permissions) && !member.permissionsIn(interaction.channel).has(command.permissions)) {
                    const missing_permission = permissions.missing(
                        command.permissions
                    );
                    interaction.reply({
                        embeds: [
                            missingPermissionEmbed(name.replaceAll("__", " "), missing_permission),
                        ],
                        ephemeral: true,
                    });
                    return;
                }
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }
    },
    false
);
