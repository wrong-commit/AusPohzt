import { dao } from "../decorator/daoDecorators";

export { dao, };

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
