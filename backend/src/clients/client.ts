import { parcel } from "../entities/parcel";
import { trackingEvent } from "../entities/trackingEvent";
import { Dto } from "../types/Dto";

export { client };
interface client<T> {
    /**
     * Create type T for a trackingId. implementation is responssible for determining a fail state, indicated by 
     * returning undefined or thrown an error.
     * @param trackingId 
     */
    sync(trackingId: string): PromiseLike<T | undefined>;

    /**
     * Constructs a parcel DTO for per client inputs. 
     * This parcel can re
     * @param args 
     */
    createParcel(external: T): Dto<parcel> | undefined;

    /**
     * Create trackingEvent info.
     * Events may have data that needs to be populated afterwards.
     * @param shipmentEvent 
     */
    parseTrackingEvent(shipmentEvent: any): Dto<trackingEvent>;
}