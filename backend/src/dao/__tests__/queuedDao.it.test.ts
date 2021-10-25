import { pool } from "../../database/database";
import { queued } from "../../entities/queued";
import { daoFactory } from "../daoFactory";


let findParcelId: number;

// TODO: update tests to use expect(...).toStrictEqual<Dto<parcel>>(...) to compare properties
const qDao = daoFactory(queued);
describe("queuedDao", () => {
    beforeAll(async () => {
        /**
         * Setup parcel to retrieve later
         */
        findParcelId = (await pool.query(
            `INSERT INTO queued (trackingId, owner) ` +
            `VALUES ('findMe', 5) RETURNING id;`
        )).rows[0]['id'];
    })
    test("DaoFactory returns dao with defined custom methods", () => {
        expect(qDao.findByTrackingId).toBeDefined();
        expect(() => qDao.findByTrackingId('test')).not.toThrow();
        expect(qDao.findByOwner).toBeDefined();
        expect(() => qDao.findByOwner(-99)).not.toThrow();

    })
    describe("findAll()", () => {
        test("finds all parcels", async () => {
            const parcels = await qDao.findAll();
            const findParcel_ = parcels?.find(x => x.id === findParcelId);
            expect(findParcel_).toBeDefined();
            expect(findParcel_!.trackingId).toBe('findMe');
        })
    })
    describe("find()", () => {
        test("Id does not map to existing parcel", async () => {
            expect(await qDao.find(-1)).toBeUndefined()
        });

        test("Id maps to existing parcel", async () => {
            let parcel = await qDao.find(findParcelId);
            expect(parcel).toBeDefined();
            parcel = parcel!;
            expect(parcel.id).toBe(findParcelId);
            expect(parcel.trackingId).toBe('findMe');
            expect(parcel.owner).toBe(5);
        })
    })

    describe("findByTrackingId()", () => {
        test("TrackingId does not map to existing parcel", async () => {
            expect(await qDao.findByTrackingId('')).toBeUndefined()
        });

        test("Id maps to existing parcel", async () => {
            let parcel = await qDao.findByTrackingId('findMe');
            expect(parcel).toBeDefined();
            parcel = parcel!;
            expect(parcel.id).toBe(findParcelId);
            expect(parcel.trackingId).toBe('findMe');
            expect(parcel.owner).toBe(5);
        })
    })

    describe("findByOwner()", () => {
        test("Owner does not map to existing parcel", async () => {
            expect(await qDao.findByOwner(-1)).toStrictEqual([])
        });

        test("Id maps to existing queued", async () => {
            let queued: queued[] | queued | undefined = await qDao.findByOwner(5);
            expect(queued).toBeDefined();
            expect(queued).toHaveLength(1);
            queued = queued![0]!;
            expect(queued.id).toBe(findParcelId);
            expect(queued.trackingId).toBe('findMe');
            expect(queued.owner).toBe(5);
        })
    })

    describe("delete()", () => {
        test("Delete invalid Id", async () => {
            expect(await qDao.delete(-1)).toBeFalsy();
        })
        test("Delete with valid Id", async () => {
            let deleteParcelId = (await pool.query(
                `INSERT INTO queued (trackingId, owner) VALUES ('deleteParcelTrkId', 1) RETURNING id;`
            )).rows[0]['id'];

            expect(await qDao.delete(deleteParcelId)).toBeTruthy();
            // ensure parcelEventId no longer exists
            expect(await (await pool.query(`SELECT * FROM queued WHERE id = $1`, [deleteParcelId])).rowCount)
                .toBe(0);
        })
    })

    describe("save", () => {
        test("save new", async () => {
            let newQueued: queued | undefined = new queued({
                trackingId: 'newQueuedTrkId',
                owner: 0,
            });
            newQueued = await qDao.save(newQueued);
            expect(newQueued).toBeDefined();
            expect(newQueued!.id).toBeDefined();
        })
        test("merge", async () => {
            let newQueued: queued | undefined = new queued({
                trackingId: 'mergeQueuedTrkId',
                owner: 0,
            });
            newQueued = await qDao.save(newQueued);

            expect(newQueued).toBeDefined();
            expect(newQueued!.id).toBeDefined();

            newQueued!.owner = 2;
            await qDao.save(newQueued!);

            const savedParcel = (await qDao.find(newQueued!.id!))!;

            expect(savedParcel.owner).toBe(2)
        })
    })
})