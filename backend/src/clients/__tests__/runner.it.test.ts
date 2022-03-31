import { daoFactory } from '../../dao/daoFactory';
import { parcel } from '../../entities/parcel';
import { runner } from '../runner';
import { mockClientFactory } from './mockClient';


const parcelDao = daoFactory(parcel);
describe("runner", () => {
    test("runner does not POST parcel to API if client.createParcel fails", async () => {
        const mockCreateParcel = jest.fn(() => undefined);
        const mockClient = mockClientFactory({
            // sync returns undefined, createParcel not called
            _sync: jest.fn(() => undefined),
            _createParcel: mockCreateParcel,
        });

        const r = new runner(mockClient);
        await r.sync('test', 0);

        expect(mockCreateParcel).not.toBeCalled();
    });

    test.todo("runner throws error if trying to sync to wrong owner")
    test("runner merges new events with existing events", async () => {
        const TRACKING_ID = 'test';
        // save parcel with 1 event
        const savedParcel = (await parcelDao.save(new parcel({
            trackingId: TRACKING_ID,
            events: [
                {
                    dateTime: 0,
                    externalId: '0',
                    location: 'locat.1',
                    message: 'message 1',
                    raw: '',
                    type: 'pending',
                }
            ],
            lastSync: 0,
            disabled: false,
            owner: 0,
        })))!;
        expect(savedParcel).toBeDefined()
        // client returns 1 new trackingEvent
        const mockClient = mockClientFactory({
            // return defined object
            _sync: jest.fn(() => ({})),
            _createParcel: jest.fn(() => {
                const pDto = savedParcel.toData();
                pDto.events.push({
                    dateTime: 1,
                    externalId: '1',
                    location: 'locat.2',
                    message: 'message 2',
                    raw: '',
                    type: 'in transit',
                })
                return pDto;
            }),
        });
        const r = new runner(mockClient);
        await r.sync(TRACKING_ID, 0);

        // expect both events to be saved
        const afterSyncParcel = (await parcelDao.findByTrackingId(TRACKING_ID))!;

        expect(afterSyncParcel).toBeDefined();
        expect(afterSyncParcel.events).toHaveLength(2);
        // TODO: how to mock Date.now() calls ? 
        expect(afterSyncParcel.lastSync).toBeGreaterThan(savedParcel.lastSync)
    })
})
