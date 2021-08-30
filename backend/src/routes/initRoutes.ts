import express from 'express';

import auth from './auth/controller';
import parcel from './parcel/controller';

/**
 * Sets up following routes
 * - /v0/auth
 * - /v0/parcel
 * @param app Express Application to configure routes for 
 */
export default function setupRoutes(app: express.Express) {
    app.use('/v0/auth', auth);
    app.use('/v0/parcel', parcel);
}
