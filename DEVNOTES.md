## Create a new route

1. Add a folder with an expressive name under /src/routes
2. Create a controller.ts file in this folder that default exports an Express.Router with relevant routes
3. Modify /src/routes/initRoutes.ts to use the exported router

Routes should probably be versioned under the applications major version number.
> How should controller versions be managed ? Is this boiling the ocean ? probably

