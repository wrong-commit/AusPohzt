import { daoFactory } from '../../dao/daoFactory';
import { parcel, parcelDto } from '../../entities/parcel';
import { trackingEvent } from '../../entities/trackingEvent';
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

            const events = example.articles[0]!.details[0]!.events!.reverse();

            expect(parcel).toEqual<parcelDto>(
                {
                    id: undefined,
                    trackingId,
                    lastSync: -1,
                    owner: -1,
                    // TODO: figure out which endpoint/property this is stored on - is it user specific ? 
                    nickName: undefined,
                    events: [
                        {
                            id: undefined,
                            parcelId: undefined,
                            dateTime: events[0]!.dateTime,
                            location: events[0]!.location ?? '',
                            message: events[0]!.description,
                            raw: JSON.stringify(events[0]),
                            type: 'pending',
                        },
                        {
                            id: undefined,
                            parcelId: undefined,
                            dateTime: events[1]!.dateTime,
                            location: events[1]!.location ?? '',
                            message: events[1]!.description,
                            raw: JSON.stringify(events[1]),
                            type: 'in transit',
                        },
                        {
                            id: undefined,
                            parcelId: undefined,
                            dateTime: events[2]!.dateTime,
                            location: events[2]!.location ?? '',
                            message: events[2]!.description,
                            raw: JSON.stringify(events[2]),
                            type: 'delivered',
                        },
                    ],
                }
            )
        })
    })
    describe("parseDetail()", () => {
        test("Delivered", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "Delivered",
                "location": "PINE GAP",
                "eventCode": "DD-ER13",
                "wcid": "XXXX"
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: 'PINE GAP',
                    message: 'Delivered',
                    type: 'delivered',
                }))
        })
        test("Failed Delivery", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "Unable to be left in a safe place - Location not suitable",
                "location": "PINE GAP",
                "eventCode": "DD-ER8",
                "wcid": "XXXX"
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: 'PINE GAP',
                    message: 'Unable to be left in a safe place - Location not suitable',
                    type: 'failed',
                }))
        })
        test("Awaiting Collection", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "Awaiting collection at PINE GAP",
                "location": "PINE GAP",
                "eventCode": "DD-ER4",
                "wcid": "XXXX"
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: 'PINE GAP',
                    message: 'Awaiting collection at PINE GAP',
                    type: 'awaiting collection',
                }))
        })
        test("Information Received by Australia Post", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "Shipping information received by Australia Post",
                "location": null,
                "eventCode": "ADMIN-ER39",
                "wcid": "XXXX"
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: '',
                    message: 'Shipping information received by Australia Post',
                    type: 'pending',
                }))
        })
        test("Ready for processing", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "Received and ready for processing",
                "location": null,
                "eventCode": "AFC-ER64",
                "wcid": ""
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: '',
                    message: 'Received and ready for processing',
                    type: 'pending',
                }))
        })
        test("Processed at Facility", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "Item processed at facility",
                "location": "PINE GAP",
                "eventCode": "NSS-ER42",
                "wcid": "XXXX"
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: 'PINE GAP',
                    message: 'Item processed at facility',
                    type: 'in transit',
                }))
        })
        test("In Transit", () => {
            expect(client.parseTrackingEvent({
                "dateTime": 1630104542000,
                "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                "description": "In transit to next facility in PINE GAP",
                "location": null,
                "eventCode": "NSS-ER01",
                "wcid": null
            })).toEqual(expect.objectContaining(
                {
                    id: undefined,
                    dateTime: 1630104542000,
                    location: '',
                    message: 'In transit to next facility in PINE GAP',
                    type: 'in transit',
                }))
        })
    })
})