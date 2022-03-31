import { queued } from "@boganpost/backend/src/entities/queued";
import { api } from "@boganpost/backend/src/services/api";
import { Dto } from "@boganpost/backend/src/types/Dto";

export { getQueued };

async function getQueued(): Promise<Dto<queued>[] | undefined> {
    const client = api.init('http://localhost:3000/');
    let resp = await client.get('/v0/queue').catch(err => {
        console.error(`Error fetching queued`, err);
        return undefined;
    });

    const res = await resp?.json();
    if (!Array.isArray(res)) {
        return undefined;
    }
    return res.map(x => new queued(x).toData())
}