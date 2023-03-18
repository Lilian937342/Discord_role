import "colorts/lib/string";
import {
    Client,
    Collection,
    SlashCommandBuilder,
    REST,
    Routes,
} from "discord.js";
import { CommandType } from "../type/Commands";
import { readdirSync, lstatSync } from "fs";
import { get_commands } from "../utils/commands";
import { loadGlobally, automaticLoad } from "../config.json"
import {schedule } from "node-cron"

type loadCommandOption = {
    commands: Array<SlashCommandBuilder>;
    guildId?: string;
    global?: boolean;
};
export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();

    async start(token: string) {
        this.registerCommands();
        this.loadEvents();
        this.loadTasks();
        await this.login(token);
        return this
    }
    async loadTasks() {
        var tasks = readdirSync(`${process.cwd()}/src/tasks/`).map((file) => {
            if (
                file.endsWith(".ts") &&
                !lstatSync(`${process.cwd()}/src/tasks/${file}`).isDirectory()
            ) {
                import(`${process.cwd()}/src/tasks/${file}`)
                    .then((e) => e.default)
                    .then((task) => {
                        schedule("*/2 * * * * *", () => {
                            task.execute(this)
                        })
                    });
            }
        });
        console.log(
            `${`Successfully`.green.bold} loaded ${tasks.length} tasks`
        );
    }
    async loadEvents() {
        var events = readdirSync(`${process.cwd()}/src/events/`).map((file) => {
            if (
                file.endsWith(".ts") &&
                !lstatSync(`${process.cwd()}/src/events/${file}`).isDirectory()
            ) {
                import(`${process.cwd()}/src/events/${file}`)
                    .then((e) => e.default)
                    .then((event) => {
                        if (event.once) {
                            this.once(
                                event.event,
                                async (...args) => await event.execute(...args)
                            );
                        } else {
                            this.on(
                                event.event,
                                async (...args) => await event.execute(...args)
                            );
                        }
                    });
            }
        });
        console.log(
            `${`Successfully`.green.bold} loaded ${events.length} events`
        );
    }


    async loadCommands({ commands, guildId, global }: loadCommandOption) {
        const token = this.token;
        const rest = new REST({ version: "10" }).setToken(token);
        if (guildId) {
            try {
                rest.put(
                    Routes.applicationGuildCommands(this.user.id, guildId),
                    {
                        body: commands,
                    }
                );
                console.log(
                    `${`Successfully`.green.bold} Loaded  ${
                        commands.length
                    } Commands For: ${`${guildId}`.red}`
                );
            } catch (e) {
                console.log(
                    `${`Unable`.red.bold} To Load ${
                        commands.length
                    } Commands For: ${`${guildId}`.red}`
                );
            }
        } else if (global == false) {
            this.guilds.cache.forEach((guild) => {
                let guildId = guild.id;
                try {
                    rest.put(
                        Routes.applicationGuildCommands(this.user.id, guildId),
                        {
                            body: commands,
                        }
                    );
                    console.log(
                        `${`Successfully`.green.bold} Loaded  ${
                            commands.length
                        } Commands For: ${`${guild.name}`.red}`
                    );
                } catch (e) {
                    console.log(
                        `${`Unable`.red.bold} To Load ${
                            commands.length
                        } Commands For: ${`${guild.name}`.red}`
                    );
                }
            });
        } else if (global == true) {
            try {
                rest.put(Routes.applicationCommands(this.user.id), {
                    body: commands,
                });
                console.log(
                    `${`Successfully`.green.bold} Loaded  ${
                        commands.length
                    } Commands For: ${`ALL POSSIBLE GUILDS`.red}`
                );
            } catch (e) {
                console.log(
                    `${`Unable`.red.bold} To Load ${
                        commands.length
                    } Commands For: ${`ALL POSSIBLE GUILD`.red}`
                );
            }
        }
    }

    async registerCommands() {
        const allCommands = await get_commands(`${process.cwd()}/src/commands`);
        const commands = allCommands.commands;
        this.commands = allCommands.collection;

        this.on("ready", async () => {
            if (automaticLoad == true) {
                this.loadCommands({
                    commands: commands,
                    global: loadGlobally == true,
                });
            }
        });

        this.on("guildCreate", async (guild) => {
            if (automaticLoad &&loadGlobally == false) {
                this.loadCommands({
                    commands: commands,
                    guildId: guild.id,
                });
                console.log(
                    `${`Successfully`.green.bold} Loaded ${`(/)`.green} ${
                        commands.length
                    } Commands For: ${`${guild.name}`.red}`
                );
            }
        });
    }
}
