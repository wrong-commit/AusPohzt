import { json } from "express";
import { textSpanIntersectsWithPosition } from "typescript";
import { parcel } from "../entities/parcel";
import { api } from "../services/api";
import { shipmentsResponse } from "../types/digitalapi/shipmentsgatewayapi/watchlist/shipments/article";
import { Dto } from "../types/Dto";
import { client } from "./client";

export { auspost }

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
                    'Origin': 'https://auspost.com.au',
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
                console.debug(`Response returned`);
                return resp.json() as Promise<shipmentsResponse>;
            })
            .then(resp => {
                if (resp.status !== 'Success') {
                    console.debug(JSON.stringify(resp))
                    throw new Error(`Response did not return {status: 'Success'}`);
                }
            })
            .catch(err => {
                console.error(`Error syncing auspost data for ${trackingId}`, err);
                return undefined;
            });

        return response as shipmentsResponse | undefined;
    }

    // Q: should this be moved to a method on parcel ? 
    createPacel(external: shipmentsResponse): Dto<parcel> | undefined {
        const trackingId: string = external.consignmentId;

        let parcel: Dto<parcel> = {
            id: undefined,
            trackingId,
            nickName: undefined,
            owner: - 1,
            lastSync: -1,
            events: [],
        }

        return parcel;
    }
}
