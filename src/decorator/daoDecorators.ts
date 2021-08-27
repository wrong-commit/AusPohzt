import { dao, daoEntity } from "../dao/dao";
import { Newable } from "../types/Newable";
import { getEntityName } from "./entityDecorators";

/**
 * Key = entity it processes, Value = explicit dao class constructor
 */
const entityToDaoMap = new Map<string, dao<daoEntity>>();

const daoDecorator = (entityName: string) => {
    console.log(entityName);
    return (target: Function) => {
        let entityDao: object | undefined = entityToDaoMap.get(entityName);

        // add entry if doesn't exist. should this throw an error if it already exists ? 
        if (entityDao) {
            throw new Error('Entity cannot be assigned to multiple Daos');
        }
        entityToDaoMap.set(entityName, target.prototype.constructor);
    }
}

function getDao<T extends daoEntity>(entity: object | string): Newable<dao<T>> | undefined {
    let entityName;
    if (typeof entity === 'string') {
        entityName = entity;
    } else {
        entityName = getEntityName(entity);
    }

    return entityToDaoMap.get(entityName) as Newable<dao<T>> | undefined;
}
export { daoDecorator as dao, getDao }
