import { pool } from "../../database/database";
import { parcelDao } from "../parcelDao";

let findParcel: number;
let saveParcel: number;
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
    describe("findAll()", () => {
        test("finds all parcels", async () => {
            const parcels = await parcelDao.findAll();
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
            expect(await parcelDao.find(-1)).toBeUndefined()
        });

        test("Id maps to existing parcel", async () => {
            const parcel = await parcelDao.find(findParcel);
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
            expect(await parcelDao.delete(-1)).toBeFalsy();
        })
        test("Delete with valid Id", async () => {
            let deleteParcel = (await pool.query(
                `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('deleteParcelTrkId', 1, 'nickname', 0) RETURNING id;`
            )).rows[0]['id'];

            expect(await parcelDao.delete(deleteParcel)).toBeTruthy();
        })
    })
})