import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
import { buildExpress } from './buildExpress';
import jwt from 'jsonwebtoken';
import { pool } from "./database/database";

// Generate a valid JWT for accessing the site
const token = jwt.sign('admin', process.env.HMAC_SECRET);
console.log('Admin token', token)

// Attach middleware, assign routes
const app = buildExpress();

// DEBUG: populate database with dummy results
const debug_load_data = async () => { 
    if( (await pool.query(`SELECT COUNT(*) FROM parcel`)).rows[0][0] == 0){
        console.log('DEBUG: Database already seeded')
        return;
    }

    const dummyParcelId = 'B8Z510000222'
    let findParcelId = (await pool.query(
        `INSERT INTO parcel (trackingId, owner, nickname, lastSync) ` +
        `VALUES ('${dummyParcelId}', 1, null, 0) RETURNING id;`
    )).rows[0]['id'];

    const sqlInsertTrackingEvent =  
       `INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw) ` +
        `VALUES ($1, $2, $3, $4, $5, '') RETURNING id`;

    (await pool.query(
        sqlInsertTrackingEvent, [
            findParcelId, 
            2, 
            'DANDENONG VIC', 
            'Label created by sender', 
            'in transit']
        )).rows[0]['id'];
         
    (await pool.query(
        sqlInsertTrackingEvent, [
         findParcelId, 
         3, 
         'DANDENONG VIC', 
         'We have it', 
         'in transit']
     )).rows[0]['id'];
     
    (await pool.query(
        sqlInsertTrackingEvent, [
         findParcelId, 
         3, 
         'MULGRAVE VIC', 
         "On it's way", 
         'in transit']
     )).rows[0]['id'];
     
    (await pool.query(
        sqlInsertTrackingEvent, [
         findParcelId, 
         4, 
         'BOTANY NSW', 
         "Onboard for delivery", 
         'in transit']
     )).rows[0]['id'];
    
     (await pool.query(
        sqlInsertTrackingEvent, [
         findParcelId, 
         5, 
         'ASHFIELD NSW', 
         "Delivered", 
         'delivered']
     )).rows[0]['id'];
}
debug_load_data();

// Start the server on configured port
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.info(`Listening on port ${process.env.PORT}`)
});
