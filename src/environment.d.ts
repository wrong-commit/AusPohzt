
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            /**
             * TODO: param should control logging profile
             * TODO: param should control other stuff ?
             * TODO: add testing env
             */
            NODE_ENV: 'development' | 'production';
            /**
             * Port number for API to listen on.
             */
            PORT: number;
            /**
             * auspozt secretz
             */
            API_KEY: string;
            /**
             * AusPost API in format `protocol://hostname:port/`.
             */
            DIGITAL_API: string;
            /**
             * Postgres Username
             */
            PG_USER: string;
            /**
             * Postgres Password
             */
            PG_PASSWORD: string;
            /**
             * Postgres Database
             */
            PG_DATABASE: string;

            /**
             * Postgres Hostname. Defaults to `localhost`
             */
            PG_HOST?: string;
            /**
             * Postgres Port. Defaults to `5432`
             */
            PG_PORT?: number;
        }
    }
}

export { }