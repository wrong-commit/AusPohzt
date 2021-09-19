# AusPohzt 

API for tracking parcels 

## TODO 

- [ ] Tracking 
    - [x] Add Tracking ID
    - [x] Remove Tracking ID 
    - [x] Set nickname for Tracking ID 
    - [ ] Update Database when status changes
        - [ ] Fix duplicate events not clearing properly
- [ ] User Management
    - [ ] Authentication
    - [ ] Add User
    - [ ] Remove User
- [ ] System
    - [ ] Setup daemon scripts
    - [ ] Setup multiple workers
    - [ ] Default nginx config for workers
- [ ] Misc
    - [ ] Convert semi-JavaDocs to JSDocs 
    - [ ] Setup Github Actions
- [ ] Refactor
    - [x] pirate to support passing results through map() and mapMany()
    - [ ] typing of entityDecorator.getEntityPrototype
    - [x] DRY dao code
    - [ ] pirate.map() accepts row arg as array instead of single instance, see dao.find() comment
- [ ] Documentation
    - [ ] Explain typescript setup: https://2ality.com/2021/07/simple-monorepos.html
    - [ ] Explain package.json setup
    - [ ] Explain snowpack setup ( easy )
