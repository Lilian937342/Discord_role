import { EmbedBuilder, GuildMember, GuildMemberResolvable, GuildTextBasedChannel, GuildTextChannelResolvable, Role, roleMention, RoleResolvable, userMention } from "discord.js";
import db from "../dbInit";
import { TempRole } from "../models/TempRole";
import { getRandomColor } from "./embed";

export const expireRole = async (member: GuildMember, role: Role, channel: GuildTextBasedChannel, tempRole: TempRole) => {
    if (!member.roles.cache.has(role.id)) return;
    await member.roles
        .remove(role, 'Temporary role expired')
        .then((r) => {
            db.manager.delete(TempRole, { ...tempRole });
            return r;
        })
        .then((r) => {
            const embed = new EmbedBuilder()
                .setTitle("Temporary role")
                .setColor(getRandomColor())
                .setDescription(
                    `Role ${roleMention(role.id)} has expired for ${userMention(
                        r.id
                    )}`
                );
            channel.send({
                embeds: [embed],
            });
        })
        .catch(() => {
            db.manager.delete(TempRole, { ...tempRole });
        });
}