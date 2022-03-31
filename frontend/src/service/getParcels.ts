import { parcel } from "@boganpost/backend/src/entities/parcel";
import { Dto } from "@boganpost/backend/src/types/Dto";
import { api } from '@boganpost/backend/src/services/api';

export { getParcels }

async function getParcels(): Promise<Dto<parcel>[] | undefined> {
    const client = api.init('http://localhost:3000/');
    let resp = await client.get('/v0/parcel').catch(err => {
        console.error(`Error fetching parcels`, err);
        return undefined;
    });

    const res = await resp?.json();
    if (!Array.isArray(res)) {
        return undefined;
    }
    return res.map(x => new parcel(x).toData())
}