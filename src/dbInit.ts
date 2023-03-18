import "reflect-metadata";
import { DataSource } from "typeorm";
import { TempRole } from "./models/TempRole";
import * as dotenv from "dotenv";
import { RoleReact } from "./models/RoleReact";
dotenv.config();

const db = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    synchronize: true,
    entities: [TempRole, RoleReact],
});

db.initialize()
    .then(() => {
        console.log("Database initialized !");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

export default db