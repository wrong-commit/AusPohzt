import request from 'supertest';
import { buildExpress } from '../../../buildExpress';
import { daoFactory } from '../../../dao/daoFactory';
import { pool } from '../../../database/database';
import { parcel } from '../../../entities/parcel';
import { Dto } from '../../../types/Dto';

const parcelDao = daoFactory(parcel);
let findParcel: number;
// parcel to delete
describe("parcelController", () => {
    let app = buildExpress();
    beforeAll(async () => {
        findParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('findParcelTrkId', 1, 'nickname', 0) RETURNING id;`
        )).rows[0]['id'];
    })
    // FIXME: wtf, why is async jest broken in this version ? need to reread documentation so --forceExit isn't required
    test("get all parcels", async () => {
        await request(app)
            .get('/v0/parcel/')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(resp => {
                expect(resp.body.map((x: Dto<parcel>) => x.trackingId)).toContain('findParcelTrkId');
            })
    });

    test("get parcel by id", async () => {
        await request(app)
            .get(`/v0/parcel/${findParcel}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then(resp => {
                expect(resp.body.trackingId).toBe('findParcelTrkId');
            })
    });

    describe("set nickname", () => {
        test("invalid parcel returns 500", async () => {
            await request(app)
                .put(`/v0/parcel/${-1}/nickname`)
                .query({ nickname: 'failme' })
                .expect(404);
        })
        test("updating parcel returns new nick on subsequent request", async () => {
            const nick = 'cage';
            const renameParcel = (await pool.query(
                `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('giveMeNickname', 1, null, 0) RETURNING id;`
            )).rows[0]['id'];

            await request(app)
                .put(`/v0/parcel/${renameParcel}/nickname`)
                .query({ nickname: nick })
                .expect(200);

            const parcel = await parcelDao.find(renameParcel);
            expect(parcel).toBeDefined();
            expect(parcel?.nickName).toBe(nick);
        })
    })

    test("delete parcel", async () => {
        const deleteParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('deleteParcelTrkId', 1, 'nickname', 0) RETURNING id;`
        )).rows[0]['id'];

        await request(app)
            .delete(`/v0/parcel/${deleteParcel}`)
            .expect(200);

        await request(app)
            .get(`/v0/parcel/${deleteParcel}`)
            .expect(404);
    });

    describe("add parcel", () => {
        test("undefined body returns 500", async () => {
            await request(app)
                .post(`/v0/parcel/`)
                .expect(500)
        })
        test("new parcel added", async () => {
            await request(app)
                .post(`/v0/parcel/`)
                .send({
                    events: [],
                    lastSync: 100,
                    owner: -1,
                    trackingId: 'addedTrackingId',
                } as Dto<parcel>)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => {
                    const saved = resp.body as Dto<parcel>
                    expect(saved).toBeDefined();
                    expect(saved.trackingId).toBe('addedTrackingId');
                    expect(saved.id).toBeDefined();
                    // TODO: assert actual owner Id when auth added
                    expect(saved.owner).toBe(-1);
                    // set by default
                    expect(saved.lastSync).toBe(-1);
                    expect(saved.nickName).toBeUndefined();
                })
        })
        test("cannot add same parcel twice", async () => {
            await request(app)
                .post(`/v0/parcel/`)
                .send({
                    events: [],
                    lastSync: 100,
                    owner: -1,
                    // findParcelTrkId setup when test first runs
                    trackingId: 'findParcelTrkId',
                } as Dto<parcel>)
                .expect(500)
            // FIXME: assert returned message
            // .expect({ message: 'Parcel already exists' })
        })
    })
});