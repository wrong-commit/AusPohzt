import { pool } from "../database/database";
import { pirate } from "../mapping/pirate";
import { parcel } from "../models/parcel";
import { dao } from "./dao";

export { parcelDaoImpl as parcelDao }

// TODO: make abstract dao class
class parcelDao extends dao<parcel> {
    async delete(id: any): Promise<boolean> {
        try {
            const result = await pool.query('DELETE FROM parcel WHERE id = $1', [id]);
            return result.rowCount === 1;
        } catch (e) {
            console.error(`Could not delete parcel with id ${id}`, e);
            return false;
        }
    }
    async findAll(): Promise<parcel[] | undefined> {
        try {
            const result = await pool.query('SELECT * FROM parcel');
            return new pirate<parcel>(result.rows, result.fields).mapMany(parcel);
        } catch (e) {
            console.error(`Could not find all parcels`, e);
            return undefined;
        }
    }
    async find(id: number): Promise<parcel | undefined> {
        try {
            const result = await pool.query('SELECT * FROM parcel WHERE id = $1', [id]);
            this.expectedRows(result, 1);
            return new pirate<parcel>(result.rows[0], result.fields).map(parcel);
        } catch (e) {
            console.error(`Could not find parcel with id ${id}`, e);
            return undefined;
        }
    }
    async findByTrackingId(trackingId: string): Promise<parcel | undefined> {
        try {
            const result = await pool.query('SELECT * FROM parcel WHERE trackingId = $1', [trackingId]);
            this.expectedRows(result, 1);
            return new pirate<parcel>(result.rows[0], result.fields).map(parcel);
        } catch (e) {
            console.error(`Could not find parcel with trackingId ${trackingId}`, e);
            return undefined;
        }
    }
    // FIXME: support merging parcels 
    async save(newParcel: parcel): Promise<parcel | undefined> {
        try {
            const result = await pool.query('INSERT INTO parcel (trackingId, owner, nickname, lastSync) VALUES ($1, $2, $3, $4) RETURNING id', [newParcel.trackingId, newParcel.owner, newParcel.nickName, newParcel.lastSync]);
            this.expectedRows(result, 1);
            newParcel.id = result.rows[0]['id'];
            return newParcel;
        } catch (e) {
            console.error(`Could not save parcel`, e);
            return undefined;
        }
    }
}
/**
 * Implementation of parcelDao
 */
const parcelDaoImpl = new parcelDao();
