import request from 'supertest';
import { buildExpress } from '../../../buildExpress';
import { pool } from '../../../database/pool';
describe("parcelController", () => {
    let app = buildExpress();
    beforeAll(async () => {
        await pool.query(
            `INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ('testTrackingId', 1, 'nickname', 0);`
        );
    })
    // FIXME: wtf, why is async jest broken in this version ? need to reread documentation so --forceExit isn't required
    it("get all parcels", async () => {
        await request(app)
            .get('/v0/parcel/')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(resp => {
                expect(resp.body).toStrictEqual(['testTrackingId']);
            })
    });
})