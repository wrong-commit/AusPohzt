import { queued } from "@boganpost/backend/src/entities/queued";
import { Dto } from "@boganpost/backend/src/types/Dto";

export { getQueued };

async function getQueued(): Promise<Dto<queued>[] | undefined> {
    const request = new Request('http://localhost:3000/v0/queue');

    return fetch(request, {
        method: 'GET',
    }).then(res => {
        if (!res.ok) {
            throw new Error('API failed getting Queued');
        }
        return res.json();
    }).then(res => {
        if (Array.isArray(res)) {
            return res.map(x => new queued(x).toData())
        }
        console.warn(`Invalid response returned`);
        return undefined;
    }).catch(e => {
        console.error(`Error fetching Queued`, e);
        return undefined;
    })
}