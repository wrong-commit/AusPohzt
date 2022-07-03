import express from 'express';
import jwt from 'jsonwebtoken';
import { isAuthenticated, isAuthenticatedMiddle } from '../../middleware/isAuthenticated';

const router = express.Router();
export default router;

/**
 * POST logout
 */
router.post('/logout', (req, res, next) => isAuthenticatedMiddle(req, res, next), (req, res) => {
    console.log('Logout User {}', JSON.stringify(req.claims!));
    res.status(200).send();
});

/**
 * GET endpoint to check if authenticated
 */
router.get('/',).get('/', (req, res) => {
    res.status(200).send(isAuthenticated(req, process.env.ENABLE_AUTH));
})

/**
 * POST login
 */
router.post('/login', (req, res) => {
    console.log('Login User');
    const { username, password } = req.query;
    if (username && password) {
        // TODO: authenticate against DB
        // TODO: populate JWT with some basic claims, userId to start with
        if (username === 'admin' && password === 'nimda') {
            const token = jwt.sign('empty', process.env.HMAC_SECRET);
            // res.cookie(process.env.AUTH_COOKIE_NAME, token);
            return res.setHeader('Set-Cookie', `${process.env.AUTH_COOKIE_NAME}=${token}`)
                .status(200)
                .send({ token: token });
        }
    }
    return res.status(401).end()
})