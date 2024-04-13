# AusPohzt 

API, Front End, and Notification Clients for tracking parcels 

## How to run 

1. Run `npm install` in the root directory
2. Setup postgresql database using `backend/database` scripts
3. Run `npm run build`
4. Configure `.env` file from `test.env`
5. Run `npm run back:server` in a new terminal to start the API
6. Run `npm run front:site` in a new terminal to server front end files
7. Run `npm run back:runner` periodically to sync tracking data from remote systems

## Screenshots

Parcel tracking UI showing delivery events for delivered package
![image](https://github.com/wrong-commit/AusPohzt/assets/44012200/afd41c29-eda0-49de-a7f2-bd8e83203440)

## TODO 
General todo list. Some far fetched things like multi-user support
- [ ] Tracking 
    - [x] Add Tracking ID
    - [x] Remove Tracking ID 
    - [x] Set nickname for Tracking ID 
    - [ ] Update Database when status changes
        - [x] Fix duplicate events not clearing properly
        - [x] Mark parcels as disabled after 3 runner errors
        - [x] Mark parcels as disabled when status is COMPLETE
        - [x] Runner does not check disabled parcels
        - [ ] Support marking package as delivered from UI
    - [ ] Handle dates correctly
        - [ ] Support 64 bit integers for dates, or
        - [ ] Migrate to postgres datetime date types
- [ ] User Management
    - [x] Authentication
    - [ ] Add User
    - [ ] Remove User
    - [ ] Authorization for runner, with signed tokens
- [ ] System
    - [ ] Setup daemon scripts
        - [ ] node systemctl script
        - [ ] node macos service script
        - [ ] cronjob example for notifications
    - [ ] Setup multiple workers
    - [ ] Default nginx config for workers
- [ ] Notifications
    - [x] Barebones notification script
    - [ ] custom icon for notification (in MacOS only ?)
    - [ ] last events written to DB linked by mac address. 
    - [x] don't send notifications for disabled parcels
    - [x] include package location in update message
- [ ] Misc
    - [ ] Convert semi-JavaDocs to JSDocs 
    - [ ] Setup Github Actions
- [ ] Refactor
    - [x] pirate to support passing results through map() and mapMany()
    - [ ] typing of entityDecorator.getEntityPrototype
    - [x] DRY dao code
    - [x] pirate.map() accepts row arg as array instead of single instance, see dao.find() comment
    - [ ] controller code should use async/await instead of promise callbacks
    - [ ] use proper go fmt methods for logging ( unnecessary \n everywhere )
    - [ ] parcel dao should be rewritten, needs to support most parcel methods returning a list
- [ ] Documentation
    - [ ] Explain typescript setup: https://2ality.com/2021/07/simple-monorepos.html (no longer correct, using amalgamatioin of various configs)
    - [ ] Explain package.json setup
    - [ ] Explain snowpack setup ( easy )
