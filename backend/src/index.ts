import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
import { auspost } from './clients/auspost';
import { runner } from './clients/runner';
import { api } from './services/api';



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
