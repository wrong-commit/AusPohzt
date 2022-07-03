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
const isAuthenticated = (req: express.Request, _: express.Response, next: express.NextFunction) => {
    // TODO: is return necessary ? 
    if (!req.claims) {
        // TODO: do something if not authenticated
        return next();
    }
    // TODO: do something 
    return next();
};
