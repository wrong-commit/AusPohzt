import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
import { auspost } from './clients/auspost';
import { runner } from './clients/runner';
import { queued } from './entities/queued';
import { api } from './services/api';
import { Dto } from './types/Dto';



async function syncTrackingIds(id: string, owner: number) {
    const runn = new runner(new auspost(api.init(process.env.DIGITAL_API)))
    const synced = await runn.sync(id, owner);
    console.log(`Tracking Id ${id} synced ${synced}`);
}


// get trackingIds from API 
async function startQueuedIds() {
    // crappy, api class enforces auspost headers on all requests
    const client = api.init(`http://localhost:${process.env.PORT}`);

    const response = await client.get('/v0/queue');

    const queuedParcels = await (response.json() as Promise<Dto<queued>[]>);

    for (const x of queuedParcels) {
        syncTrackingIds(x.trackingId, x.owner);
    }

}

startQueuedIds();