#!/bin/bash

# probably not needed if using docker
USER="bogan"
# probably not needed if using docker
PASSWORD="123"
DATABASE="auspohzt_test"

if [ $# -gt 0 ] 
then
    USER=$1
fi
if [ $# -gt 1 ] 
then
    PASSWORD=$2
fi
if [ $# -gt 2 ] 
then
    DATABASE=$3
fi

### TODO: spin up docker instance of postgres with 5432 port exposed as a different port

# Create role-user used by application
psql "postgresql://localhost/postgres" -c "CREATE ROLE ${USER} WITH PASSWORD '${PASSWORD}';"
# Allow role to setup Database
psql "postgresql://localhost/postgres" -c "ALTER ROLE ${USER} WITH CREATEDB;"
# Let role login 
psql "postgresql://localhost/postgres" -c "ALTER ROLE ${USER} WITH LOGIN;"
# Drop existing database
psql "postgresql://localhost/postgres" -c "DROP DATABASE IF EXISTS ${DATABASE};" 
# Setup new database
psql "postgresql://$USER:$PASSWORD@localhost/postgres" -c "CREATE DATABASE ${DATABASE};"
# run createDatabase.sql to setup tables
psql "postgresql://$USER:$PASSWORD@localhost/$DATABASE" -f "database/createDatabase.sql"
