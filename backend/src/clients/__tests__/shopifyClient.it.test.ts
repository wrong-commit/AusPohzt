import { DOMWindow, JSDOM } from 'jsdom';
import { parcel } from '../../entities/parcel';
import { Dto } from '../../types/Dto';
import { shopify } from '../shopify';
import exampleHtml from './example.shopify';

let jsdom: JSDOM;

let client = shopify.init(false);
describe("shopify", () => {
    beforeAll(() => {
        client = shopify.init(false);
        jsdom = new JSDOM(exampleHtml)
    })
    describe("createParcel", () => {
        test("example HTML creates expected parcel", async () => {
            // USPS was the tracking ID for this example
            const shopifyShopId = '57412845776';
            const shopfiyOrderId = '3d1a0a91a959db21bcfb37bf337de92d';
            const trackingId = shopifyShopId + '/' + shopfiyOrderId;

            const parcel = client.createParcel({ jsdom, trackingId, url: 'https://test.com/' + trackingId })
            parcel?.events.forEach(x => x.raw = '');

            expect(parcel).toEqual<Dto<parcel>>(
                {
                    id: undefined,
                    trackingId,
                    lastSync: -1,
                    owner: -1,
                    disabled: false,
                    nickName: undefined,
                    events: [
                        {
                            dateTime: -1,
                            externalId: 'Confirmed',
                            location: JSON.stringify({ lat: 40.8591, lng: -74.0462 }),
                            message: 'Confirmed August 27',
                            type: 'pending',
                            parcelId: undefined,
                            id: undefined,
                            raw: '',
                        },
                        {
                            dateTime: -1,
                            externalId: 'On its way',
                            location: JSON.stringify({ lat: 40.8591, lng: -74.0462 }),
                            message: 'On its way September 3',
                            type: 'in transit',
                            parcelId: undefined,
                            id: undefined,
                            raw: '',
                        }, {
                            dateTime: -1,
                            externalId: "Out for delivery",
                            id: undefined,
                            location: JSON.stringify({ lat: 40.8591, lng: -74.0462 }),
                            message: "Out for delivery N/A",
                            parcelId: undefined,
                            raw: "",
                            type: "in transit",
                        }, {
                            dateTime: -1,
                            externalId: "Delivered",
                            id: undefined,
                            location: JSON.stringify({ lat: 40.8591, lng: -74.0462 }),
                            message: "Delivered N/A",
                            parcelId: undefined,
                            raw: "",
                            type: "delivered",
                        },
                    ]
                }
            );
        })
    })
});
