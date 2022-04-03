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
    let token = undefined;
    token = authHeader?.split('Bearer: ')[1];
    if (!token && req.cookies) {
        token = req.cookies[process.env.AUTH_COOKIE_NAME]
    }
    if (token && token.length > 0) {
        try {
            const claims = jwt.verify(token, process.env.HMAC_SECRET)
            req.claims = claims;
        } catch (e) {
            console.debug('Could not attach claims from token ', token)
            // console.log(e);
        }
    }
    next();
};
