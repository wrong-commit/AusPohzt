import { bind, entity } from "../decorator/entityDecorators";
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
@entity('trackingEvent')
class trackingEvent {
    // is id necessary ? only if updating or deleting single entries at a time. otherwises delete where parcelId = $1
    @bind
    id?: number;

    /**
     * JOIN column target to link to {@link parcel} 
     */
    @bind
    parcelId?: number;

    /**
     * Unique external ID for tracking event.
     */
    @bind
    externalId: string | null;

    /**
     * Seconds since unix epoch when event occurred .
     */
    /**
     * 
     * FIXME: TrackingEvents are not check for datetime uniqueness if datetime is -1. 
This change is shit, but justified by setting datetime to -1 before 
merging so dateTime can reflect either when we saw the event, or use 
the self-reported event time. 
....
Just add a "firstSeen" column to the events that isn't compared. Duh.

     */
    @bind
    dateTime: number;

    // TODO: spec
    @bind
    location: string;

    /**
     * Message associated with tracking event. 
     * Combine all header + description info into this property.
     */
    @bind
    message: string;

    /**
     * Types of tracking updates we care about.
     */
    @bind
    type: trackingEventStatus;

    /**
     * Store raw response as JSON. 
     */
    @bind
    raw: string;

    constructor(data: Dto<trackingEvent>) {
        this.id = data.id;
        this.parcelId = data.parcelId;
        this.externalId = data.externalId;
        this.dateTime = data.dateTime;
        this.location = data.location;
        this.message = data.message;
        this.type = data.type;
        this.raw = data.raw;
    }

    /**
     * Compare if two trackingEvents are equal. Ignores entity data.
     * If dateTime of the parameter is -1, dateTime is not compared.
     * @param other 
     * @returns 
     */

    equals(other?: Dto<trackingEvent> | trackingEvent): boolean {
        if (!other) return false;
        if (other.dateTime !== -1 && this.dateTime !== other.dateTime) return false;
        return this.type === other.type &&
            this.externalId === other.externalId &&
            this.location === other.location &&
            this.message === other.message;
    }

    toData(): Dto<trackingEvent> {
        return {
            id: this.id,
            parcelId: this.parcelId,
            externalId: this.externalId,
            dateTime: this.dateTime,
            location: this.location,
            message: this.message,
            type: this.type,
            raw: this.raw,
        };
    }
}
