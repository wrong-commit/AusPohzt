import express from 'express';

const router = express.Router();
export default router;

/**
 * Return all of users parcels.
 * TODO: show active parcels by default, control with query param
 * TODO: add typescript support for return type
 * @returns all users parcels
 */
router.get('/', (_, res) => {
    console.log('Get current parcels');
    res.statusCode = 200;
    res.end();
});

/**
 * 
 * @returns 404 if parcel doesn't exist
 */
router.delete('/:id', (req, res) => {
    console.log(`Get parcel ${req.params.id}`);
    res.statusCode = 200;
    res.end();
});

/**
 * Add a parcel to the system.
 * Q: can a parcel be tracked by multiple users ? 
 * TODO: add typescript support for body
 * TODO: throw error if parcel already tracked by current user
 */
router.post('/add', (_, res) => {
    console.log('Add parcel');
    res.statusCode = 200;
    res.end();
});

/**
 * 
 * @returns 404 if parcel doesn't exist
 */
router.post('/:id/nickname', (req, res) => {
    const nickname = req.query['nickname'];
    console.log(`Setting Parcel ${req.params.id} nickname to ${nickname}`);
    res.statusCode = 200;
    res.end();
})
