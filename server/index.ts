import express from "express";
import * as dotenv from "dotenv";
import { FormData, request } from "undici";
import axios from "axios";
import exphbs from 'express-handlebars'
import cookieParser from "cookie-parser"
import bodyParser from 'body-parser'

dotenv.config();

const port = process.env.PORT;

const app = express();

app.get("/", async ({ query }, response) => {
    const { code } = query;
    console.log(code)
    if (code) {
        try {

            var form_data = new FormData();
            var item = {
                client_id: process.env.clientId,
                client_secret: process.env.TOKEN,
                code,
                grant_type: "authorization_code",
                redirect_uri: `http://localhost:${port}`,
                scope: "identify",
            };

            for (var key in item) {
                form_data.append(key, item[key]);
            }
            console.log('TOK', process.env.clientId, process.env.TOKEN)
            const tokenResponseData = await axios.request({
                method: "POST",
                url: "https://discord.com/api/oauth2/token",
                data: new URLSearchParams({
                    client_id: process.env.clientId,
                    client_secret: process.env.clientSecret,
                    code: String(code),
                    grant_type: "authorization_code",
                    redirect_uri: `http://localhost:${port}`,
                    scope: "identify+guilds+email+applications.commands.permissions.update",
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            //const oauthData = await getJSONResponse(tokenResponseData.data);
            console.log(tokenResponseData.data);
            axios.request({
                url: "https://discord.com/api/users/@me/guilds",
                headers: {
                    authorization: `Bearer ${tokenResponseData.data.access_token}`,
                },
            }).then((r) => {
                console.log(r.data)
            }).catch(console.log);
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error
            // tokenResponseData.statusCode will be 401
            console.error(error);
        }
    }

    return response.sendFile("server/index.html", { root: "." });
});

app.get("/user/@me", async ({ headers }, response) => {
    console.log(headers)
    return
});

app.listen(port, () =>
    console.log(`App listening at http://localhost:${port}`)
);

