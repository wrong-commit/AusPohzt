import { parcel } from "@boganpost/backend/src/entities/parcel";
import { Dto } from "@boganpost/backend/src/types/Dto";

export { getParcels }

async function getParcels(): Promise<Dto<parcel>[] | undefined> {
    const request = new Request('http://localhost:3000/v0/parcel');

    return fetch(request, {
        method: 'GET',
    }).then(res => {
        if (!res.ok) {
            throw new Error('API failed getting parcels');
        }
        return res.json();
    }).then(res => {
        if (Array.isArray(res)) {
            return res.map(x => new parcel(x).toData())
        }
        console.warn(`Invalid response returned`);
        return undefined;
    }).catch(e => {
        console.error(`Error fetching parcels`, e);
        return undefined;
    })
}