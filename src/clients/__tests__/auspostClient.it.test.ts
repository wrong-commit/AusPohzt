import { daoFactory } from '../../dao/daoFactory';
import { parcel } from '../../entities/parcel';
import { shipmentsResponse } from '../../types/digitalapi/shipmentsgatewayapi/watchlist/shipments/article';
import exampleJson from '../../types/digitalapi/shipmentsgatewayapi/watchlist/shipments/example.json';
import { Dto } from '../../types/Dto';
import { auspost } from '../auspost';

const parcelDao = daoFactory(parcel);


// TODO: mock api client
const client = auspost.init();

describe("auspost", () => {

    describe("sync()", () => {
        test("null response returns undefined", async () => {
            // TODO: mock api.get() to throw error to test client.sync() error handling23
            // TODO: assert API not called. how ? ensure createParcel not called
        })
    })

    describe("createParcel", () => {
        test("example JSON creates expected parcel", async () => {
            // TODO: properly type json to ensure test data reflects response type
            const example: shipmentsResponse = exampleJson as unknown as shipmentsResponse;
            // get trackingId from example.json
            const trackingId = example.consignmentId;
            // get createParcel response 
            const parcel = client.createPacel(example);

            expect(parcel).toStrictEqual<Dto<parcel>>(
                {
                    id: undefined,
                    trackingId,
                    lastSync: -1,
                    owner: -1,
                    // TODO: figure out which endpoint/property this is stored on - is it user specific ? 
                    nickName: undefined,
                    // TODO: implement mapping of
                    events: [],
                }
            )
        })
    })
})