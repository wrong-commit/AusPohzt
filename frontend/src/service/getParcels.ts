import { parcel } from "@boganpost/backend/src/entities/parcel";
import { api } from "@boganpost/backend/src/services/api";
import { Dto } from "@boganpost/backend/src/types/Dto";

export { getParcels };

async function getParcels(client: api, disabled: boolean= false): Promise<Dto<parcel>[] | undefined> {
    if(disabled) { 
        return;
    }
    let resp = await await client.get('/v0/parcel', {
        params: {
            // 'disabled': undefined,
        },
    }).catch(err => {
        console.error(`Error fetching parcels`, err);
        return undefined;
    });

    const res = await resp?.json();
    if (!Array.isArray(res)) {
        return undefined;
    }
    return res.map(x => new parcel(x).toData())
}