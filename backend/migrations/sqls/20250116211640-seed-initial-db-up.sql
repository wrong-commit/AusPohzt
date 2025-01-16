-- Seed DB
DO $$ 
DECLARE
    dummyParcelId TEXT := 'B8Z510000222';
    findParcelId INT;
BEGIN
    -- Insert parcel
    INSERT INTO parcel (trackingId, owner, nickname, lastSync) 
    VALUES (dummyParcelId, 1, null, 0) 
    RETURNING id INTO findParcelId;
    -- Insert tracking history 
    INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw)
        VALUES (
		  		findParcelId, 
		  		2, 
				'DANDENONG VIC', 
				'Label created by sender', 
				'in transit', '');
    INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw)
        VALUES (
		  		findParcelId, 
		  		3, 
				'DANDENONG VIC', 
				'We have it', 
				'in transit', '');
    INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw)
        VALUES (
		  		findParcelId, 
		  		4, 
				'MULGRAVE VIC', 
				'On it''s way', 
				'in transit', '');
    INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw)
        VALUES (
		  		findParcelId, 
		  		5, 
				'BOTANY NSW', 
				'Onboard for delivery', 
				'in transit', '');
    INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw)
        VALUES (
		  		findParcelId, 
		  		6, 
				'ASHFIELD NSW', 
				'Delivered', 
				'delivered', '');
END $$;