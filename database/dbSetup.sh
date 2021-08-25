#!/bin/bash

# probably not needed if using docker
USER="bogan"
# probably not needed if using docker
PASSWORD="123"
DATABASE="auspohzt_test"

### spin up docker instance of postgres with 5432 port exposed as a different port
# TODO: parameterize this somehow 
# run createRole.sql to setup user `bogan` with password `123`
psql postgres -f "database/createRole.sql"> /dev/null 2>&1

psql "postgresql://$USER:$PASSWORD@localhost/postgres" -c "DROP DATABASE IF EXISTS ${DATABASE};" > /dev/null 2>&1
psql "postgresql://$USER:$PASSWORD@localhost/postgres" -c "CREATE DATABASE ${DATABASE};"> /dev/null 2>&1
# run createDatabase.sql to setup passwords
psql "postgresql://$USER:$PASSWORD@localhost/$DATABASE" -f "database/createDatabase.sql" > /dev/null 2>&1
