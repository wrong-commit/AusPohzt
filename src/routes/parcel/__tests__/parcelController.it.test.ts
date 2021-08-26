import request from 'supertest';
import { buildExpress } from '../../../buildExpress';
import { pool } from '../../../database/database';
import { parcel } from '../../../models/parcel';
import { Dto } from '../../../types/Dto';

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

    test("delete parcel", async () => {
        let deleteParcel = (await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('deleteParcelTrkId', 1, 'nickname', 0) RETURNING id;`
        )).rows[0]['id'];

        await request(app)
            .delete(`/v0/parcel/${deleteParcel}`)
            .expect(200);

        await request(app)
            .delete(`/v0/parcel/${deleteParcel}`)
            .expect(404);
    });
});