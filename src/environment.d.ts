declare global {
    namespace NodeJS {
        interface ProcessEnv {
          clientId?: string,
          clientSecret?: string,
          guildId?: string,
          TOKEN: string,
          DB_USERNAME: string,
          DB_PASSWORD: string,
          DB_HOST: string,
          DB_PORT: string,
          DB_NAME: string,
          PORT: string,
          DB_URI: string
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
