import { QueryResult } from "pg";

export { dao }
abstract class dao<T> {

    abstract findAll(): PromiseLike<T[] | undefined>;
    /**
     * Lookup object
     * @param id 
     */
    abstract find(id: any): PromiseLike<T | undefined>;
    /**
     * Create new or update existing of type {T}
     * FIXME: support mergin
     * @param value 
     */
    abstract save(value: T): PromiseLike<T | undefined>;

    /**
     * Delete object by Id
     * @param id 
     */
    abstract delete(id: any): PromiseLike<boolean>;

    // TODO: move somewhere else
    /**
     * 
     * @param result
     * @param count Expected rows in result
     * @throws Error if more than one row returned
     */
    expectedRows(result: QueryResult, count: number) {
        if (result.rowCount !== count) {
            const msg = result.rowCount === 0 ? 'No rows returned' : `More than ${count} row${count === 1 ? '' : 's'} returned`;
            throw new Error(msg);
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