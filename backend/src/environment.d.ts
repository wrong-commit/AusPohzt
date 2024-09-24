
declare global {
    namespace NodeJS {
        // TODO: add method to ensure environment variables are set, or set default if required.
        interface ProcessEnv {
            /**
             * Enable or disable authentication.
             */
            ENABLE_AUTH: 'true' | 'false';
            /**
             * penlicence
             */
            AUTH_COOKIE_NAME: string;
            /**
             * JWT Secret
             */
            HMAC_SECRET: string;
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
            /**
             * Runner execution interval. Defaults to `60000`, or 1 minute
             */
            RUNNER_INTERVAL_MS?: number;
            /**
             * Parcel sync interval. Defaults to `600000`, or 10 minutes.
             * 
             * This may be dependant on the number of parcels in the system, don't want to get banned from API
             */
            SYNC_INTERVAL_MS?: number;
        }
    }
}
declare module 'pg';
export { }