import { bind, entity } from "../decorator/entityDecorators";
import { join } from "../decorator/joinDecorator";
import { Dto } from "../types/Dto";
import { trackingEvent } from "./trackingEvent";

export { parcel };

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
     * Tracking ID.
     */
    @bind
    trackingId: string;

    /**
     * Id of user that owns this package. 
     * TODO: spec this out. 
     */
    @bind
    owner: number;

    /**
     * Use defined nickname.
     */
    @bind
    nickName?: string;

    /**
     * Seconds since unix epoch when last successfully synced event data. 
     */
    @bind
    lastSync: number;

    /**
     * Unordered trackingEvents associated with parcel.
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
