import express from 'express';
import { parcelDao } from '../../dao/parcelDao';
import { pool } from '../../database/database';

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

    parcelDao.findAll().then(parcels => {
        if (!parcels) {
            res.statusCode = 500;
            res.end()
        } else {
            res.statusCode = 200;
            res.json(parcels?.map(x => x.toData()));
        }
    })
});

router.get('/:id', (req, res) => {
    console.log(`Get parcel with Id ${req.params.id}`);

    parcelDao.find(Number.parseInt(req.params.id)).then(parcel => {
        if (!parcel) {
            res.statusCode = 404;
            res.end()
        } else {
            res.statusCode = 200;
            res.json(parcel);
        }
    })

});

/**
 * 
 * @returns 404 if parcel doesn't exist
 */
router.delete('/:id', (req, res) => {
    console.log(`Delete parcel with Id ${req.params.id}`);

    parcelDao.delete(Number.parseInt(req.params.id)).then(deleted => {
        if (!deleted) {
            res.statusCode = 404;
        } else {
            res.statusCode = 200;
        }
        res.end()
    })
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
router.put('/:id/nickname', (req, res) => {
    const nickname = req.query['nickname'];
    console.log(`Setting Parcel ${req.params.id} nickname to ${nickname}`);
    res.statusCode = 200;
    res.end();
})
