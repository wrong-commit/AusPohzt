import { bind, entity } from "../decorator/entityDecorators";
import { join } from "../decorator/joinDecorator";
import { Dto } from "../types/Dto";
import { Without } from "../types/Without";
import { trackingEvent } from "./trackingEvent";

export { parcel, parcelDto };

type parcelDto = Without<Dto<parcel>, 'events'> & { events: Dto<trackingEvent>[] }
/**
 * class object for parcel being tracked.
 * TODO: add inactive/delivered parcels
 */
@entity('parcel')
class parcel {
    /**
     * Unique ID of parcel. 
     */
    @bind
    id?: number;

    /**
     * digitalapi tracking ID.
     */
    @bind
    trackingId: string;

    /**
     * Id of user that owns this package. 
     * 
     * TODO: spec this out. 
     */
    @bind
    owner: number;
    /**
     * Use defined nickname. Can come from digitalapi or user defined.
     */
    @bind
    nickName?: string;

    /**
     * Last time parcel synced, unix Epoch.
     */
    @bind
    lastSync: number;

    /**
     */
    @join('trackingEvent', { joinColumnName: 'parcelId', association: 'multiple' })
    events: trackingEvent[];

    constructor(data: Dto<parcel>) {
        this.id = data.id;
        this.trackingId = data.trackingId;
        this.owner = data.owner;

        this.nickName = data.nickName;
        this.events = data.events.map(e => new trackingEvent(e));
        this.lastSync = data.lastSync;
    }

    toData(): Dto<parcel> {
        return {
            id: this.id,
            owner: this.owner,
            trackingId: this.trackingId,
            nickName: this.nickName,
            lastSync: this.lastSync,
            events: this.events.map(x => x.toData()),
        }
    }
}
