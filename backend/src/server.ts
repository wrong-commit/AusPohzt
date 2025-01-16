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

// Start the server on configured port
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.info(`Listening on port ${process.env.PORT}`)
});
