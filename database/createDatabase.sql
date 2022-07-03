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
    lastSync BIGINT
);
