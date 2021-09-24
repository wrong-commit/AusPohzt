import { daoFactory } from "../dao/daoFactory";
import { parcel } from "../entities/parcel";
import { trackingEvent } from "../entities/trackingEvent";
import { client as clientType } from "./client";

export { runner }

const parcelDao = daoFactory(parcel);
/**
 * Runner created to fetch data from generic client object
 */
class runner<T> {
    client: clientType<T>;

    constructor(client: clientType<T>) {
        this.client = client;
        console.log(`runner() with client ${JSON.stringify(this.client, null, 2)}`)
    }

    /**
     * This method will sync new information about a parcel by trackingId. 
     * 
     * Assumes that parcel trackingEvents.raw 
     * 
     * @param trackingId 
     */
    async sync(trackingId: string): Promise<boolean> {
        let trackedParcel = await parcelDao.findByTrackingId(trackingId);

        const response = await this.client.sync(trackingId);
        if (response) {
            // send HTTP request to our api 
            const parcelDto = this.client.createPacel(response);
            if (!parcelDto) {
                console.warn(`Could not create parcel dto from response for ${trackingId}`);
                return false;
            }
            parcelDto.events.forEach(x => x.dateTime = Math.floor(x.dateTime / 1000))
            if (trackedParcel) {
                // merge parcelDto with existing parcel 
                const newEvents = parcelDto.events.filter(newEvent =>
                    // only return events that aren't in trackedParcel already
                    trackedParcel!.events.find(existingEvent => existingEvent.equals(newEvent)) == undefined
                )
                console.info(`Added ${newEvents.length} new events to ${trackingId}`);
                trackedParcel.events.push(...newEvents.map(x => new trackingEvent(x)));
            } else {
                console.info(`Synced new parcel ${trackingId}`);
                trackedParcel = new parcel(parcelDto);
                trackedParcel.events.forEach(x => new trackingEvent(x));
            }
            // FIXME: support millisecond accurate date times properly
            trackedParcel.lastSync = Math.floor(Date.now() / 1000);
            // save parcel 
            return (await parcelDao.save(trackedParcel)) != undefined;
        } else {
            console.debug(`Invalid response returned syncing ${trackingId} with client ${this.client}`)
            return false;
        }
    }
}
