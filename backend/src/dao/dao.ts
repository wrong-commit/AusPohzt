import { Pool, QueryResult, QueryResultRow } from "pg";
import { dao } from "../decorator/daoDecorators";
import { getEntity, getEntityName, getFields } from "../decorator/entityDecorators";
import { getJoinData, joinData } from "../decorator/joinDecorator";
import { JoinQueryResult, pirate } from "../mapping/pirate";
import { Newable } from "../types/Newable";
import { daoFactory } from "./daoFactory";

export { dao, baseDao, daoEntity };

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
    find(id: number): PromiseLike<T | undefined>;
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
    delete(id: number): PromiseLike<boolean>;
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
    pool: Pool;

    entity: Newable<T>;
    entityName: string;
    joinDatas?: joinData[]
    fields: string[];

    constructor(entity: Newable<T>, pool: Pool) {
        this.entity = entity;
        this.entityName = getEntityName(this.entity);
        this.fields = getFields(this.entity);
        this.joinDatas = getJoinData(this.entity);
        // postgres pool object.
        this.pool = pool;
    }

    async findAll(): Promise<T[] | undefined> {
        try {
            // TODO: support JOIN queries ? 
            const result = await this.pool.query(`SELECT * FROM ${this.entityName}`);
            const joinRows = [];
            for (const row of result.rows) {
                const rowJoinData: JoinQueryResult[] = await this.join(row);
                joinRows.push(rowJoinData);
            }
            return new pirate<T>(this.entity).mapMany(result.rows, result.fields, joinRows);
        } catch (e) {
            console.error(`Could not find all ${this.entityName}`, e);
            return undefined;
        }
    }

    async find(id: number): Promise<T | undefined> {
        try {
            const result = await this.pool.query(`SELECT * FROM ${this.entityName} WHERE ID = $1`, [id]);
            // const result = await pool.query(this.findAllQ,);
            this.expectedRows(result, 1);
            const joinRows: JoinQueryResult[] = await this.join(result.rows[0]!)
            return new pirate<T>(this.entity).map(result.rows[0], result.fields, joinRows);
        } catch (e) {
            console.error(`Could not find ${this.entityName} with id ${id}`, e);
            return undefined;
        }
    }
    // FIXME: support merging
    async save(newObj: T): Promise<T | undefined> {
        try {
            // merge existing objects
            // TODO: dedupe saveJoins call ? 
            if (!newObj.id) {
                return this.saveNew(newObj);
            } else {
                return this.merge(newObj);
            }
        } catch (e) {
            console.error(`Could not save ${this.entityName}`, e);
            return undefined;
        }
    }

    /**
     * This should always be passed in an ID
     * @param id 
     * @returns 
     */
    async delete(id: number): Promise<boolean> {
        try {
            if (this.joinDatas) {
                console.debug(`Deleting joined entities for ${this.entityName}`);
                let deleted = 0;
                for (const [_, jEntityName, __, joinColumn] of this.joinDatas) {
                    console.debug(`Deleting joined entity ${jEntityName} where ${joinColumn} = ${id}`);
                    const deleteResult = await this.pool.query(`DELETE FROM ${jEntityName} WHERE ${joinColumn} = $1`,
                        [id]);
                    if(deleteResult.rowCount != null) {
                        deleted += deleteResult.rowCount;
                    }
                    console.debug(`Deleted x${deleteResult.rowCount} joined entity ${jEntityName}`);
                }
                console.debug(`Deleted ${deleted} joined entities for ${this.entity} ${id}`)
                // TODO: assert deleted entities
            }
            const result = await this.pool.query(`DELETE FROM ${this.entityName} WHERE id = $1`, [id]);
            this.expectedRows(result, 1);
            return true;
        } catch (e) {
            console.error(`Could not delete ${this.entityName} with id ${id}`, e);
            return false;
        }
    }

    protected async saveNew(newObj: T): Promise<T | undefined> {
        const fields = this.fields.filter(x => x !== 'id');
        try {
            const result = await this.pool.query(`INSERT INTO ${this.entityName} (${fields.join(', ')}) ` +
                `VALUES (${fields.map((_, i) => '$' + (i + 1))}) RETURNING id`,
                fields.map(field =>
                    //@ts-expect-error 
                    newObj[field])
            );
            this.expectedRows(result, 1);
            newObj.id = result.rows[0]['id'];
            await this.saveJoins(newObj);
            return newObj;
        } catch (e) {
            console.error(`Could not save ${this.entityName}`, e);
            return undefined;
        }
    }

    protected async merge(existObj: T): Promise<T | undefined> {
        const fields = this.fields.filter(x => x !== 'id');
        try {
            // create `field1=$2, field2=$3` string
            let setValues = fields.map((x, i) => `${x} = $${i + 2}`);
            // where id=$1
            const result = await this.pool.query(`UPDATE ${this.entityName} SET ${setValues.join(',')} WHERE id =$1`,
                [
                    existObj.id,
                    ...fields.map(field =>
                        //@ts-expect-error 
                        existObj[field])
                ]
            );
            this.expectedRows(result, 1);
            await this.saveJoins(existObj);
            // TODO: support versions ? 
            return existObj;
        } catch (e) {
            console.error(`Could not merge ${this.entityName}`, e);
            return undefined;
        }
    }

    protected async join(row: QueryResultRow) {
        const rowJoinData: JoinQueryResult[] = [];
        if (this.joinDatas) {
            console.trace(`Fetching joined entities for ${this.entityName}`);
            for (const [_, jEntityName, __, joinColumn] of this.joinDatas) {
                const joinResult = await this.pool.query(`SELECT * FROM ${jEntityName} WHERE ${joinColumn} = $1`,
                    [row['id']]);
                rowJoinData.push(...joinResult.rows.map(jRow => ({
                    joinedEntity: jEntityName,
                    row: jRow,
                    fieldDefs: joinResult.fields
                })))
            }
        }
        return rowJoinData;
    }

    // TODO: add logging
    protected async saveJoins(existObj: T): Promise<number | undefined> {
        if (this.joinDatas) {
            console.debug(`Saving joined entities for ${this.entityName}`);
            let updated = 0;
            for (const [field, jEntityName, assoc, joinColumn] of this.joinDatas) {
                console.debug(`entity  ${this.entityName}. field=${field},jEntityName=${jEntityName},assoc=${assoc},joinColumn=${joinColumn}`);
                const joinEntity = getEntity(jEntityName);

                let existJents: Array<any> = [];

                if (assoc === 'single') {
                    //@ts-expect-error
                    const existJent = existObj[field];
                    if (existJent) {
                        existJents.push(existJent)
                    } else {
                        console.debug(`Join entity ${jEntityName} on ${this.entityName}.${joinColumn} was undefined`);
                    }
                } else {
                    //@ts-expect-error
                    existJents = existObj[field];
                }

                // set join column value to entity id
                existJents.forEach(j => j[joinColumn] = existObj.id)

                // TODO: setup correct typing
                const joinEntityDao = daoFactory(joinEntity as unknown as Newable<daoEntity>);
                // save with joinEntityDao
                for (const existJent of existJents) {
                    const savedJEnt = await joinEntityDao.save(existJent)
                    if (!savedJEnt) {
                        throw new Error(`Joined entity ${jEntityName} could not be saved`)
                    }
                    updated++;
                }
            }
            return updated;
        }
        return undefined;
    }


    // TODO: move somewhere else ?
    /**
     * 
     * @param result
     * @param count Expected rows in result
     * @throws Error if more than one row returned
     */
    protected expectedRows(result: QueryResult, count: number) {
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
