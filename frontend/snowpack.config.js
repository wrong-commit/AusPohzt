/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
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
        // [
        [
            'snowpack-plugin-esbuild',
            {
                input: ['.js', '.mjs', '.jsx', '.ts', '.tsx'],
                // https://esbuild.github.io/api/#simple-options
                options: {
                    loader: 'tsx'
                    // target: ['es6']
                }
            }
        ]
        // ]
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