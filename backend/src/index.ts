import dotenv from 'dotenv';
import { auspost } from './clients/auspost';
import { runner } from './clients/runner';
import { api } from './services/api';
dotenv.config({ path: '.env' })



async function syncTrackingIds(ids: string[]) {
    const runn = new runner(new auspost(api.init(process.env.DIGITAL_API)))
    const results = [];
    for (const id of ids) {
        console.log(id)
        const synced = await runn.sync(id);
        console.log(`Tracking Id ${id} synced ${synced}`);
    }

}

syncTrackingIds([
]);
