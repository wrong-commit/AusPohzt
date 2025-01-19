import express from 'express';
import { pool } from '../../database/database'

const router = express.Router();
export default router;

/**
 * Checks DB connection and returns 200 or 500 HTTP response
 */
router.get('/', async (_, res) => {
    let valid = true;
    try{
        await pool.query('SELECT 1');
        // ... Add other application health checks here
        valid = true;
    }catch(e) { 
        console.error(`Health check DB connection failed`);
        valid = false;
    }
    if (valid) {
        return res.status(200).json({ status: "OK" })
    } else {
        return res.status(500).json({ message: 'Could not connect to database' });
    }
});
