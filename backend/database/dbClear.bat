@echo off
:: probably not needed if using docker
set USER="boganpost"
:: probably not needed if using docker
set PASSWORD="123"
set DATABASE="auspohzt_test"

psql -c "DROP TABLE IF EXISTS users" "postgresql://%USER%:%PASSWORD%@localhost/%DATABASE%" postgres
psql -c "DROP TABLE IF EXISTS parcel" "postgresql://%USER%:%PASSWORD%@localhost/%DATABASE%" postgres
psql -c "DROP TABLE IF EXISTS queued" "postgresql://%USER%:%PASSWORD%@localhost/%DATABASE%" postgres
psql -c "DROP TABLE IF EXISTS trackingEvent" "postgresql://%USER%:%PASSWORD%@localhost/%DATABASE%" postgres

