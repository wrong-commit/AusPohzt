import { DOMWindow, JSDOM } from 'jsdom';
import { parcel } from '../../entities/parcel';
import { Dto } from '../../types/Dto';
import { shippit } from '../shippit';
import exampleHtml from './example.shippit';

let jsdom: JSDOM;

let client = shippit.init();
describe("shippit", () => {
    beforeAll(() => {
        client = shippit.init();
        jsdom = new JSDOM(exampleHtml)
    })
    describe("createParcel", () => {
        test("example HTML creates expected parcel", async () => {
            const trackingId = 'ppa2nyz2ynpyi';

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
                            externalId: 'In Transit COURIERS PLEASE',
                            location: 'Brisbane',
                            message: 'In Transit COURIERS PLEASE',
                            type: 'in transit',
                            parcelId: undefined,
                            id: undefined,
                            raw: '',
                        },
                        // {
                        //     dateTime: -1,
                        //     externalId: 'On its way',
                        //     location: JSON.stringify({ lat: 40.8591, lng: -74.0462 }),
                        //     message: 'On its way September 3',
                        //     type: 'in transit',
                        //     parcelId: undefined,
                        //     id: undefined,
                        //     raw: '',
                        // }
                    ]
                }
            );
        })
    })
})