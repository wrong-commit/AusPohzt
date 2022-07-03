import { Dto } from "../types/Dto";

export { trackingEvent }

/**
 * event updates for tracked item
 */
class trackingEvent {
    // is id necessary ? 
    id: number;

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

    /**
     * Types of tracking updates we care about.
     */
    type: 'pending' | 'delivering' | 'delivered';

    constructor(data: Dto<trackingEvent>) {
        this.id = data.id;
        this.dateTime = data.dateTime;
        this.location = data.location;
        this.message = data.message;
        this.type = data.type;
    }

    toData(): Dto<trackingEvent> {
        return {
            id: this.id,
            dateTime: this.dateTime,
            location: this.location,
            message: this.message,
            type: this.type,
        };
    }
}