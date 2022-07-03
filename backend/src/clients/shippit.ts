import { JSDOM } from "jsdom";
import { parcel } from "../entities/parcel";
import { trackingEvent, trackingEventStatus } from "../entities/trackingEvent";
import { api } from "../services/api";
import { toJSDom } from "../services/html";
import { Dto } from "../types/Dto";
import { client } from "./client";

export { shippit }

type shippitParcelReq = {
    jsdom: JSDOM;
    url: string;
    trackingId: string;
}

class shippit implements client<shippitParcelReq> {
    api: api;
    constructor(api: api) {
        this.api = api;
    }

    static init() {
        return new shippit(api.init(''));
    }

    async sync(trackingId: string): Promise<shippitParcelReq | undefined> {
        console.debug(`Syncing app.shippit info for ${trackingId}`);
        // TODO: create url to request
        let urlOfOrder = '';

        const html = await toJSDom(this.api.get(urlOfOrder, {
            // ensure 200 receieved
            statusCode: 200,
        }));
        if (!html) {
            console.error(`Error syncing shippit data for ${trackingId}, ${urlOfOrder}`);
            return undefined;
        }

        return {
            jsdom: html,
            trackingId,
            url: urlOfOrder,
        };
    }
    createParcel({ jsdom, trackingId, }: shippitParcelReq): Dto<parcel> | undefined {
        console.debug('Creating parcel from shippit ' + trackingId)


        const deliverId = jsdom.window.document.querySelector('.tracking-details-box h1.track-id')?.textContent?.split(':')[1];
        if (!deliverId) { console.debug('Could not find delivery Id'); return }

        const courierId = jsdom.window.document.querySelector('.delivery-progress>.courier>.courier__details .tracking_id')?.textContent?.split(':')[1];
        if (!courierId) { console.log('Could not find courier Id'); return }
        console.error('Courier id =', courierId);

        const deliveryTracks = this.getDeliveryTracks(jsdom.window.document);
        if (!deliveryTracks) { console.debug('Could not find delivery tracks'); return }


        const events: Dto<trackingEvent>[] = [];
        deliveryTracks.forEach(node => {
            events.push(this.parseTrackingEvent(node));
        });

        let parcel: Dto<parcel> = {
            id: undefined,
            trackingId,
            disabled: false,
            nickName: undefined,
            owner: - 1,
            lastSync: -1,
            events: events,
        }

        return parcel;
    }

    getDeliveryTracks(document: Document) {
        // adding 001 because ? 
        const nodes = document.querySelectorAll(`.delivery-track>.row`);
        return Array.from(nodes.values()).filter(x => x.classList.contains('js--label-number-CPBBGRZ11936322001'))
    }

    /**
     * Parse a tracking event from the `.delivery-progress .delivery-track>.tracking-timeline` nodes.
     * @param shipmentEvent node
     * @returns tracking event
     */
    parseTrackingEvent(node: Element): Dto<trackingEvent> {
        return {
            dateTime: this.parseEventDateTime(node.querySelector('.time-date')),
            externalId: this.parseExternalId(node),
            location: this.parseLocation(node),
            // message: (node.querySelector('.status-details>.status-title')?.textContent ?? '').replaceAll('\n|\t', '').replaceAll('  ', '') ?? '<unknown>',
            message: '',
            raw: node.innerHTML,
            type: this.parseType(node),
        }
        throw new Error("Method not implemented.");
    }

    parseExternalId(node: Element): string {
        const titleNode = node.querySelector('.status-details>.status-title')?.cloneNode(true);
        titleNode?.removeChild(titleNode.firstChild!);
        return titleNode?.textContent ?? '<unknown>';
    }

    /**
     * Supported class names to convert
     * .in_transit
     * .ready_for_pickup
     * .despatch_in_progress
     * .order_placed
     * @param node node
     * @returns type
     */
    parseType(node: Element): trackingEventStatus {
        const iconDiv = node.querySelector('.belt>.status-icon');
        if (!iconDiv) return 'pending';

        const classList = iconDiv.classList;
        if (classList.length > 2) {
            console.debug('Not expecting more than 2 classes');
            return 'pending';
        }
        // waiting to be processed
        if (classList.contains('order_placed')) return 'pending';
        // being processed before courier, not technically in transit :) 
        if (classList.contains('despatch_in_progress')) return 'in transit';
        // picked up by courier
        if (classList.contains('in_transit')) return 'in transit';
        // TODO: check if ready for pickup by courier or me ? 
        if (classList.contains('ready_for_pickup')) return 'in transit';

        return 'pending';
    }

    /**
     * Convert formats into numbers:
     * Today    2:44PM AEST
     * Jun 11, 2022 1:20PM AEST
     * 
     * @param node node with text to parse
     * @returns number representing node text
     */
    parseEventDateTime(node: Element | null): number {
        return node ? 0 : 0;
    }

    parseLocation(node: Element): string {
        const locationNode = node.querySelector('.status-details>.location')
        locationNode?.removeChild(locationNode.firstChild!);

        console.error(locationNode)
        return locationNode?.textContent ?? '<unknown>';
    }
} 