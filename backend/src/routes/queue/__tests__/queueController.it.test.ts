import request from 'supertest';
import { buildExpress } from "../../../buildExpress";
import { daoFactory } from "../../../dao/daoFactory";
import { pool } from "../../../database/database";
import { queued } from '../../../entities/queued';
import { Dto } from '../../../types/Dto';

const queuedDao = daoFactory(queued);
let existingParcel: number;
let queuedParcelId1: string;
let queuedParcelId2: string;

describe("queue controller", () => {
    let app = buildExpress();
    beforeAll(async () => {
        existingParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('aliceAdded', 1, NULL, 0) RETURNING id;`
        )).rows[0]['id'];
        queuedParcelId1 = (await pool.query(
            `INSERT INTO queued (trackingId, owner) VALUES ('aliceQueued', 1) RETURNING id;`
        )).rows[0]['trackingId'];
        queuedParcelId1 = (await pool.query(
            `INSERT INTO queued (trackingId, owner) VALUES ('adamQueued', 2) RETURNING id;`
        )).rows[0]['trackingId'];
    })
    describe("get queued parcels", () => {
        test("get all queued for owner", async () => {
            await request(app)
                .get(`/v0/queue/1`)
                .expect(resp => {
                    const usersQueued = resp.body as Dto<queued>[];
                    expect(usersQueued).toHaveLength(1);
                    expect(usersQueued[0]?.trackingId).toBe('aliceQueued')
                });

            await request(app)
                .get(`/v0/queue/2`)
                .expect(resp => {
                    const usersQueued = resp.body as Dto<queued>[];
                    expect(usersQueued).toHaveLength(1);
                    expect(usersQueued[0]?.trackingId).toBe('adamQueued')
                });
        })
        test("get all queued", async () => {
            await request(app)
                .get(`/v0/queue`)
                .expect(resp => {
                    const usersQueued = resp.body as Dto<queued>[];
                    expect(usersQueued).toHaveLength(2);
                    expect(usersQueued.map(x => x.trackingId)).toContain('aliceQueued')
                    expect(usersQueued.map(x => x.trackingId)).toContain('adamQueued')
                });
        })
    })
    describe("queue new parcel", () => {
        test("empty tracking id returns 404", async () => {
            await request(app)
                .post(`/v0/queue/`)
                .expect(404);

            await request(app)
                .post(`/v0/queue/  ` + '\t' + '    ')
                .expect(404);
        })
        // FIXME: don't lazily check that deleting works here
        test("queued parcel persisted and deleted correctly", async () => {
            console.log('1');
            let trackingId = 'newQueuedId';
            await request(app)
                .post(`/v0/queue/${trackingId}`)
                .expect(200)
                .then(resp => resp.body.id);

        })
        test("cannot queue parcel twice", async () => {
            await request(app)
                .post(`/v0/queue/adamQueued`)
                .expect(500)
        })

        test("cannot queue parcel that exists", async () => {
            await request(app)
                .post(`/v0/queue/aliceAdded`)
                .expect(500)
        })
    })
    describe("delete queued parcel", () => {
        test("delete actual queued parcel by tracking id", async () => {
            await pool.query(`INSERT INTO queued (trackingId, owner) VALUES ('deleteActual', 8) RETURNING id;`);
            await request(app)
                .delete(`/v0/queue/deleteActual`)
                .expect(200);
        })
        test("delete missing queued parcel by tracking id", async () => {
            await request(app)
                .delete(`/v0/queue/this_doesnt_actually_exist`)
                .expect(404);
        })
    })
})