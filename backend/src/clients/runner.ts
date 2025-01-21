import { daoFactory } from "../dao/daoFactory";
import { parcel } from "../entities/parcel";
import { queued } from "../entities/queued";
import { trackingEvent } from "../entities/trackingEvent";
import { api } from "../services/api";
import { Dto } from "../types/Dto";
import { client as clientType } from "./client";

export { runner }

/**
 * Runner created to fetch data from generic client object
 */
class runner<T> {
    /**
     * Client used to determine current event information. The client implementation can 
     */
    client: clientType<T>;
    /**
     * API Client used by the runner to update our parcel information
     */
    ourApi: api;

    MAX_QUEUED_RETRIES: number = 3;

    constructor(client: clientType<T>, _api: api) {
        this.client = client;
        this.ourApi = _api;
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
        console.log(`Syncing ${trackingId}...`)
        // Does disabled parcel exist
        let disabledParcel = (await this.ourApi.get(`/v0/parcel?disabled=true`)
            .then(x => x.json())
            //@ts-expect-error
            .then(x => x.map(dto => new parcel(dto as any).toData()))
            .catch(e => {
                console.log("Could not map disabled parcel dto", e)
            }) ?? [])
            //@ts-expect-error
            .filter(x => x.trackingId === trackingId);
        let trackedParcel = await this.ourApi.get(`/v0/parcel/${trackingId}`).catch(() => undefined)
            .then(x => x?.json())
            .then(x => {if(x != undefined) return new parcel(x as any).toData(); return undefined})
            .catch(e => {
                console.log("Could not map parcel dto", e)
            }) ?? undefined;
        let queuedParcels = await this.ourApi.get(`/v0/queue`).catch(() => undefined)
            .then(x => x?.json())
            //@ts-expect-error
            .then(x => x?.map(dto => new queued(dto as any).toData()))
            .catch(e => {
                console.log("Could not map parcel dto", e)
            }) as Dto<queued>[] ?? [];
        let alreadyQueued = queuedParcels.find(x => x.trackingId === trackingId)
        if (disabledParcel.length > 0) {
            console.log(JSON.stringify(disabledParcel))
            console.log('Parcel is disabled');
            return false;
        }
        if (trackedParcel && trackedParcel.owner !== owner) {
            throw new Error(`Incorrect user tried to sync ${trackingId}`);
        }
        const response = await this.client.sync(trackingId);
        if (!response) {
            console.debug(`Invalid response returned syncing ${trackingId} with client ${this.client}`)
            if (alreadyQueued && alreadyQueued.checked++ >= this.MAX_QUEUED_RETRIES) {
                console.debug('Deleting queued parcel: ' + alreadyQueued.id)
                this.ourApi.delete(`/v0/queue/${trackingId}`)
            } else if (alreadyQueued) {
                console.debug('Incremented queuedDao')
                // queuedDao.save(queued);
                this.ourApi.patch(`/v0/queue/${alreadyQueued.id}/increment`)
            }
            return false;
        }

        // convert client response to a parcel
        console.debug('Creating parcel object from HTML response')
        const parcelDto = await this.client.createParcel(response);
        if (!parcelDto) {
            console.warn(`Could not create parcel dto from response for ${trackingId}`);
            return false;
        }

        // merge parcels
        console.debug('Merging parcels with DB objects')
        const [newParcel, mergedParcel] = this.mergeParcels(trackedParcel, parcelDto);

        mergedParcel.owner = owner;

        if (mergedParcel.events.length > 0) {
            const lastEvent = mergedParcel.events[mergedParcel.events.length - 1]
            if (lastEvent?.type === 'delivered') {
                console.debug(`Disabling parcel because last event is delivered, ${lastEvent.externalId}`)
                mergedParcel.disabled = true;
            }
        }

        // save parcel 
        console.debug('Saved and synced parcel, deleting from queue')
        const savedParcel = await this.ourApi.post(`/v0/parcel`, {
            body: mergedParcel,
            statusCode: 200,
        }).catch(err => { 
            console.log("Could not save synced parcel ", err)
            return undefined;
        })

        // delete queued if new parcel is being created 
        if (newParcel) {
            if (alreadyQueued) {
                console.debug('Saved and synced parcel, deleting from queue')
                this.ourApi.delete(`/v0/queue/${trackingId}`)
            } else {
                console.warn(`No queued parcel ${trackingId} existed`);
            }
        }

        return savedParcel != undefined;
    }

    /**
     * Merge an existing parcel with a new parcel. 
     * Return true if a new parcel was synced
     * 
     * @param trackedParcel 
     * @param parcelDto 
     * @returns [boolean,parcel]. true if parcel is new
     */
    private mergeParcels(trackedParcel: Dto<parcel> | undefined, parcelDto: Dto<parcel>): [boolean, Dto<parcel>] {
        let newSync: boolean = trackedParcel == undefined;
        if (trackedParcel) {
            // merge parcelDto with existing parcel 
            const newEvents = parcelDto.events.filter(newEvent =>
                // only return events that aren't in trackedParcel already
                trackedParcel!.events.find(existingEvent => newEvent?.externalId == existingEvent?.externalId) == undefined
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
