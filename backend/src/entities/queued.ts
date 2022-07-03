import { bind, entity } from "../decorator/entityDecorators";
import { Dto } from "../types/Dto";

export { queued }
/**
 * class object for queued parcel id to check.
 */
@entity('queued')
class queued {
    @bind
    id?: number;
    /**
     * Tracking ID.
     */
    @bind
    trackingId: string;
    /**
     * Id of user that queued this parcel. 
     * TODO: spec this out. 
     */
    @bind
    owner: number;

    @bind
    checked: number = 0;

    constructor(data: Dto<queued>) {
        this.id = data.id;
        this.trackingId = data.trackingId;
        this.owner = data.owner;
        this.checked = data.checked;
    }

    toData(): Dto<queued> {
        return {
            id: this.id,
            trackingId: this.trackingId,
            owner: this.owner,
            checked: this.checked,
        }
    }
}