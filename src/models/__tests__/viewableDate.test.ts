import { viewableDate } from "../viewableDate"

describe("viewableDate()", () => {
    test("Time in ms", () => {
        // test using primative
        expect(viewableDate(786975132000)).toBe('1994-12-9 23:12');
        // test using Number object
        expect(viewableDate(new Number(786975132000))).toBe('1994-12-9 23:12');
    })
    test("Time in Date object", () => {
        // 1994-Dec-9 23:12:12.000
        let date = new Date();
        // months 0 indexed
        date.setFullYear(1994, 11, 9);
        date.setHours(23, 12, 12);
        expect(viewableDate(date)).toBe('1994-12-9 23:12');
    })

    test("Time is 0 padded if required", () => {
        // 1994-Dec-9 23:12:12.000
        let date = new Date();
        // months 0 indexed
        date.setFullYear(1994, 11, 9);
        date.setHours(1, 2, 3);
        expect(viewableDate(date)).toBe('1994-12-9 01:02');
    })
})