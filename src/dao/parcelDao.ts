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

    async save(value: parcel): Promise<parcel> {
        console.log(value)
        throw new Error("Method not implemented.");
    }
}
/**
 * Implementation of parcelDao
 */
const parcelDaoImpl = new parcelDao();
