import express from 'express';
import { daoFactory } from '../../dao/daoFactory';
import { parcel } from '../../entities/parcel';
import { queued } from '../../entities/queued';

const router = express.Router();
export default router;
const queuedDao = daoFactory(queued);
const parcelDao = daoFactory(parcel);

// TODO: setup controller auth so runner can access these endpoints

/**
 * Return all queues
 * TODO: if requesting user is runner, return all queued parcels. otherwise return users queued parcels only
 * TODO: add typescript support for return type
 * @returns all queued parcels
 */
router.get('/', async (_, res) => {
    console.trace(`Getting all queued parcels`);
    const queued = await queuedDao.findAll();

    if (!queued) {
        return res.status(500).json({ message: 'Could not find queued parcels' });
    } else {
        return res.status(200).json(queued?.map(x => x.toData()))
    }
});

/**
 * Return all queues for a user
 * TODO: add typescript support for return type
 * @returns all queued parcels
 */
router.get('/:owner', async (req, res) => {
    console.trace(`Getting all queued parcels for user ${req.params.owner}`);

    const queued = await queuedDao.findByOwner(Number.parseInt(req.params.owner));
    if (!queued) {
        return res.status(500).json({ message: `Could not lookup queued parcels` });
    }
    return res.status(200).json(queued?.map(x => x.toData()))
});


/**
 * Add a new parcel to the queue
 *  * TODO: throw error if parcel already queued
 *  * TODO: throw error if parcel already exists
 * TODO: set queued.owner from request
 * @returns queued object if successful, otherwise 500
 */
router.post('/:trackingId', async (req, res) => {
    console.trace(`Queueing parcel with trackingId ${req.params.trackingId}`);

    if (req.params.trackingId.trim().length === 0) {
        console.warn(`Tried to queue invalid tracking id ${req.params.trackingId}`)
        return res.status(500).json({ message: 'Tracking Id invalid' });
    }
    // check if parcel already exists
    // const alreadyQueued = await queuedDao.findByTrackingId(req.params.trackingId);
    const alreadyTracked = await parcelDao.findByTrackingId(req.params.trackingId);
    if (alreadyTracked) {
        console.warn(`Tried to queue existing parcel ${req.params.trackingId}`)
        return res.status(500).json({ message: 'Parcel already tracked' });
    }

    const newQueued = new queued({
        trackingId: req.params.trackingId,
        owner: 0, // FIXME: lol
        checked: 0,
    });

    let savedQueued = undefined
    try {
        savedQueued = await queuedDao.save(newQueued)
    } catch (err) {
        console.error('Could not queue parcel', err);
    }
    if (!savedQueued) {
        console.error(`could not save queued ${req.params.trackingId}`);
        return res.status(500).send({ message: 'Could not queue Parcel' });
    }

    return res.status(200).json(savedQueued.toData());
})

/**
 * Delete a queued parcel.
 * 
 * TODO: restrict to runner
 * @returns 200 if queued parcel deleted
 */
router.delete('/:trackingId', async (req, res) => {
    console.trace(`Removing queued parcel id ${req.params.trackingId}`);
    try {
        const toDelete = await queuedDao.findByTrackingId(req.params.trackingId);
        if (!toDelete) {
            throw new Error('dao.findByTrackingId failed')
        }
        const success = await queuedDao.delete(toDelete.id);
        if (!success) {
            return res.status(500).send({ message: `Could not delete queued parcel ${toDelete.id}` });
        }
    } catch (err) {
        return res.status(404).send(JSON.stringify(err));
    }
    return res.status(200).end();
})