import { ExtendedClient } from "../structures/Client";

export function getUserFromMention(mention: string, client: ExtendedClient) {
    if (!mention) return;

    if (mention.startsWith("<@") && mention.endsWith(">")) {
        mention = mention.slice(2, -1);

        if (mention.startsWith("!")) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

export function getMentionFromId(id: string) {
    return `<@${id}>`
}

export function roleMention(id: string) {
    return `<@&${id}>`
}