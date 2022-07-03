export { entity, getEntityName, bind, getFields }
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
 * @entity('asdf')
 * class Test { 
 *      @bind()
 *      test: string;
 * }
 * @param target 
 * @param field 
 */
const bind = (target: object, field: string) => {
    console.log(`Target = ${target} / Key = ${field}`);
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
 */
const getEntityName = (target: object): string => {
    //@ts-expect-error
    let proto = target.prototype ?? target.__proto__;
    // let proto = target.prototype;
    console.log(`Getting Entity Name of target.prototype = ${proto}`);
    let entityNameVal: string | undefined = entityNameMap.get(
        proto
    );
    // if (!entityNameVal) {
    //     //@ts-expect-error
    //     proto = target.__proto__;
    //     console.log(`Trying to get Entity Name of target.__proto__ = ${proto}`);
    //     entityNameVal = entityNameMap.get(
    //         proto
    //     );
    // }
    // //@ts-expect-error
    if (!entityNameVal) throw new Error(`${proto} does not have an Entity Name value`);
    return entityNameVal;
}

/**
 * Get fields for an entity. Usage:
 * class Test {} 
 * const fields:string[] = getFields(Test) OR getFields(new Test()); 
 * @param target    Class or class instance to get entity name for.
 * @returns fields
 */
const getFields = (target: object): string[] => {
    //@ts-expect-error
    let proto = target.prototype ?? target.__proto__;
    console.log(`Getting Fields of target = ${proto}`);
    let fields: string[] | undefined = fieldsMap.get(
        proto
    );
    if (fields == undefined) throw new Error(`${proto} is not an entity`);
    return fields;
}

