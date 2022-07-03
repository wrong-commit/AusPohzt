module.exports = {
    rootDir: 'src',
    transform: {
        '^.+\\.(j|t)s$': 'ts-jest',
    },
    testRegex: '.+\/__tests__\/(?!(__data__|action))[\\w\\d]+\.it\.test\.(t|j)s$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
    },
    globalSetup: '<rootDir>/globalItSetup.ts',
    // run before each test suite. wipe all tables then reinsert new data
    setupFiles: [
        "<rootDir>/setupIts.ts",
        '<rootDir>/setupTests.ts',
    ],

    /* Test Configuration Information */
    collectCoverage: true,
    coverageDirectory: "dist/coverage",
    coverageReporters: [
        "text",
        "html",
    ],
}
