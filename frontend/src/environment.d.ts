
declare global {
    namespace NodeJS {
        // TODO: add method to ensure environment variables are set, or set default if required.
        interface ProcessEnv {
            /**
             * Enable or disable authentication.
             */
            ENABLE_AUTH: 'true' | 'false';
            API_URL: string;
        }
    }
}
export { }