import { JSDOM } from "jsdom";
import { parcel } from "../entities/parcel";
import { trackingEvent, trackingEventStatus } from "../entities/trackingEvent";
import { api } from "../services/api";
import { Dto } from "../types/Dto";
import { googleMapsMarker, timelineStep } from "../types/shopifyapi/types";
import { client } from "./client";

export { shopify };

type shopifyParcelReq = {
    jsdom: JSDOM;
    url: string;
    trackingId: string;
}

class shopify implements client<shopifyParcelReq> {
    api: api;
    filterFutureEvents: boolean = true;
    constructor(api: api, filterFutureEvents?: boolean) {
        this.api = api;
        if (filterFutureEvents != undefined) this.filterFutureEvents = filterFutureEvents;
    }

    static init(filterFutureEvents?: boolean) {
        return new shopify(api.init(''), filterFutureEvents);
    }

    /**
     * Tracking ID must be sent as `storedId/orderId`;
     * url of order should be page that shows tracking information to the user.
     * 
     * @param trackingId 
     * @returns 
     */
    async sync(trackingId: string, urlOfOrder?: string): Promise<shopifyParcelReq | undefined> {
        if (!urlOfOrder) throw new Error('URL of tracking page must be provided');
        const [shopId, orderId] = trackingId.split('/');
        console.debug(`Syncing shopify info for shop ${shopId} order ${orderId}`);
        if (!shopId || !orderId || !orderId.length || !shopId.length) {
            throw new Error('Invalid Shopify trackingId <' + trackingId + '>, must contain 1 slash');
        }

        // TODO: detect if request occurred authenticated after GET, handle gracefully
        // load resource
        const shopifyHtml = await this.api.get(urlOfOrder, {
            // ensure 200 receieved
            statusCode: 200,
        }).then(resp => {
            console.info(`Response returned`);
            console.log(`${resp.statusCode} - ${resp.statusMessage}`)
            return resp.text();
        }).then(text => {
            if (text.length === 0) throw new Error('Response returned 0 length text'); // how ? 
            return new JSDOM(text);
        }).catch(err => {
            console.error(`Error syncing shopify data for ${trackingId}, ${urlOfOrder}`, err);
            return undefined;
        });
        return shopifyHtml ? {
            jsdom: shopifyHtml,
            trackingId,
            url: urlOfOrder,
        } : undefined;
    }

    /**
     * Create a parcel from shopifyParcelReq. 
     * Parcel information request may occur unauthenticated, in which case only 'Confirmed' and 'On Its Way' events are
     * available. 
     * @param param0 
     * @returns 
     * @see parseTrackingEvent
     */
    createParcel({ jsdom, trackingId, url, }: shopifyParcelReq): Dto<parcel> | undefined {
        console.debug('Creating parcel from shopify ' + trackingId)
        const timeline = jsdom.window.document.querySelector('div.step__sections ol.os-timeline');
        if (!timeline) return undefined;

        const markers = this.getMarkers(jsdom.window.document);
        const steps = this.getTimelineSteps(timeline!);
        const activeSteps = this.filterFutureEvents ? this.filterFutureSteps(steps) : steps;

        // hope order is correct
        const events: Dto<trackingEvent>[] = activeSteps.map(e => this.parseTrackingEvent(e, url, markers));

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

    /**
     * Convert timeline step from shopify into trackingEvent. Returned events require a dateTime to be set, meaning
     * event times are accurate to when the sync occured. 
     * @param step 
     * @param url 
     * @param markers 
     * @returns 
     */
    parseTrackingEvent(step: timelineStep, url?: string, markers?: googleMapsMarker[]): Dto<trackingEvent> {
        if (!url) throw new Error('Undefined url not supported for step');
        if (!step.title) throw new Error('Undefined step title from ' + JSON.stringify(step));
        if (!step.stepNameText) throw new Error('Undefined step name from ' + JSON.stringify(step));
        const currentLocation = markers?.find(x => x.type === 'current');
        const location = JSON.stringify(currentLocation?.position);
        if (!location) throw new Error('Invalid current location from markers ' + JSON.stringify(markers));

        return {
            id: undefined,
            // hope this is consistent enough to filter on
            parcelId: undefined,
            externalId: `${step.title}`,
            dateTime: -1, // set later
            message: this.getMessage(step),
            location,
            type: this.getType(step),
            raw: JSON.stringify({
                url: url,
                innerHtml: step.innerHtml,
            }),
        }
    }

    /**
     * Extract shipping location JSON from Shopify HTML
     * @param document 
     * @returns {location|undefined} current package location
     */
    private getMarkers(document: Document): googleMapsMarker[] | undefined {
        const locationIframe = document.querySelector('iframe.map__iframe[data-google-maps][data-google-maps-marker]');
        const markerjson = locationIframe?.getAttribute('data-google-maps-marker');
        const markers = JSON.parse(markerjson!) as googleMapsMarker[];
        return markers;
    }

    // hopefully return same as getMessage(Document);
    private getMessage(step: timelineStep): string {
        return `${step.title ?? 'Unknown'} ${step.date ?? 'N/A'}`;
    }

    private getTimelineSteps(timeline: Element): timelineStep[] {
        return Array.from(timeline.querySelectorAll('li.os-timeline-step')).map((elem): timelineStep => {
            const current = elem.classList.contains('os-timeline-step--current');
            const selected = elem.classList.contains('os-timeline-step--selected');
            const stepNameText = elem.querySelector('span.visually-hidden')?.textContent
            const title = elem.querySelector('.os-timeline-step__title')?.textContent
            const date = elem.querySelector('.os-timeline-step__date')?.textContent ?? undefined;
            return {
                innerHtml: elem.innerHTML,
                title: title ?? undefined,
                stepNameText: stepNameText ?? undefined,
                date: date ?? undefined,
                selected,
                current,
            }
        });
    }

    /**
     * Filter out steps that haven't happened / not authenticated to see.
     * @param steps
     * @returns 
     */
    private filterFutureSteps(steps: timelineStep[]): timelineStep[] {
        return steps.filter(x => x.selected);
    }

    private getType(step: timelineStep): trackingEvent['type'] {
        switch (step.title) {
            case 'Confirmed': {
                return 'pending';
            }
            case 'On its way': {
                return 'in transit';
            }
            case 'Out for delivery': {
                return 'in transit';
            }
            case 'Delivered': {
                return 'delivered';
            }
            default: {
                throw new Error(`Cannot get type from timelineStep ${JSON.stringify(step)}`);
            }
        }
    }
}
