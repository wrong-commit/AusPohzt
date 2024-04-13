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

        describe("Tracking event properties", () => {
            test("externalId", async () => {
                const rawNode = client.getDeliveryTracks(jsdom.window.document).values().next().value;
                expect(rawNode).toBeDefined();
                const externalId = client.parseExternalId(rawNode)
                expect(externalId).toBe('In transit Couriers Please')
            })
            test("location", async () => {
                const rawNode = jsdom.window.document.querySelector('.status-details>.location')
                expect(rawNode).toBeDefined();
                const externalId = client.formatLocationNode(rawNode!)
                expect(externalId).toBe('Brisbane')
            })
            test("eventDateTime today", async () => {
                const rawValue = 'Today    2:44PM AEST';
                const eventDateTime = client.formatEventNode(rawValue)

                expect(eventDateTime.getHours()).toBe(14)
                expect(eventDateTime.getMinutes()).toBe(44)
            })
            test("eventDateTime specific", async () => {
                const rawValue = 'Jun 11, 2022 1:20PM AEST';
                const eventDateTime = client.formatEventNode(rawValue)

                expect(eventDateTime.getHours()).toBe(13)
                expect(eventDateTime.getMinutes()).toBe(20)
                expect(eventDateTime.getDate()).toBe(11)
                // JS dates start counting months from 0, so Jun is 5
                expect(eventDateTime.getMonth()).toBe(5) 
                expect(eventDateTime.getFullYear()).toBe(2022)
            })
            test("type", async () => {
                const rawNode = client.getDeliveryTracks(jsdom.window.document).values().next().value;
                expect(rawNode).toBeDefined();
                const externalId = client.parseExternalId(rawNode)
                expect(externalId).toBe('In transit Couriers Please')
            })
        })

        test("example HTML creates expected parcel", async () => {
            const trackingId = 'ppa2nyz2ynpyi';

            const parcel = client.createParcel({ jsdom, trackingId, url: 'https://test.com/' + trackingId })
            parcel?.events.forEach(x => x.raw = '');
            parcel?.events.filter(x => !Number.isNaN(x.dateTime)).forEach(x => x.dateTime = -1);

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
                            externalId: 'In transit Couriers Please',
                            id: undefined,
                            location: '',
                            message: 'In transit Couriers Please',
                            parcelId: undefined,
                            raw: '',
                            type: 'in transit',
                        },
                        {
                            dateTime: -1,
                            externalId: 'In transit Couriers Please',
                            id: undefined,
                            location: 'Brisbane',
                            message: 'In transit Couriers Please',
                            parcelId: undefined,
                            raw: '',
                            type: 'in transit',
                        },
                        {
                            dateTime: -1,
                            externalId: 'Booked for delivery Weaver Green Australia',
                            id: undefined,
                            location: 'Noosaville, QLD',
                            message: 'Booked for delivery Weaver Green Australia',
                            parcelId: undefined,
                            raw: '',
                            type: 'in transit',
                        },
                        {
                            dateTime: -1,
                            externalId: 'Packing Order Weaver Green Australia',
                            id: undefined,
                            location: 'Noosaville, QLD',
                            message: 'Packing Order Weaver Green Australia',
                            parcelId: undefined,
                            raw: '',
                            type: 'in transit',
                        },
                        {
                            dateTime: -1,
                            externalId: 'Order placed Weaver Green Australia',
                            id: undefined,
                            location: 'Noosaville, QLD',
                            message: 'Order placed Weaver Green Australia',
                            parcelId: undefined,
                            raw: '',
                            type: 'pending',
                        },
                    ]
                }
            );
        })
    })
})