import { parcel } from "../entities/parcel";
import { trackingEvent, trackingEventStatus } from "../entities/trackingEvent";
import { api } from "../services/api";
import { AWAITING_COLLECTION, DELIVERED_CODE, DELIVERY_FAILED, PENDING, shipmentsResponse, TRANSIT } from "../types/digitalapi/shipmentsgatewayapi/watchlist/shipments/article";
import { Dto } from "../types/Dto";
import { client } from "./client";

export { auspost };

class auspost implements client<shipmentsResponse> {
    api: api;
    constructor(api: api) {
        this.api = api;
    }

    static init(host?: string): auspost {
        return new auspost(new api(host ?? process.env.DIGITAL_API));
    }

    async sync(trackingId: string): Promise<shipmentsResponse | undefined> {
        console.trace(`Syncing auspost info for ${trackingId}`);
        const response = await this.api.get(`shipmentsgatewayapi/watchlist/shipments/${trackingId}`,
            {
                headers: {
                    Origin: 'https://auspost.com.au',
                    'accept-encoding': 'gzip, deflate, br',
                    Referer: 'https://auspost.com.au/',
                    Host: 'digitalapi.auspost.com.au',
                    Connection: 'keep-alive',
                    Accept: 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                // ensure 200 received
                statusCode: 200,
            })
            .then(resp => {
                console.info(`Response returned`);
                console.log(`${resp.statusCode} - ${resp.statusMessage}`)
                return resp.json() as Promise<shipmentsResponse>;
            })
            .then(resp => {
                if (resp.status !== 'Success') {
                    console.debug(JSON.stringify(resp))
                    throw new Error(`Response did not return {status: 'Success'}`);
                }
                return resp;
            })
            .catch(err => {
                console.error(`Error syncing auspost data for ${trackingId}`, err);
                return undefined;
            });

        return response as shipmentsResponse | undefined;
    }

    // Q: should this be moved to a method on parcel ? 
    createPacel(external: shipmentsResponse): Dto<parcel> | undefined {
        if (!external.articles[0]) {
            console.error(`No articles exist for ${external.consignmentId}`)
            return undefined;
        }

        const trackingId: string = external.consignmentId;

        const shipmentDetails = external.articles[0].details;
        const shipmentEvents = shipmentDetails[0]?.events;
        if (!shipmentEvents) {
            console.error(`No shipment events exist for ${external.consignmentId}`);
            return undefined;
        }

        const events: Dto<trackingEvent>[] = shipmentEvents.map(e => this.parseTrackingEvent(e)).sort((a, b) => a.dateTime - b.dateTime)

        let parcel: Dto<parcel> = {
            id: undefined,
            trackingId,
            nickName: undefined,
            owner: - 1,
            lastSync: -1,
            events: events,
        }

        return parcel;
    }

    parseTrackingEvent(shipmentEvent: shipmentsResponse['articles'][0]['details'][0]['events'][0]): Dto<trackingEvent> {
        return {
            id: undefined,
            parcelId: undefined,
            externalId: shipmentEvent.wcid,
            dateTime: shipmentEvent.dateTime,
            location: shipmentEvent.location ?? '',
            message: shipmentEvent.description,
            type: this.typeFromEventCode(shipmentEvent.eventCode),
            raw: JSON.stringify(shipmentEvent),
        };
    }

    private typeFromEventCode(code: string): trackingEventStatus {
        if (TRANSIT.includes(code)) return 'in transit';
        switch (code) {
            case DELIVERY_FAILED: return 'failed';
            case PENDING: return 'pending';
            case AWAITING_COLLECTION: return 'awaiting collection'
            case DELIVERED_CODE: return 'delivered'
            default: return 'pending'
        }
    }
}
