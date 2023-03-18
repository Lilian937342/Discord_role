import {
    EmbedBuilder,
    Guild as DiscordGuild,
} from "discord.js";
import Guild from "../schemas/guild"
import { Event } from "../structures/Events";

export default new Event(
    "guildCreate",
    async (guild: DiscordGuild) => {
        const dbGuild = await Guild.findOrCreate(guild.id)
    },
    false
);
