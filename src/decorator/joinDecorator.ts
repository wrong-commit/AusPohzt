import { getEntityName } from "./entityDecorators";

export { join, getJoinData, joinData };

type association = 'single' | 'multiple';
type joinData = [
    field: string,
    entityName: string,
    /**
     * single indicates this a One to One or Many To One association
     * multiple indicates this is One To Many association (Many To Many not supported)
     */
    assoc: 'single' | 'multiple',
]

let entityJoinDatasMap = new Map<object, joinData[]>();

/**
 * Declare an entity field to be joined to another entity
 * 
 * @param targetEntity target entity to join against
 * @param association Override association somehow ?
 * @param target The class of field
 * @param key Field decorator used on
 */
const join = (targetEntity: string, association?: association) => {
    // propertyDescriptor not used because I don't want to setup get/set accessors for every join field
    // see: https://github.com/microsoft/TypeScript/issues/19528#issuecomment-339945044
    return function (target: object, field: string) {
        let proto = target.constructor.prototype;
        console.debug(`Target = ${proto} / Field = ${field}, JoinEntity = ${targetEntity}`);
        // get id property, if exists
        let joinFields = entityJoinDatasMap.get(proto);

        // create new field array if not created for entity, if exists add to join array 
        const jd: joinData = [field, targetEntity, association ?? 'single'];
        if (!joinFields) {
            entityJoinDatasMap.set(proto, [jd]);
        } else {
            entityJoinDatasMap.set(proto, [...joinFields, jd]);
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
