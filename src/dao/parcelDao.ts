import { pool } from "../database/database";
import { dao } from '../decorator/daoDecorators';

import { pirate } from "../mapping/pirate";
import { parcel } from "../models/parcel";
import { baseDao } from "./dao";

export { parcelDao }

@dao('parcel')
class parcelDao extends baseDao<parcel> {

    async findByTrackingId(trackingId: string): Promise<parcel | undefined> {
        try {
            const result = await pool.query(`SELECT * FROM ${this.entityName} WHERE trackingId = $1`, [trackingId]);
            this.expectedRows(result, 1);
            return new pirate<parcel>(result.rows[0], result.fields).map(parcel);
        } catch (e) {
            console.error(`Could not find ${this.entityName} with trackingId ${trackingId}`, e);
            return undefined;
        }
    }
}
