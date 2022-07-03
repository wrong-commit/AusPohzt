import { pool } from "../database/database";
import { dao } from '../decorator/daoDecorators';

import { JoinQueryResult, pirate } from "../mapping/pirate";
import { parcel } from "../entities/parcel";
import { baseDao } from "./dao";

export { parcelDao }

@dao('parcel')
class parcelDao extends baseDao<parcel> {

    async findByTrackingId(trackingId: string): Promise<parcel | undefined> {
        try {
            const result = await pool.query(`SELECT * FROM ${this.entityName} WHERE trackingId = $1`, [trackingId]);
            this.expectedRows(result, 1);
            const rowJoinData: JoinQueryResult[] = await this.join(result.rows[0])
            return new pirate<parcel>(result.rows[0], result.fields, rowJoinData).map(this.entity);
        } catch (e) {
            console.warn(`Could not find ${this.entityName} with trackingId ${trackingId}`, e);
            return undefined;
        }
    }
}
