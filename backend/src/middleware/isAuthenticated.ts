import * as express from "express";

export { isAuthenticatedMiddle, isAuthenticated };

/**
 * Request handler responsible for validating if a user has provided a valid JWT. Set response status to 401 if not 
 * authenticated.
 * @param req Reques
 * @param res 
 * @param next 
 * @returns 
 * @see `./attachToken.ts`
 */
function isAuthenticatedMiddle(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (isAuthenticated(req, process.env.ENABLE_AUTH)) {
        console.log('Request is not authenticated ')
        return res.status(401).end();
    }
    return next();
};


function isAuthenticated(req: express.Request, enableAuth: 'true' | 'false') {
    return !(enableAuth === 'true' && !req.claims)
}