import { QueryResult } from "pg";
import { pool } from "../database/database";
import { dao } from "../decorator/daoDecorators";
import { getEntityName, getFields } from "../decorator/entityDecorators";
import { pirate } from "../mapping/pirate";
import { Newable } from "../types/Newable";

export { dao, baseDao, daoEntity }

type dao<T> = {
    /**
     * Find all instances of T
     * @param id 
     */
    findAll: () => PromiseLike<T[] | undefined>;
    /**
     * Lookup T by id
     * @param id 
     */
    find(id: any): PromiseLike<T | undefined>;
    /**
     * Create new or update existing of type {T}
     * @param value 
     */
    save(value: T): PromiseLike<T | undefined>;
    /**
     * Delete T by Id
     * @param id 
     * @returns true if deleted successfully
     */
    delete(id: any): PromiseLike<boolean>;
}

type daoEntity = {
    id?: number;
}

/**
 * BaseDao implementation. 
 * 
 * assumes id property exists, and is identity of object
 */
class baseDao<T extends daoEntity> implements dao<T> {
    entity: Newable<T>;
    entityName: string;

    constructor(entity: Newable<T>) {
        this.entity = entity;
        this.entityName = getEntityName(this.entity);
    }

    async findAll(): Promise<T[] | undefined> {
        try {
            const result = await pool.query(`SELECT * FROM ${this.entityName}`);
            return new pirate<T>(result.rows, result.fields).mapMany(this.entity);
        } catch (e) {
            console.error(`Could not find all ${this.entityName}`, e);
            return undefined;
        }
    }

    async find(id: number): Promise<T | undefined> {
        try {
            const result = await pool.query(`SELECT * FROM ${this.entityName} WHERE ID = $1`, [id]);
            // const result = await pool.query(this.findAllQ,);
            this.expectedRows(result, 1);
            return new pirate<T>(result.rows[0], result.fields).map(this.entity);
        } catch (e) {
            console.error(`Could not find ${this.entityName} with id ${id}`, e);
            return undefined;
        }
    }
    // FIXME: support merging
    async save(newObj: T): Promise<T | undefined> {
        const fields = getFields(this.entity).filter(x => x !== 'id');
        try {
            const result = await pool.query(`INSERT INTO ${this.entityName} (${fields.join(', ')}) ` +
                `VALUES (${fields.map((_, i) => '$' + (i + 1))}) RETURNING id`,
                fields.map(field =>
                    //@ts-expect-error 
                    newObj[field]
                )
            );
            this.expectedRows(result, 1);
            newObj.id = result.rows[0]['id'];
            return newObj;
        } catch (e) {
            console.error(`Could not save ${this.entityName}`, e);
            return undefined;
        }
    }

    async delete(id: any): Promise<boolean> {
        try {
            const result = await pool.query(`DELETE FROM ${this.entityName} WHERE id = $1`, [id]);
            return result.rowCount === 1;
        } catch (e) {
            console.error(`Could not delete ${this.entityName} with id ${id}`, e);
            return false;
        }
    }

    // TODO: move somewhere else ?
    /**
     * 
     * @param result
     * @param count Expected rows in result
     * @throws Error if more than one row returned
     */
    expectedRows(result: QueryResult, count: number) {
        if (result.rowCount !== count) {
            throw new Error(`${result.rowCount} rows returned, expected ${count}`);
        }
        return result;
    }

    // TODO: add Error Logging method
    /**
    if (err === undefined) {
        console.log("No errors returned from Postgres")
    } else if (err.message !== undefined) {
        console.log('ERROR message:', err.message)
    }
     */
}
