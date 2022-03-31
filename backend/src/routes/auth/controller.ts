import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
export default router;

router.post('/login', (req, res) => {
    console.log('Login User');
    const { username, password } = req.query;
    if (username && password) {
        // TODO: authenticate against DB
        // TODO: populate JWT with some basic claims, userId to start with
        if (username === 'admin' && password === 'nimda') {
            const token = jwt.sign('empty', process.env.HMAC_SECRET);
            // res.cookie(process.env.AUTH_COOKIE_NAME, token);
            res.setHeader('Set-Cookie', `${process.env.AUTH_COOKIE_NAME}=${token}`)
            res.status(200)
        }
    }

    res.send();
})

router.post('/logout', (_, res) => {
    console.log('Logout User');
    res.status(200).send();
})
