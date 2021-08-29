export { entity, getEntityName, getEntityPrototype as getEntity, bind, getFields }


/**
 * Type for returning entity prototype by name
 */
interface Constructor {
    new(...args: any[]): object;
}

/**
 * Stores a Class type, and the value of the Store Name. 
 */
const entityNameMap = new Map<object, string>();
const fieldsMap = new Map<object, string[]>();

// 
/**
 * for each `target` (Class object), add to a Set of `keys` (Class property name)
 * @param target    The class, used as the Map Key
 * @param key       The Store Name of the class object. 
 */
const entity = (name: string) => {
    return (target: Function) => {
        let entityNameProperty: string | undefined = entityNameMap.get(target.prototype);

        // add entry if doesn't exist. should this throw an error if it already exists ? 
        if (!entityNameProperty) {
            entityNameMap.set(target.prototype, name);
        }
    }
}

/**
 * Usage: 
 * \@entity('asdf')
 * class Test { 
 *      \@bind()
 *      test: string;
 * }
 * @param target 
 * @param field 
 */
const bind = (target: object, field: string) => {
    console.debug(`Target = ${target} / Key = ${field}`);
    // get id property, if exists
    let fields: string[] | undefined = fieldsMap.get(target);

    // add entry if doesn't exist. should this throw an error if it already exists ? 
    if (!fields) {
        fieldsMap.set(target, [field]);
    } else {
        fieldsMap.set(target, [...fields, field])
    }
}

/**
 * @param target    Class or class Instance to get name for
 * @returns entity name
 * @throws Error if target is not an entity
 */
const getEntityName = (target: object): string => {
    // check if user has passed prototype
    let entityNameVal: string | undefined = entityNameMap.get(target);
    if (entityNameVal) return entityNameVal;
    //@ts-expect-error
    let proto = target.prototype ?? target.__proto__;
    console.debug(`Getting Entity Name of target.prototype = ${proto}`);
    entityNameVal = entityNameMap.get(proto);
    if (!entityNameVal) throw new Error(`${proto} does not have an Entity Name value`);
    return entityNameVal;
}

/**
 * Get entity prototype by name.
 * 
 * @param entityName 
 * @returns 
 * @throws Error if entityName does not exist for any entity
 */
const getEntityPrototype = <K extends { constructor: Constructor }>(entityName: string): K => {
    const entityPrototype = Array.from(entityNameMap.entries()).find((pair => pair['1'] === entityName));
    if (!entityPrototype) throw new Error(`No entity prototype found for ${entityName}`);
    return entityPrototype[0] as K;
}

/**
 * Get fields for an entity by class declaration. Usage:
 * \@entity()
 * class Test {} 
 * const fields:string[] = getFields(Test) OR getFields(new Test()); 
 * 
 * @param target    Class or class instance to get entity name for.
 * @returns fields
 */
const getFields = (target: object): string[] => {
    // check if user has passed prototype
    let fields: string[] | undefined = fieldsMap.get(target);
    if (fields) return fields;
    //@ts-expect-error
    let proto = target.prototype ?? target.__proto__;
    console.debug(`Getting Fields of target = ${proto}`);
    fields = fieldsMap.get(proto);
    if (fields == undefined) throw new Error(`${proto} is not an entity`);
    return fields;
}

