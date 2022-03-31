import { api } from "./api";

export { auspostApi }

class auspostApi extends api {
    userAgent: string;

    static HEADER_API_KEY = 'api-key';
    static HEADER_AP_CHANNEL_NAME = 'AP_CHANNEL_NAME';
    static DEF_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36';

    constructor(host: string, userAgent?: string) {
        super(host);
        this.userAgent = userAgent ?? '';
    }

    public static override init(host?: string, userAgent?: string): auspostApi {
        return new auspostApi(host ?? process.env.DIGITAL_API, userAgent ?? auspostApi.DEF_USER_AGENT);
    }

    override addDefaultHeaders(headers: Record<string, string | number>): void {
        console.debug(`Adding API_KEY ${process.env.API_KEY}`);
        headers[auspostApi.HEADER_API_KEY] = process.env.API_KEY;
        // needed ? 
        headers[auspostApi.HEADER_AP_CHANNEL_NAME] = 'WEB_DETAIL';
        if (!headers['Accept']) {
            console.debug('default Accept header is application/json');
            headers['Accept'] = 'application/json';
        }
        if (!headers['User-Agent']) {
            console.debug('Adding default User-Agent');
            headers['User-Agent'] = auspostApi.DEF_USER_AGENT;
        }
    }

}