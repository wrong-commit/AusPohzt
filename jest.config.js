module.exports = {
    rootDir: 'src',
    transform: {
        '^.+\\.(j|t)s$': 'ts-jest',
    },
    testRegex: '.+\/__tests__\/(?!(__data__|action))[\\w\\d]+\.(test|spec)\\.(t|j)s$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
    },
    setupFilesAfterEnv: ["<rootDir>/setupTests.t1s"],
}
