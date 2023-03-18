import { CommandType } from "../type/Commands";

export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}
