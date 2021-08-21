
// TODO: control this with the NODE_ENV envvar
global.console = {
    ...global.console,
    ...{
        log: jest.fn(), // console.log are ignored in tests
        // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`
        error: console.error,
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        time: jest.fn(),
        timeEnd: jest.fn(),
        timeLog: jest.fn(),
        timeStamp: jest.fn(),
        trace: jest.fn(),
    }
};