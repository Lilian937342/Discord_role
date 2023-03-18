import { TempRole } from "../models/TempRole";
import { Event } from "../structures/Events";
import db from "../dbInit";
import { scheduleJob } from "node-schedule";
import {
    EmbedBuilder,
    GuildTextBasedChannel,
    roleMention,
    userMention,
} from "discord.js";
import { GuildMemberRoleManager } from "discord.js";
import { getRandomColor } from "../utils/embed";
import { expireRole } from "../utils/temporaryRoles";
export default new Event(
    "ready",
    async (client) => {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const tempRoles = await db.manager.find(TempRole);
        for (var t of tempRoles) {
            let guild = client.guilds.cache.get(t.guildId) || null;
            if (guild) {
                let channel =
                    (guild.channels.cache.get(
                        t.channelId
                    ) as GuildTextBasedChannel) || null;

                let role = guild.roles.cache.get(t.roleId) || null;
                let member = null;
                try {
                    member = await guild.members.fetch(t.userId);
                } catch {}

                if (
                    !!channel &&
                    !!role &&
                    !!member &&
                    t.expire.getTime() < Date.now() 
                ) {
                    await expireRole(member, role, channel, t)
                }

                if (!!channel && !!role && !!member) {
                    if (member.roles.cache.has(role.id)) {
                        let job = scheduleJob(t.expire, async () => {
                            await expireRole(member, role, channel, t)
                        });
                    } else {
                        await db.manager.delete(TempRole, { ...t });
                    }
                } else {
                    await db.manager.delete(TempRole, { ...t });
                }
            } else {
                await db.manager.delete(TempRole, { ...t });
            }
        }
    },
    true
);
