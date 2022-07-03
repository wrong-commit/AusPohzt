import { QueryResult, QueryResultRow } from "pg";
import { pool } from "../database/database";
import { dao } from "../decorator/daoDecorators";
import { getEntity, getEntityName, getFields } from "../decorator/entityDecorators";
import { getJoinData, joinData } from "../decorator/joinDecorator";
import { JoinQueryResult, pirate } from "../mapping/pirate";
import { Newable } from "../types/Newable";

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
    joinDatas?: joinData[]

    constructor(entity: Newable<T>) {
        this.entity = entity;
        this.entityName = getEntityName(this.entity);
        this.joinDatas = getJoinData(this.entity);
    }

    async findAll(): Promise<T[] | undefined> {
        try {
            // TODO: support JOIN queries ? 
            const result = await pool.query(`SELECT * FROM ${this.entityName}`);
            const pirates = [];
            for (const row of result.rows) {
                const rowJoinData: JoinQueryResult[] = await this.join(row)
                pirates.push(new pirate<T>(row, result.fields, rowJoinData));
            }
            return pirates.map(sailor => sailor.map(this.entity));
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
            const rowJoinData: JoinQueryResult[] = await this.join(result.rows[0])
            return new pirate<T>(result.rows[0], result.fields, rowJoinData).map(this.entity);
        } catch (e) {
            console.error(`Could not find ${this.entityName} with id ${id}`, e);
            return undefined;
        }
    }
    // FIXME: support merging
    async save(newObj: T): Promise<T | undefined> {
        const fields = getFields(this.entity).filter(x => x !== 'id');
        try {
            // merge existing objects
            if (newObj.id) {
                return this.merge(newObj);
            }
            // otherwise save new
            const result = await pool.query(`INSERT INTO ${this.entityName} (${fields.join(', ')}) ` +
                `VALUES (${fields.map((_, i) => '$' + (i + 1))}) RETURNING id`,
                fields.map(field =>
                    //@ts-expect-error 
                    newObj[field]
                )
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

    async delete(id: any): Promise<boolean> {
        try {
            if (this.joinDatas) {
                console.trace(`Deletinig joined entities for ${this.entityName}`);
                let deleted = 0;
                for (const [_, jEntityName, __, joinColumn] of this.joinDatas) {
                    const deleteResult = await pool.query(`DELETE FROM ${jEntityName} WHERE ${joinColumn} = $1`,
                        [id]);
                    // this.expectedRows(deleteResult, 1);
                    deleted++;
                }
            }
            const result = await pool.query(`DELETE FROM ${this.entityName} WHERE id = $1`, [id]);
            this.expectedRows(result, 1);
            return true;
        } catch (e) {
            console.error(`Could not delete ${this.entityName} with id ${id}`, e);
            return false;
        }
    }

    // TODO: use new baseDao(existJent).save ? 
    protected async saveJoins(existObj: T): Promise<number | undefined> {
        if (this.joinDatas) {
            console.trace(`Saving joined entities for ${this.entityName}`);
            let updated = 0;
            for (const [field, jEntityName, assoc, joinColumn] of this.joinDatas) {
                const joinEntity = getEntity(jEntityName);

                let existJents: Array<any> = [];

                if (assoc === 'single') {
                    //@ts-expect-error
                    const existJent = existObj[field];
                    existJent.push(existJent)
                } else {
                    //@ts-expect-error
                    existJents = existObj[field];
                }

                existJents.forEach(j => j[joinColumn] = existObj.id)

                const fields = getFields(joinEntity).filter(x => x !== 'id');

                // create `field1=$2, field2=$3` string
                let setValues = fields.map((x, i) => {
                    return `${x} = $${i + 2}`
                })

                for (const existJent of existJents) {
                    let result;
                    if (!existJent.id) {
                        // TODO: definitely leverage baseDao
                        result = await pool.query(`INSERT INTO ${jEntityName} (${fields.join(', ')}) ` +
                            `VALUES (${fields.map((_, i) => '$' + (i + 1))}) RETURNING id`,
                            fields.map(field =>
                                existJent[field]
                            )
                        );
                        this.expectedRows(result, 1);
                        existJent.id = result.rows[0]['id'];
                    } else {
                        result = await pool.query(`UPDATE ${jEntityName} SET ${setValues.join(',')} WHERE id =$1`,
                            [
                                existJent.id,
                                ...fields.map(field =>
                                    existJent[field]
                                )
                            ]
                        );
                    }
                    this.expectedRows(result, 1);
                    updated++;
                }
            }
            return updated;
        }
        return undefined;
    }

    protected async merge(existObj: T): Promise<T | undefined> {
        const fields = getFields(this.entity).filter(x => x !== 'id');
        try {
            // create `field1=$2, field2=$3` string
            let setValues = fields.map((x, i) => {
                return `${x} = $${i + 2}`
            })
            // where id=$1
            const result = await pool.query(`UPDATE ${this.entityName} SET ${setValues.join(',')} WHERE id =$1`,
                [
                    existObj.id,
                    ...fields.map(field =>
                        //@ts-expect-error 
                        existObj[field]
                    )
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
                const joinResult = await pool.query(`SELECT * FROM ${jEntityName} WHERE ${joinColumn} = $1`,
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
