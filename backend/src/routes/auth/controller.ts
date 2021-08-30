import express from 'express';

const router = express.Router();
export default router;

router.post('/login', (_, res) => {
    console.log('Login User');
    res.statusCode = 401;
    res.end();
})

router.post('/logout', (_, res) => {
    console.log('Logout User');
    res.statusCode = 200;
    res.end();
})
