import { dao } from '../decorator/daoDecorators';
import { queued } from "../entities/queued";
import { pirate } from '../mapping/pirate';
import { baseDao } from "./baseDao";

export { queuedDao };

@dao('queued')
class queuedDao extends baseDao<queued> {

    async findByTrackingId(trackingId: string): Promise<queued | undefined> {
        try {
            const result = await this.pool.query(`SELECT * FROM ${this.entityName} WHERE trackingId = $1`, [trackingId]);
            this.expectedRows(result, 1);
            return new pirate<queued>(this.entity).map(result.rows[0], result.fields);
        } catch (e) {
            console.warn(`Could not find ${this.entityName} with trackingId ${trackingId}`, e);
            return undefined;
        }
    }

    async findByOwner(owner: number): Promise<queued[] | undefined> {
        try {
            const result = await this.pool.query(`SELECT * FROM ${this.entityName} WHERE owner = $1`, [owner]);
            // this.expectedRows(result, 1);
            return new pirate<queued>(this.entity).mapMany(result.rows, result.fields);
        } catch (e) {
            console.warn(`Could not find ${this.entityName} with owner ${owner}`, e);
            return undefined;
        }
    }
}
