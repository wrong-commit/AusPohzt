import * as express from "express";
import jwt from 'jsonwebtoken';

export { attachToken }

/**
 * Attach a JWT Bearer Auth token to the Express Request through the `claims` property
 * @param req 
 * @param res 
 * @param next 
 */
const attachToken = (req: express.Request, _: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer: ')[1];
    if (authHeader && token && token.length > 0) {
        const claims = jwt.verify(token, process.env.HMAC_SECRET)
        req.claims = claims;
    }
    next();
};
