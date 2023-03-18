import * as dotenv from "dotenv";
import "colorts/lib/string";

import { REST, Routes } from "discord.js";
import { get_commands } from "./utils/commands";
dotenv.config();
const token = process.env.TOKEN;
const clientId = process.env.clientId;
const guildId = process.env.guildId;

const rest = new REST({ version: "10" }).setToken(token);

if (clientId && guildId) {
    try {
        const allCommands = get_commands(`${process.cwd()}/src/commands`).then(
            (r) => {
                const commands = r.commands;
                rest.put(Routes.applicationGuildCommands(clientId, guildId), {
                    body: commands,
                })
                console.log(
                    `${`Successfully`.green.bold} loaded ${
                        commands.length
                    } Commands For: ${guildId}`
                );
            }
        );
    } catch (e) {
        console.log(
            `${`Unable`.red.bold} To Load commands For: ${
                `ALL POSSIBLE GUILD`.red
            }`
        );
    }
} else {
    console.log("Please set a clientId and a guildId".red.bold);
}
