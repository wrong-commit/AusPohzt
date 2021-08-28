import { Dto } from "../types/Dto";

export { trackingEvent, trackingEventStatus }

type trackingEventStatus =
    /* Something went wrong */
    'failed' |
    /* Not yet sent, status not yet able to be recalculated */
    'pending' |
    /* Out for delivery */
    'in transit' |
    /* Awaiting collection, pickup from location ? */
    'awaiting collection' |
    /* Delivered */
    'delivered';
/**
 * event updates for tracked item
 */
class trackingEvent {
    // is id necessary ? only if updating or deleting single entries at a time. otherwises delete where parcelId = $1
    id?: number;

    /**
     * JOIN column target to link to {@link parcel} 
     */
    parcelId?: number;

    /**
     * Unix Epoch of when event occurred.
     */
    dateTime: number;

    // TODO: spec
    location: string;

    /**
     * Message associated with tracking event. 
     * Combine all header + description info into this property.
     */
    message: string;

    // TODO: move to parcel ? 
    /**
     * Types of tracking updates we care about.
     */
    type: trackingEventStatus;

    /**
     * Store raw response as JSON. 
     */
    raw: string;

    constructor(data: Dto<trackingEvent>) {
        this.id = data.id;
        this.dateTime = data.dateTime;
        this.location = data.location;
        this.message = data.message;
        this.type = data.type;
        this.raw = data.raw;
    }

    toData(): Dto<trackingEvent> {
        return {
            id: this.id,
            dateTime: this.dateTime,
            location: this.location,
            message: this.message,
            type: this.type,
            raw: this.raw,
        };
    }
}
