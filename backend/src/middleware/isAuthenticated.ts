import * as express from "express";

export { isAuthenticated };

/**
 * Request handler responsible for validating if a user has provided a valid JWT.
 * @param req Reques
 * @param res 
 * @param next 
 * @returns 
 * @see `./attachToken.ts`
 */
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // TODO: is return necessary ? 
    if (!req.claims) {
        console.log('Request is not authenticated ')
        // TODO: do something if not authenticated
        return res.status(401).end();
    }
    return next();
};
