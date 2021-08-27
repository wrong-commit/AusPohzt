import { pool } from "../../database/database";
import { parcel } from "../../entities/parcel";
import { daoFactory } from "../daoFactory";
import { parcelDao } from "../parcelDao";

// initialize decorators for parcelDao 

let findParcel: number;
let saveParcel: number;
const pDao = daoFactory(parcel);
describe("parcelDao", () => {
    beforeAll(async () => {
        /**
         * Setup parcel to retrieve later
         */
        findParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('findMe', 1, null, 0) RETURNING id;`
        )).rows[0]['id'];
        /**
         * Setup parcel to test saving against
         */
        saveParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('saveMe', 1, null, 0) RETURNING id;`
        )).rows[0]['id'];
    })
    test("DaoFactory returns dao with defined custom methods", () => {
        expect(pDao.findByTrackingId).toBeDefined();
        expect(() => pDao.findByTrackingId('test')).not.toThrow();

    })
    describe("findAll()", () => {
        test("finds all parcels", async () => {
            const parcels = await pDao.findAll();
            const findParcel_ = parcels?.find(x => x.id === findParcel);
            const saveParcel_ = parcels?.find(x => x.id === saveParcel);
            expect(findParcel_).toBeDefined();
            expect(saveParcel_).toBeDefined();
            // just check a couple properties
            expect(findParcel_!.trackingId).toBe('findMe');
            expect(saveParcel_!.trackingId).toBe('saveMe');
        })
    })
    describe("find()", () => {
        test("Id does not map to existing parcel", async () => {
            expect(await pDao.find(-1)).toBeUndefined()
        });

        test("Id maps to existing parcel", async () => {
            const parcel = await pDao.find(findParcel);
            expect(parcel).toBeDefined();
            expect(parcel!.id).toBe(findParcel);
            expect(parcel!.trackingId).toBe('findMe');
            expect(parcel!.owner).toBe(1);
            expect(parcel!.nickName).toBe(null);
            expect(parcel!.lastSync).toBe(0);
        })
    })

    describe("findByTrackingId()", () => {
        test("TrackingId does not map to existing parcel", async () => {
            expect(await pDao.findByTrackingId('')).toBeUndefined()
        });

        test("Id maps to existing parcel", async () => {
            const parcel = await pDao.findByTrackingId('findMe');
            expect(parcel).toBeDefined();
            expect(parcel!.id).toBe(findParcel);
            expect(parcel!.trackingId).toBe('findMe');
            expect(parcel!.owner).toBe(1);
            expect(parcel!.nickName).toBe(null);
            expect(parcel!.lastSync).toBe(0);
        })
    })

    describe("delete()", () => {
        test("Delete invalid Id", async () => {
            expect(await pDao.delete(-1)).toBeFalsy();
        })
        test("Delete with valid Id", async () => {
            let deleteParcel = (await pool.query(
                `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('deleteParcelTrkId', 1, 'nickname', 0) RETURNING id;`
            )).rows[0]['id'];

            expect(await pDao.delete(deleteParcel)).toBeTruthy();
        })
    })

    describe("save", () => {
        test("save new", async () => {
            let newParcel: parcel | undefined = new parcel({
                trackingId: 'newParcelTrkId',
                owner: 0,
                events: [],
                lastSync: 0,
            });
            newParcel = await pDao.save(newParcel);
            expect(newParcel).toBeDefined();
            expect(newParcel!.id).toBeDefined();
        })
        test("merge", async () => {
            let newParcel: parcel | undefined = new parcel({
                trackingId: 'newParcelTrkId',
                owner: 0,
                events: [],
                lastSync: 0,
            });
            newParcel = await pDao.save(newParcel);

            expect(newParcel).toBeDefined();
            expect(newParcel!.id).toBeDefined();

            newParcel!.nickName = 'newNickname';

            await pDao.save(newParcel!);

            const savedNick = (await pDao.find(newParcel!.id!))!.nickName;

            expect(savedNick).toBe('newNickname')
        })
    })
})