import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
import { auspost } from './clients/auspost';
import { runner } from './clients/runner';
import { parcel } from './entities/parcel';
import { queued } from './entities/queued';
import { api } from './services/api';
import { auspostApi } from './services/auspostApi';
import { Dto } from './types/Dto';

export { main }

const runnerInterval = process.env.RUNNER_INTERVAL_MS ?? 60000;
const syncInterval = process.env.SYNC_INTERVAL_MS ?? 600000;


function syncTrackingId(id: string, owner: number): Promise<boolean> {
    const runn = new runner(new auspost(auspostApi.init()))
    return runn.sync(id, owner);
}


// get trackingIds from API 
async function startQueuedIds(client: api): Promise<string[]> {

    const response = await client.get('/v0/queue');

    const queuedParcels = await (response.json() as Promise<Dto<queued>[]>);

    for (const x of queuedParcels) {
        const synced = await syncTrackingId(x.trackingId, x.owner);
        console.log(`Tracking Id ${x.trackingId} synced ${synced}`);
        // TODO: increment hashmap of trackingIds that counts sync failures. disable parcel at 3rd retry
    }

    return queuedParcels.map(x => x.trackingId);
}

async function main() {
    // crappy, api class enforces auspost headers on all requests
    const client = api.init(`http://localhost:${process.env.PORT}`);

    await startQueuedIds(client);
    // iterate over other parcels, check when last synced

    const resp = await client.get('/v0/parcel',{
        params:{
            'disabled':'false',
        }
    });

    const parcels = await (resp.json() as Promise<Dto<parcel>[]>);

    for (const p of parcels) {
        const currentTime = Math.floor(Date.now() / 1000);
        // delta in seconds
        const delta: number = (currentTime - p.lastSync);
        console.log(`${currentTime} - ${p.lastSync} = ${delta}`);
        if (delta * 1000 >= syncInterval) {
            const didSync = await syncTrackingId(p.trackingId, p.owner);
            console.log(`Parcel ${p.trackingId} synced ${didSync}`);
        } else {
            console.info(`Not syncing ${p.trackingId} because only ${delta} seconds has ellapsed of ${syncInterval/1000}.`)
        }
    }
}

main();
