-- Create users table 
CREATE TABLE users ( 
    ID SERIAL PRIMARY KEY,
    name VARCHAR(255)
    -- TODO: add salted password hash
);

-- Create parcel table
CREATE TABLE parcel ( 
    -- TODO: understand postgres column definitions
    ID SERIAL PRIMARY KEY,
    -- random trackingId size
    trackingId VARCHAR(255),
    -- id of user that owns this parcel
    owner INTEGER,
    -- optional nickname assigned to parcel
    nickname VARCHAR(255) NULL, 
    -- TODO: use proper datatype here ? 
    lastSync INT
);

CREATE TABLE queued ( 
    -- TODO: understand postgres column definitions
    ID SERIAL PRIMARY KEY,
    -- random trackingId size
    trackingId VARCHAR(255) UNIQUE,
    -- id of user that owns this parcel
    owner INTEGER
);

CREATE TABLE trackingEvent ( 
    -- TODO: understand postgres column definitions
    ID SERIAL PRIMARY KEY,
    -- TODO: will this work ? 
    parcelId SERIAL,
    -- TODO: will this work ? 
    externalId VARCHAR(255) NULL,
    -- TODO: use proper datatype here ? 
    dateTime INT,
    -- location info attached to event. empty equivalent of NULL
    location VARCHAR(255),
    -- event message info
    message VARCHAR(255),
    -- see trackingEventStatus type. setup enum mapping ? 
    type VARCHAR(100), 
    -- TODO: change to JSON, figure out null support. https://stackoverflow.com/a/45973415
    raw TEXT NULL
);