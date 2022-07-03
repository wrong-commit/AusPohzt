import { daoFactory } from "../dao/daoFactory";
import { parcel } from "../entities/parcel";
import { queued } from "../entities/queued";
import { trackingEvent } from "../entities/trackingEvent";
import { Dto } from "../types/Dto";
import { client as clientType } from "./client";

export { runner }

const parcelDao = daoFactory(parcel);
const queuedDao = daoFactory(queued);
/**
 * Runner created to fetch data from generic client object
 */
class runner<T> {
    /**
     * Client used to determine current event information. The client implementation can 
     */
    client: clientType<T>;

    MAX_QUEUED_RETRIES: number = 3;

    constructor(client: clientType<T>) {
        this.client = client;
        console.log(`runner() with client ${JSON.stringify(this.client, null, 2)}`)
    }

    /**
     * This method will sync new information about a parcel by trackingId. 
     * 
     * TODO: this should really be posting directly to the API instead of using dao.
     * 
     * @param trackingId 
     */
    async sync(trackingId: string, owner: number): Promise<boolean> {
        let disabledParcel = await parcelDao.findByTrackingIdAndDisabled(trackingId, true);
        let trackedParcel = await parcelDao.findByTrackingId(trackingId);
        const queued = await queuedDao.findByTrackingId(trackingId);
        if (disabledParcel) {
            return false;
        }
        if (trackedParcel && trackedParcel.owner !== owner) {
            throw new Error(`Incorrect user tried to sync ${trackingId}`);
        }
        const response = await this.client.sync(trackingId);
        if (!response) {
            console.debug(`Invalid response returned syncing ${trackingId} with client ${this.client}`)
            if (queued && queued.checked++ >= this.MAX_QUEUED_RETRIES) {
                console.debug('Deleted queuedDao')
                queuedDao.delete(queued.id!);
            } else if (queued) {
                console.debug('Incremented queuedDao')
                queuedDao.save(queued);
            }
            return false;
        }

        // convert client response to a parcel
        const parcelDto = this.client.createParcel(response);
        if (!parcelDto) {
            console.warn(`Could not create parcel dto from response for ${trackingId}`);
            return false;
        }

        // merge parcels
        const [newParcel, mergedParcel] = this.mergeParcels(trackedParcel, parcelDto);
        // delete queued if new parcel is being created 
        if (newParcel) {
            if (queued) {
                await queuedDao.delete(queued.id!);
            } else {
                console.warn(`No queued parcel ${trackingId} existed`);
            }
        }

        mergedParcel.owner = owner;

        if (mergedParcel.events.length > 0) {
            const lastEvent = mergedParcel.events[mergedParcel.events.length - 1]
            if (lastEvent?.type === 'delivered') {
                console.debug(`Disabling parcel because last event is delivered, ${lastEvent.externalId}`)
                mergedParcel.disabled = true;
            }
        }

        // save parcel 
        return (await parcelDao.save(mergedParcel)) != undefined;
    }

    /**
     * Merge an existing parcel with a new parcel. 
     * Return true if a new parcel was synced
     * 
     * @param trackedParcel 
     * @param parcelDto 
     * @returns [boolean,parcel]. true if parcel is new
     */
    private mergeParcels(trackedParcel: parcel | undefined, parcelDto: Dto<parcel>): [boolean, parcel] {
        let newSync: boolean = trackedParcel == undefined;
        if (trackedParcel) {
            // merge parcelDto with existing parcel 
            const newEvents = parcelDto.events.filter(newEvent =>
                // only return events that aren't in trackedParcel already
                trackedParcel!.events.find(existingEvent => existingEvent.equals(newEvent)) == undefined
            )
            console.info(`Added ${newEvents.length} new events to ${trackedParcel.trackingId}`);
            trackedParcel.events.push(...newEvents.map(x => new trackingEvent(x)));
        } else {
            console.info(`Synced new parcel ${parcelDto.trackingId}`);
            trackedParcel = new parcel(parcelDto);
            trackedParcel.events.forEach(x => new trackingEvent(x));
        }
        // FIXME: support millisecond accurate date times properly
        trackedParcel.lastSync = Math.floor(Date.now() / 1000);
        trackedParcel.events.filter(x => x.dateTime === -1).forEach(x => x.dateTime = trackedParcel!.lastSync);
        trackedParcel.events.forEach(x => x.dateTime = Math.floor(x.dateTime / 1000));
        trackedParcel.events.sort((a, b) => a.dateTime - b.dateTime);
        return [newSync, trackedParcel];
    }
}
