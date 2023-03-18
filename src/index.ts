// Require the necessary discord.js classes
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import * as dotenv from "dotenv"
import "colorts/lib/string";
import { ExtendedClient } from './structures/Client';
import "reflect-metadata";
import {connect} from "mongoose"
import Guild from './schemas/guild';

dotenv.config();
const token = process.env.TOKEN;
// Create a new client instance
const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once)

// Login to Discord with your client's token
connect(process.env.DB_URI).then(async () => {
    client.start(token);
   
})