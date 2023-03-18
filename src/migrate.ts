import { GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import "colorts/lib/string";
import { ExtendedClient } from "./structures/Client";
import "reflect-metadata";
import { connect } from "mongoose";
import Guild from "./schemas/guild";

dotenv.config();
const token = process.env.TOKEN;
// Create a new client instance
const client = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// When the client is ready, run this code (only once)

// Login to Discord with your client's token
connect(process.env.DB_URI)
    .then(async () => {
        console.log("Connected to database !");
        return client.start(token);
    })
    .then(async (c) => {
        const guilds = client.guilds.cache;
        var ng = 0;
        for (const g of guilds) {
            var f = await Guild.findOrCreate(g[1].id);
            console.log(f);
            ng++;
        }
        return ng;
    })
    .then((ng) => {
        console.log(`Database synced  for ${ng} server(s) !`);
    });
