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

psql "postgresql://$USER:$PASSWORD@localhost/$DATABASE" -c "DROP TABLE IF EXISTS users";
psql "postgresql://$USER:$PASSWORD@localhost/$DATABASE" -c "DROP TABLE IF EXISTS parcel";
psql "postgresql://$USER:$PASSWORD@localhost/$DATABASE"  -c "DROP TABLE IF EXISTS queued";
psql "postgresql://$USER:$PASSWORD@localhost/$DATABASE"  -c "DROP TABLE IF EXISTS trackingEvent";

