/** @type {import("snowpack").SnowpackUserConfig } */
export default {
    // allows snowpack to resolve backend imports
    workspaceRoot: "../",
    mount: {
        public: {
            url: '/',
            static: true,
        },
        src: {
            url: '/dist',
            resolve: true,
        },
    },
    plugins: [
        '@snowpack/plugin-react-refresh',
        '@snowpack/plugin-dotenv',
        [
            '@snowpack/plugin-typescript',
            {

            },
        ],
    ],
    alias: {},
    routes: [
        /* Enable an SPA Fallback in development: */
        // {"match": "routes", "src": ".*", "dest": "/index.html"},
    ],
    optimize: {
        /* Example: Bundle your final build: */
        // "bundle": true,
    },
    packageOptions: {
        /* ... */
    },
    devOptions: {
        /* ... */
    },
    buildOptions: {
        /* ... */
    },
};