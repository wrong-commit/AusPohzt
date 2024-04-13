@echo off
:: probably not needed if using docker
set USER_="boganpost_usr"
:: the role 
set USER="boganpost"
:: probably not needed if using docker
set PASSWORD="123"
set DATABASE="auspohzt_test"

::: TODO: spin up docker instance of postgres with 5432 port exposed as a different port

:: Create role-user used by application
psql -c "CREATE USER %USER_% WITH PASSWORD '%PASSWORD%';" "postgresql://localhost/postgres" postgres 
:: Create role for assign privs
psql -c "CREATE ROLE %USER% WITH PASSWORD '%PASSWORD%';" "postgresql://localhost/postgres" postgres 
:: Allow role to setup Database
psql -c "ALTER ROLE %USER% WITH CREATEDB;" "postgresql://localhost/postgres" postgres
:: Let role login 
psql -c "ALTER ROLE %USER% WITH LOGIN;" "postgresql://localhost/postgres" postgres
:: Drop existing database
psql -c "DROP DATABASE IF EXISTS %DATABASE%;" "postgresql://localhost/postgres" postgres
:: Setup new database
psql -c "CREATE DATABASE %DATABASE%;" "postgresql://%USER%:%PASSWORD%@localhost/postgres"
:: Grant admin privileges
::psql -c "GRANT ALL privileges on DATABASE %DATABASE% to %USER%;" "postgresql://localhost/postgres" postgres 
::psql -c "GRANT ALL privileges on DATABASE %DATABASE% to %USER_%;" "postgresql://localhost/postgres" postgres 
:: Grant privileges for dao usage 

:: run createDatabase.sql to setup tables
psql -f "createDatabase.sql" "postgresql://%USER%:%PASSWORD%@localhost/%DATABASE%"
psql -f "database/createDatabase.sql" "postgresql://%USER%:%PASSWORD%@localhost/%DATABASE%"

psql -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %USER%;" "postgresql://localhost/postgres" postgres 
::psql -c "GRANT ALL on queued to %USER_%;" "postgresql://localhost/%DATABASE%" postgres 
::psql -c "GRANT ALL on parcel to %USER_%;" "postgresql://localhost/%DATABASE%" postgres 
::psql -c "GRANT ALL on trackingevent to %USER_%;" "postgresql://localhost/%DATABASE%" postgres 
psql -c "GRANT pg_read_all_data TO %USER_%;" "postgresql://localhost/%DATABASE%" postgres 
psql -c "GRANT pg_write_all_data TO %USER_%;" "postgresql://localhost/%DATABASE%" postgres 