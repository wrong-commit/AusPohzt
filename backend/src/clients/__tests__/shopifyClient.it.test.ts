import { parcel } from '../../entities/parcel';
import { trackingEvent } from '../../entities/trackingEvent';
import { Dto } from '../../types/Dto';
import exampleHtml from './example.shopify';

import { DOMWindow, JSDOM } from 'jsdom';
let window: DOMWindow;


function getLocation(document: Document): any {
    const locationIframe = document.querySelector('iframe.map__iframe[data-google-maps][data-google-maps-marker]');
    const markerjson = locationIframe?.getAttribute('data-google-maps-marker');
    expect(markerjson).toBeDefined();
    const marker = JSON.parse(markerjson!) as [];
    expect(marker).toBeDefined();
    expect(Array.isArray(marker)).toBeTruthy();
    let currentMarker: any = undefined;
    for (let i = 0; i < marker.length && !currentMarker; ++i) {
        if (Object.getOwnPropertyNames(marker[i]).includes('type') &&
            //@ts-expect-error
            marker[i]!.type === 'current'
        ) {
            currentMarker = marker[i];
        }
    }

    expect(Object.getOwnPropertyNames(currentMarker)).toContain('position');
    const position = currentMarker!.position;
    expect(position).toBeDefined();
    console.log(JSON.stringify(position, null, 2))
    return position;
}

function getMessage(document: Document): any {
    //Current step
    return document.querySelector('li.os-timeline-step.os-timeline-step--selected.os-timeline-step--current')?.textContent;
}

describe("shopify", () => {
    beforeAll(() => {
        window = new JSDOM(exampleHtml).window;
    })
    describe("createParcel", () => {
        test("example HTML creates expected parcel", async () => {
            const trackingId = ''
            const shopifyShopId = '57412845776';
            const shopfiyOrderId = '3d1a0a91a959db21bcfb37bf337de92d';

            const location = getLocation(window.document);
            const rawMessage = getMessage(window.document) as string;
            const message = rawMessage.trim().split('Current step:')[1]?.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
            expect(message).toBe('On its way September 3');
            /*
            let eventData: Dto<trackingEvent> = {
                // this should be the time the event was first encountered.
                dateTime: 0,
                externalId: '3d1a0a91a959db21bcfb37bf337de92d',
                location: JSON.stringify(location),
                message: message,

            }
                const parcelData: Dto<parcel> = {
                    id: undefined,
                    trackingId,
                    lastSync: -1,
                    nickName: undefined,
                    owner: -1,
                    disabled: false,
                    events: [

                    ],
                };    
            */

        })
    })
});
