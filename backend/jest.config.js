export default {
    rootDir: 'src',
    transform: {
        '^.+\\.(j|t)s$': 'ts-jest',
    },
    testRegex: '.+\/__tests__\/(?!(__data__|action))[\\w\\d]+\.(test|spec)\\.(t|j)s$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
    },
    setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],

    /* Test Configuration Information */
    collectCoverage: true,
    coverageDirectory: "../dist/coverage",
    coverageReporters: [
        "text",
        "html",
    ],
}
