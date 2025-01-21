// import { HttpsProxyAgent } from "https-proxy-agent";
import { api, getOptions } from "./api";
import bent, { NodeResponse } from "bent";

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
        // console.debug(`Adding API_KEY ${process.env.API_KEY}`);
        // headers[auspostApi.HEADER_API_KEY] = process.env.API_KEY;
        // needed ? 
        headers[auspostApi.HEADER_AP_CHANNEL_NAME] = 'WEB_DETAIL';
        // if (!headers['Accept']) {
        //     console.debug('default Accept header is application/json');
        //     headers['Accept'] = 'application/json';
        // }
        if (!headers['User-Agent']) {
            console.debug('Adding default User-Agent');
            headers['User-Agent'] = auspostApi.DEF_USER_AGENT;
        }
    }

    // override async get<T>(path:string, options: getOptions | undefined) : Promise<T> { 
    //     console.debug(`USING PROXY GET: HOST=${this.host} PATH=${path}`)
    //     const url = this.buildUrl(path, options?.params);
                
    //     // Define the proxy URL
    //     const proxyUrl = 'http://199.21.172.114:3128'; // Replace with your proxy details
    //     const agent = new HttpsProxyAgent(proxyUrl);

    //     const request = bent<NodeResponse>('GET', { 
    //         agent
    //     });
    //     const response = await request(url.toString(), undefined, this.buildHeaders(options?.headers));

    //     this.throwErrorOnWrongStatusCode(response, options?.statusCode)

    //     return response as any as T;
    // }

}