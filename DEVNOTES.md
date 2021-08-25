## Create a new route

1. Add a folder with an expressive name under /src/routes
2. Create a controller.ts file in this folder that default exports an Express.Router with relevant routes
3. Modify /src/routes/initRoutes.ts to use the exported router

Routes should probably be versioned under the applications major version number.
> How should controller versions be managed ? Is this boiling the ocean ? probably


## How integration tests work (when run through npm run-script it-test)

1. ./database/dbSetup.sh is run. This creates a database 'auspohzt_test' for user 'bogan' with password '123'
2. ./jest.it.config.js calls src/globalItSetup.ts, which initialize environment variables from ./test.env
3. ./jest.it.config.js calls src/setupIts.ts to TRUNCATE all tables between tests
4. That means each test is responsible for configuring its own test data, and means no cross-test data issues occur
5. ./jest.it.config.js calls src/globalItTeardown