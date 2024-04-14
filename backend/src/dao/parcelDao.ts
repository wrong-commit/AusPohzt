import { dao } from '../decorator/daoDecorators';
import { JoinQueryResult, pirate } from "../mapping/pirate";
import { parcel } from "../entities/parcel";
import { baseDao } from "./baseDao";
import { whereBool } from './where';

export { parcelDao }

@dao('parcel')
class parcelDao extends baseDao<parcel> {

    /**
     * Get active parcels
     */
    override async findAll(): Promise<parcel[] | undefined> {
        try {
            // TODO: support JOIN queries ? 
            const result = await this.pool.query(`SELECT * FROM ${this.entityName}`);
            const joinRows = [];
            console.debug(`DEBUG Got ${result.rowCount} results`)
            for (const row of result.rows) {
                const rowJoinData: JoinQueryResult[] = await this.join(row);
                joinRows.push(rowJoinData);
            }
            return new pirate<parcel>(this.entity).mapMany(result.rows, result.fields, joinRows);
        } catch (e) {
            console.error(`Could not find all ${this.entityName}`, e);
            return undefined;
        }
    }

    async findByDisabled(disabled: boolean): Promise<parcel[] | undefined> {
        try {
            // TODO: support JOIN queries ? 
            const result = await this.pool.query(`SELECT * FROM ${this.entityName} WHERE "disabled" = $1`, [whereBool(disabled)]);
            const joinRows = [];
            console.debug(`DEBUG Got ${result.rowCount} results`)
            for (const row of result.rows) {
                const rowJoinData: JoinQueryResult[] = await this.join(row);
                joinRows.push(rowJoinData);
            }
            return new pirate<parcel>(this.entity).mapMany(result.rows, result.fields, joinRows);
        } catch (e) {
            console.error(`Could not find all disabled=${disabled} ${this.entityName} `, e);
            return undefined;
        }
    }

    /**
     * Get active tracking ID of active parcels
     * @param trackingId 
     * @returns 
     */
    async findByTrackingId(trackingId: string): Promise<parcel | undefined> {
        return this.findByTrackingIdAndDisabled(trackingId, false);
    }

    async findByTrackingIdAndDisabled(trackingId: string, disabled: boolean): Promise<parcel | undefined> {
        try {
            const result = await this.pool.query(`SELECT * FROM ${this.entityName} WHERE trackingId = $1 AND "disabled" = $2`, [trackingId, whereBool(disabled)]);
            this.expectedRows(result, 1);
            const rowJoinData: JoinQueryResult[] = await this.join(result.rows[0])
            return new pirate<parcel>(this.entity).map(result.rows[0], result.fields, rowJoinData);
        } catch (e) {
            console.warn(`Could not find ${this.entityName} with trackingId ${trackingId} and disabled ${disabled}`, e);
            return undefined;
        }
    }

}
