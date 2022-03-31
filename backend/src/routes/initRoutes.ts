import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated';

import auth from './auth/controller';
import parcel from './parcel/controller';
import queue from './queue/controller';

/**
 * Sets up following routes
 * - /v0/auth
 * - /v0/parcel
 * @param app Express Application to configure routes for 
 */
export default function setupRoutes(app: express.Express) {
    app.use('/v0/auth', auth);
    app.use('/v0/parcel', isAuthenticated, parcel);
    app.use('/v0/queue', isAuthenticated, queue);
}
