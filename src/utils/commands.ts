import { Collection, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import {readdirSync, lstatSync, existsSync} from "fs"
import { parse } from "path";
import { CommandType } from "../type/Commands";

export const get_ts_files = (path: string): Array<string> => {
    var files = new Array();
    if (existsSync(path) && lstatSync(path).isDirectory()) {
        readdirSync(path).forEach((file) => {
            files = files.concat(get_ts_files(`${path}/${file}`));
        });
    } else if (lstatSync(path).isFile() && path.endsWith(".ts")) {
        return [path];
    }
    return files;
};


export const isDirectory = (path: string): boolean => {
    return existsSync(path) && lstatSync(path).isDirectory();
};

const delLastSlash = (path: string) => {
    if (path.endsWith("/")) {
        path = path.slice(0, path.length - 1);
    }
    return path;
};



export const get_commands = async (
    path: string
): Promise<{
    commands: Array<SlashCommandBuilder>;
    collection: Collection<string, CommandType>;
}> => {
    if (!isDirectory(path)) throw new TypeError("No such directory");
    path = delLastSlash(path);

    const commands = [];
    const collection = new Collection<string, CommandType>();

    const subdirs = readdirSync(path);

    for (var dir of subdirs) {
        if (isDirectory(`${path}/${dir}`)) {
            const commandName = parse(`${path}/${dir}`).name;
            const command = new SlashCommandBuilder()
                .setName(commandName)
                .setDescription("...");

            const subs = readdirSync(`${path}/${dir}`);
            for (var sub of subs) {
                if (isDirectory(`${path}/${dir}/${sub}`)) {
                    var files = get_ts_files(`${path}/${dir}/${sub}`);
                    const subgroup = new SlashCommandSubcommandGroupBuilder();
                    subgroup.setName(sub).setDescription("...");

                    for (var file of files) {
                        const sub_command = (await import(file)).default;
                        if (
                            sub_command.data instanceof
                            SlashCommandSubcommandBuilder
                        ) {
                            subgroup.addSubcommand(sub_command.data);
                            collection.set(
                                `${commandName}__${sub}__${sub_command.data.name}`,
                                sub_command
                            );
                        } else if (
                            sub_command.data instanceof SlashCommandBuilder
                        ) {
                            collection.set(sub_command.data.name, sub_command);
                            commands.push(sub_command.toJSON());
                        }
                    }
                    command.addSubcommandGroup(subgroup);
                } else if (sub.endsWith(".ts")) {
                    const sub_command = (await import(`${path}/${dir}/${sub}`))
                        .default;
                    if (
                        sub_command.data instanceof
                        SlashCommandSubcommandBuilder
                    ) {
                        command.addSubcommand(sub_command.data);
                        collection.set(
                            `${commandName}__${sub_command.data.name}`,
                            sub_command
                        );
                    } else if (
                        sub_command.data instanceof SlashCommandBuilder
                    ) {
                        commands.push(sub_command.data.toJSON());
                        collection.set(sub_command.data.name, sub_command);
                    }
                }
            }
            commands.push(command.toJSON());
        } else if (dir.endsWith(".ts")) {
            let command = (await import(`${process.cwd()}/src/commands/${dir}`))
                .default;
            if (command.data instanceof SlashCommandBuilder) {
                collection.set(command.data.name, command);
                commands.push(command.data.toJSON());
            }
        }
    }
    return { commands, collection };
};
