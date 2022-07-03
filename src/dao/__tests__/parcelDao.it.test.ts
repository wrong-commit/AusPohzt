import { pool } from "../../database/database";
import { parcel } from "../../entities/parcel";
import { trackingEvent } from "../../entities/trackingEvent";
import { daoFactory } from "../daoFactory";
import { parcelDao } from "../parcelDao";

// initialize decorators for parcelDao 

let findParcelId: number;
let saveParcel: number;

let findParcelEvent1: number;
let findParcelEvent2: number;

// TODO: update tests to use expect(...).toStrictEqual<Dto<parcel>>(...) to compare properties
const pDao = daoFactory(parcel);
describe("parcelDao", () => {
    beforeAll(async () => {
        /**
         * Setup parcel to retrieve later
         */
        findParcelId = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) ` +
            `VALUES ('findMe', 1, null, 0) RETURNING id;`
        )).rows[0]['id'];

        findParcelEvent1 = (await pool.query(
            `INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw) ` +
            `VALUES (${findParcelId}, 1, 'location', 'first message', 'delivered', '') RETURNING id`
        )).rows[0]['id'];

        findParcelEvent2 = (await pool.query(
            `INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw) ` +
            `VALUES (${findParcelId}, 2, 'location', 'second message', 'pending', '') RETURNING id`
        )).rows[0]['id'];

        /**
         * Setup parcel to test saving against
         */
        saveParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) ` +
            `VALUES ('saveMe', 1, null, 0) RETURNING id;`
        )).rows[0]['id'];
    })
    test("DaoFactory returns dao with defined custom methods", () => {
        expect(pDao.findByTrackingId).toBeDefined();
        expect(() => pDao.findByTrackingId('test')).not.toThrow();

    })
    describe("findAll()", () => {
        test("finds all parcels", async () => {
            const parcels = await pDao.findAll();
            const findParcel_ = parcels?.find(x => x.id === findParcelId);
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
            let parcel = await pDao.find(findParcelId);
            expect(parcel).toBeDefined();
            parcel = parcel!;
            expect(parcel.id).toBe(findParcelId);
            expect(parcel.trackingId).toBe('findMe');
            expect(parcel.owner).toBe(1);
            expect(parcel.nickName).toBe(null);
            expect(parcel.lastSync).toBe(0);

            const events = parcel.events;
            expect(events).toHaveLength(2);
            expect(events[0]?.id).toBe(findParcelEvent1);
            expect(events[0]?.parcelId).toBe(findParcelId);
            expect(events[0]?.dateTime).toBe(1);
            expect(events[0]?.location).toBe('location');
            expect(events[0]?.message).toBe('first message');
            expect(events[0]?.type).toBe('delivered');

            expect(events[1]?.id).toBe(findParcelEvent2);
            expect(events[1]?.parcelId).toBe(findParcelId);
            expect(events[1]?.dateTime).toBe(2);
            expect(events[1]?.location).toBe('location');
            expect(events[1]?.message).toBe('second message');
            expect(events[1]?.type).toBe('pending');
        })
    })

    describe("findByTrackingId()", () => {
        test("TrackingId does not map to existing parcel", async () => {
            expect(await pDao.findByTrackingId('')).toBeUndefined()
        });

        test("Id maps to existing parcel", async () => {
            let parcel = await pDao.findByTrackingId('findMe');
            expect(parcel).toBeDefined();
            parcel = parcel!;
            expect(parcel.id).toBe(findParcelId);
            expect(parcel.trackingId).toBe('findMe');
            expect(parcel.owner).toBe(1);
            expect(parcel.nickName).toBe(null);
            expect(parcel.lastSync).toBe(0);

            const events = parcel.events;

            expect(events).toHaveLength(2);
            expect(events[0]?.id).toBe(findParcelEvent1);
            expect(events[0]?.parcelId).toBe(findParcelId);
            expect(events[0]?.dateTime).toBe(1);
            expect(events[0]?.location).toBe('location');
            expect(events[0]?.message).toBe('first message');
            expect(events[0]?.type).toBe('delivered');

            expect(events[1]?.id).toBe(findParcelEvent2);
            expect(events[1]?.parcelId).toBe(findParcelId);
            expect(events[1]?.dateTime).toBe(2);
            expect(events[1]?.location).toBe('location');
            expect(events[1]?.message).toBe('second message');
            expect(events[1]?.type).toBe('pending');
        })
    })

    describe("delete()", () => {
        test("Delete invalid Id", async () => {
            expect(await pDao.delete(-1)).toBeFalsy();
        })
        test("Delete with valid Id", async () => {
            let deleteParcelId = (await pool.query(
                `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('deleteParcelTrkId', 1, 'nickname', 0) RETURNING id;`
            )).rows[0]['id'];

            let parcelEventId = (await pool.query(
                `INSERT INTO trackingEvent (parcelId, dateTime, location, message, type, raw) ` +
                `VALUES (${deleteParcelId}, 2, 'location', 'delete me', 'pending', '') RETURNING id`
            )).rows[0]['id'];

            expect(await pDao.delete(deleteParcelId)).toBeTruthy();
            // ensure parcelEventId no longer exists
            expect(await (await pool.query(`SELECT * FROM parcel WHERE id = $1`, [deleteParcelId])).rowCount)
                .toBe(0);
            expect(await (await pool.query(`SELECT * FROM trackingEvent WHERE id = $1`, [parcelEventId])).rowCount)
                .toBe(0);
        })
    })

    describe("save", () => {
        test("save new", async () => {
            let newParcel: parcel | undefined = new parcel({
                trackingId: 'newParcelTrkId',
                owner: 0,
                events: [{
                    dateTime: 0,
                    location: '',
                    message: '',
                    raw: '',
                    type: 'pending',
                }],
                lastSync: 0,
            });
            newParcel = await pDao.save(newParcel);
            expect(newParcel).toBeDefined();
            expect(newParcel!.id).toBeDefined();
            expect(newParcel?.events[0]?.id).toBeDefined();
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
            newParcel!.events.push(new trackingEvent({
                dateTime: 4,
                location: '',
                message: 'merged',
                raw: '',
                type: 'pending',
            }));

            await pDao.save(newParcel!);

            const savedParcel = (await pDao.find(newParcel!.id!))!;

            expect(savedParcel.nickName).toBe('newNickname')

            const events = savedParcel.events;
            expect(events).toHaveLength(1);
            expect(events[0]?.id).toBe(findParcelEvent1);
            expect(events[0]?.parcelId).toBe(newParcel!.id);
            expect(events[0]?.dateTime).toBe(4);
            expect(events[0]?.location).toBe('');
            expect(events[0]?.message).toBe('merged');
            expect(events[0]?.type).toBe('pending');

        })
    })
})