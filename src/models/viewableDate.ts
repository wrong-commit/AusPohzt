export { viewableDate }
/**
 * Output human readable date. Provides consistent styling for all FE Dates.
 * @param input {Date  | Number | number} input object
 */
const viewableDate = (input: Date | Number | number): string => {
    if (input instanceof Date) {
        // convert to format. YYYY-MM-DD HH:MM
        return `${input.getFullYear()}-${input.getMonth() + 1}-${input.getDate()} ${padTime(input.getHours())}:${padTime(input.getMinutes())}`;
    } else if (input instanceof Number || Number.parseInt(input + '') === (input as unknown as number)) {
        // assume Number is epoch in MS.
        return viewableDate(new Date(input as number));
        // } else if (input instanceof String) {
        // how tf do we process a String ??? 
    }
    return '';
}

function padTime(input: number): string {
    return input < 10 ? '0' + input : input + '';
}