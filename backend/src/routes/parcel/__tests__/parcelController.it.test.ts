import request from 'supertest';
import { buildExpress } from '../../../buildExpress';
import { daoFactory } from '../../../dao/daoFactory';
import { pool } from '../../../database/database';
import { parcel } from '../../../entities/parcel';
import { Dto } from '../../../types/Dto';

const parcelDao = daoFactory(parcel);
// findParcelTrkId
let findParcel: number;
// deleteMeTrkId
let parcelToDelete: number;
// deletedParcelTrkId
let deletedParcel: number;
describe("parcel controller", () => {
    let app = buildExpress();
    beforeAll(async () => {
        findParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('findParcelTrkId', 1, 'nickname', 0) RETURNING id;`
        )).rows[0]['id'];
        parcelToDelete = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('deleteMeTrkId', 1, 'nickname', 0) RETURNING id;`
        )).rows[0]['id'];
        deletedParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync, "disabled") VALUES ('deletedParcelTrkId', 1, 'nickname', 0, 'y') RETURNING id;`
        )).rows[0]['id'];
    })

    describe("get active parcels", () => {
        // FIXME: wtf, why is async jest broken in this version ? need to reread documentation so --forceExit isn't required
        test("get all parcels", async () => {
            await request(app)
                .get('/v0/parcel/')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => {
                    expect(resp.body.map((x: Dto<parcel>) => x.trackingId)).toContain('findParcelTrkId');
                    expect(resp.body.map((x: Dto<parcel>) => x.trackingId)).toContain('deletedParcelTrkId');
                })
        });
        test("get all non-deleted parcels", async () => {
            await request(app)
                .get('/v0/parcel?disabled=false')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => {
                    expect(resp.body.map((x: Dto<parcel>) => x.trackingId)).toContain('findParcelTrkId');
                    expect(resp.body.map((x: Dto<parcel>) => x.trackingId)).not.toContain('deletedParcelTrkId');
                })
        });
        test("get deleted parcels", async () => {
            await request(app)
                .get('/v0/parcel?disabled=true')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => {
                    console.info(resp.body);
                    expect(resp.body.map((x: Dto<parcel>) => x.trackingId)).toContain('deletedParcelTrkId');
                })
        })
    })

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

    describe("delete parcel", () => {
        test("delete parcel without events", async () => {
            const deleteParcelId = await request(app)
                .post(`/v0/parcel/`)
                .send({
                    events: [],
                    disabled: false,
                    lastSync: 100,
                    owner: -1,
                    trackingId: 'deleteParcelTrkId',
                } as Dto<parcel>)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => resp.body.id);

            await request(app)
                .delete(`/v0/parcel/${deleteParcelId}`)
                .expect(200);

            await request(app)
                .get(`/v0/parcel/${deleteParcelId}`)
                .expect(404);
        });
        test("delete parcel with events", async () => {
            const deleteParcelId = await request(app)
                .post(`/v0/parcel/`)
                .send({
                    events: [{
                        dateTime: 0,
                        location: '',
                        message: '',
                        raw: '',
                        type: 'pending',
                    }],
                    lastSync: 100,
                    owner: -1,
                    trackingId: 'deleteParcelTrkId2',
                } as Dto<parcel>)
                .expect('Content-Type', /json/)
                .expect(200)
                .then(resp => resp.body.id);

            await request(app)
                .delete(`/v0/parcel/${deleteParcelId}`)
                .expect(200);

            await request(app)
                .get(`/v0/parcel/${deleteParcelId}`)
                .expect(404);

        });
    })

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
                    disabled: false,
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
                    disabled: false,
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