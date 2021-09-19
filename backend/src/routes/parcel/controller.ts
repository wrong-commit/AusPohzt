import express from 'express';
import { daoFactory } from '../../dao/daoFactory';
import { parcel } from '../../entities/parcel';
import { Dto } from '../../types/Dto';
import { isObjectEmpty } from '../../util/isObjectEmpty';

const router = express.Router();
export default router;
const parcelDao = daoFactory(parcel);

/**
 * Return all of users parcels.
 * TODO: show active parcels by default, control with query param
 * TODO: add typescript support for return type
 * @returns all users parcels
 */
router.get('/', (_, res) => {
    console.trace(`Getting all parcels`);

    parcelDao.findAll().then(parcels => {
        if (!parcels) {
            throw new Error('dao.findAll failed');
        } else {
            res.status(200).json(parcels?.map(x => x.toData()))
        }
    }).catch(err => {
        res.status(500).write(JSON.stringify(err));
    })
});

router.get('/:id', (req, res) => {
    console.trace(`Getting parcel ${req.params.id}`);

    parcelDao.find(Number.parseInt(req.params.id)).then(parcel => {
        if (!parcel) {
            res.status(404).end()
        } else {
            res.status(200).json(parcel);
        }
    })
});

/**
 * 
 * @returns 404 if parcel doesn't exist
 */
router.delete('/:id', (req, res) => {
    console.trace(`Deleting parcel ${req.params.id}`);

    parcelDao.delete(Number.parseInt(req.params.id)).then(deleted => {
        if (!deleted) {
            res.status(404).end()
        } else {
            console.log(`Deleted parcel ${req.params.id}`);
            res.status(200).end();
        }
        res.end()
    })
});

/**
 * Add a parcel to the system.
 * Q: can a parcel be tracked by multiple users ? 
 * TODO: add typescript support for body
 * TODO: throw error if parcel already tracked by current user
 * TODO: add permission check, only runner should post to this endpoint. add 404 on failure
 */
router.post('/', async (req, res) => {
    console.trace(`Adding new parcel ${JSON.stringify(req.body)}`);
    try {
        if (isObjectEmpty(req.body)) {
            throw new Error('Request body empty');
        }
        // check if parcel with same tracking Id already exists 
        const dto = req.body as Dto<parcel>;
        const existingParcel = await parcelDao.findByTrackingId(dto.trackingId);
        if (existingParcel) {
            console.warn(`parcel ${existingParcel.id} already created for trackingId ${dto.trackingId}`);
            res.status(500).send(JSON.stringify({ message: 'Parcel already exists' }));
            // res.end();
        } else {
            // always id to undefined to avoid overwriting existing parcel
            dto.id = undefined;
            // set owner to 0 until auth is added
            dto.owner = -1;
            // set last sync to -1 to indicate sync required
            dto.lastSync = -1;
            // yuck ! 
            const savedParcel = await parcelDao.save(new parcel(dto));
            console.log('could not save parcel')
            if (!savedParcel) {
                res.status(500).send(JSON.stringify({ msg: 'Could not create Parcel' }));
            } else {
                res.status(200).json(savedParcel.toData());
            }
        }
    } catch (e) {
        console.error(e);
        res.status(500).end();
    }
});

/**
 * 
 * @returns 404 if parcel doesn't exist
 */
router.put('/:id/nickname', async (req, res) => {
    const nickname = req.query['nickname'];
    // TODO: check nickanme is string
    console.log(`Setting Parcel ${req.params.id} nickname to ${nickname}`);

    let parcel = await parcelDao.find(Number.parseInt(req.params.id));
    if (!parcel) {
        res.status(404).end()
    } else {
        parcel.nickName = nickname as string;
        await parcelDao.save(parcel);
        res.status(200).json(parcel);
    }
})
