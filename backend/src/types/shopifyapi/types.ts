export {
    timelineStep,
    location,
    googleMapsMarker
}

/**
 * Struct from parsed HTML populated with tracking event information.
 */
type timelineStep = {
    /**
     * For storing in database
     */
    innerHtml: string;
    /**
     * Means step is/was active
     */
    selected: boolean;
    current: boolean;
    title?: string;
    /**
     * Hidden in HTML, useful.
     */
    stepNameText?: string;
    /**
     * Possible formats = [
     * `MM dd`
     * ]
     */
    date?: string;
}

/**
 * Coordinate extracted from shoptify html
 */
type location = {
    /**
     * Signed integer latitude
     */
    lat: number;
    /**
     * Signed integer longitude
     */
    lng: number;
}


type googleMapsMarker = {
    /**
     * current = package location, shippping = destination.
     */
    type: 'current' | 'shipping';
    /**
     * random url.
     */
    image: string;
    /**
     * General name, driven by type(?)
     */
    title: string;
    /**
     * location of marker
     */
    position: location;
    /**
     * unknown.
     */
    marker: boolean;
    /**
     * General location
     */
    label: string;
} & location;