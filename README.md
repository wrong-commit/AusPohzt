# AusPohzt 

API, Front End, and Notification Clients for tracking parcels 

## TODO 

- [ ] Tracking 
    - [x] Add Tracking ID
    - [x] Remove Tracking ID 
    - [x] Set nickname for Tracking ID 
    - [ ] Update Database when status changes
        - [x] Fix duplicate events not clearing properly
        - [ ] Mark parcels as disabled after 3 runner errors
        - [ ] Mark parcels as disabled when status is COMPLETE
        - [ ] Runner does not check disabled parcels
    - [ ] Handle dates correctly
        - [ ] Support 64 bit integers for dates, or
        - [ ] Migrate to postgres datetime date types
- [ ] User Management
    - [ ] Authentication
    - [ ] Add User
    - [ ] Remove User
    - [ ] Authorization for runner, probably with signed tokens
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
    - [ ] don't send notifications for disabled parcels
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
- [ ] Documentation
    - [ ] Explain typescript setup: https://2ality.com/2021/07/simple-monorepos.html (no longer correct, using amalgamatioin of various configs)
    - [ ] Explain package.json setup
    - [ ] Explain snowpack setup ( easy )
