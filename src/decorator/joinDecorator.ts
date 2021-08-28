import { getEntityName } from "./entityDecorators";

export { join, getJoinData };

type joinData = [
    field: string,
    entityName: string,
]

let entityJoinDatasMap = new Map<object, joinData[]>();

/**
 * Declare an entity field to be joined to another entity
 * 
 * @param target The class of field
 * @param key Field decorator used on
 * @param targetEntity target entity to join against
 */
const join = (targetEntity: string) => {
    return function (target: object, field: string) {
        let proto = target.constructor.prototype;
        console.debug(`Target = ${proto} / Field = ${field}, JoinEntity = ${targetEntity}`);
        // get id property, if exists
        let joinFields = entityJoinDatasMap.get(proto);

        // create new field array if not created for entity, if exists add to join array 
        if (!joinFields) {
            entityJoinDatasMap.set(proto, [[field, targetEntity]]);
        } else {
            entityJoinDatasMap.set(proto, [
                ...joinFields,
                [field, targetEntity]]);
        };
    }
}

/**
 * Get all joinData for an entity.
 * 
 * @param target 
 * @returns undefined if no joins declared, otherwise joinData
 * @throws Error if target is not an entity 
 */
const getJoinData = (target: object): joinData[] | undefined => {
    console.debug(`Getting join fields for ${target}`);
    //@ts-expect-error
    let proto = target.prototype;
    const entityName = getEntityName(target)
    if (!entityName) throw new Error(`${proto} is not an entity`);

    console.debug(`Getting join data for ${entityName}`);
    return entityJoinDatasMap.get(proto);
}
