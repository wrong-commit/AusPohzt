import bent from "bent";
import { JSDOM } from "jsdom";


export {
    toJSDom
}
function toJSDom(input: Promise<bent.NodeResponse>): Promise<JSDOM | undefined> {
    return input.then(resp => {
        console.info(`Response returned`);
        console.log(`${resp.statusCode} - ${resp.statusMessage}`)
        return resp.text();
    }).then(text => {
        if (text.length === 0) throw new Error('Response returned 0 length text'); // how ? 
        return new JSDOM(text);
    }).catch(err => {
        console.error(`Cannot convert input text to JSDOM`, err);
        return undefined;
    });;
} 