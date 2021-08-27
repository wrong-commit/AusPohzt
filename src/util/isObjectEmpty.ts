export { isObjectEmpty }
/**
 * Check if an object is undefined/empty. Useful when using express.json() body parser
 * @param obj 
 * @returns 
 */
const isObjectEmpty = (obj: any) =>
    obj && Object.keys(obj).length === 0 && obj.constructor === Object