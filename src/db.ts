import "reflect-metadata";
import { DataSource } from "typeorm";
import { TempRole } from "./models/TempRole";
import * as dotenv from "dotenv";
dotenv.config();

const db = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    synchronize: true,
    entities: [TempRole],
});

//export default db