import { parcel } from "@boganpost/backend/src/entities/parcel";
import { Dto } from "@boganpost/backend/src/types/Dto";
import { api } from '@boganpost/backend/src/services/api';

export { getParcels }

async function getParcels(): Promise<Dto<parcel>[] | undefined> {
    // const client = jwtApi.initWithToken('http://localhost:3000/', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.95BEPOhEI6NVx-QD3Ssikum3qQuvTRdSBoQr7aAuDHA');
    const client = api.init('http://localhost:3000/');
    let resp = await await client.get('/v0/parcel', {
        headers: {
            'Authorization': 'Bearer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.95BEPOhEI6NVx-QD3Ssikum3qQuvTRdSBoQr7aAuDHA',
        }
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