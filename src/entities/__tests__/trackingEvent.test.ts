import { trackingEvent } from "../trackingEvent"

describe("trackingEvent", () => {
    describe("equaltiy checks", () => {
        const te = new trackingEvent({
            dateTime: 16000,
            externalId: 'extId',
            location: 'PINE GAP',
            message: 'message',
            raw: '{}',
            type: 'pending',
            id: 1,
            parcelId: 2,
        });
        test("undefined returns false", () =>
            expect(te.equals(undefined)).toBeFalsy()
        )
        test("id different returns true", () =>
            expect(te.equals({
                ...te.toData(),
                id: 10
            })).toBeTruthy()
        );
        test("parcelId different returns true", () =>
            expect(te.equals({
                ...te.toData(),
                parcelId: 10
            })).toBeTruthy()
        );
        test("raw different returns true", () =>
            expect(te.equals({
                ...te.toData(),
                raw: 'test'
            })).toBeTruthy()
        );
        test("non entity properties different returns true", () => {
            expect(te.equals({
                ...te.toData(),
                externalId: 'test',
            })).toBeFalsy()
            expect(te.equals({
                ...te.toData(),
                dateTime: -1,
            })).toBeFalsy()
            expect(te.equals({
                ...te.toData(),
                location: 'test',
            })).toBeFalsy()
            expect(te.equals({
                ...te.toData(),
                message: 'test',
            })).toBeFalsy()
            expect(te.equals({
                ...te.toData(),
                type: 'delivered',
            })).toBeFalsy()
        })
    })
})