import bent, { NodeResponse } from 'bent';

export { api }

class api {
    host: string;
    userAgent: string;

    static HEADER_API_KEY = 'api-key';
    static HEADER_AP_CHANNEL_NAME = 'AP_CHANNEL_NAME';
    static DEF_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36';

    constructor(host: string, userAgent?: string) {
        this.host = host;
        this.userAgent = userAgent ?? '';
    }

    public static init(host: string): api {
        return new api(host);
    }

    async get(path: string, options?: getOptions): Promise<bent.NodeResponse> {
        const url = this.buildUrl(path, options?.params);
        const request = bent<NodeResponse>('GET');
        const response = await request(url.toString(), undefined, this.buildHeaders(options?.headers));

        this.throwErrorOnWrongStatusCode(response, options?.statusCode)

        return response;
    }

    private throwErrorOnWrongStatusCode(response: NodeResponse, _statusCodes?: number | number[]) {
        if (_statusCodes) {
            const statusCodes: number[] = Array.isArray(_statusCodes) ? _statusCodes : [_statusCodes];
            if (!statusCodes.includes(response.statusCode)) {
                throw new Error(`${response.statusCode}: ${response.statusMessage}`);
            }
        }
    }

    /**
     * Create a HTTP headers required for request to complete.
     * TODO: extend class to define default headers ? 
     * @param headerKeyVal 
     * @returns 
     */
    private buildHeaders(headerKeyVal?: { [key in string]: string | number }): Record<string, string | number> | undefined {
        if (!headerKeyVal) return undefined;

        const headers: Record<string, string | number> = headerKeyVal ?? {}
        this.addDefaultHeaders(headers);
        return headers;
    }

    private addDefaultHeaders(headers: Record<string, string | number>): void {
        console.debug('Adding API_KEY');
        headers[api.HEADER_API_KEY] = process.env['API_KEY']!;
        // needed ? 
        console.debug('Adding AP_CHANNEL_NAME');
        headers[api.HEADER_AP_CHANNEL_NAME] = 'WEB_DETAIL';
        if (!headers['Accept']) {
            console.debug('default Accept header is application/json');
            headers['Accept'] = 'application/json';
        }
        if (!headers['User-Agent']) {
            console.debug('Adding default User-Agent');
            headers['User-Agent'] = api.DEF_USER_AGENT;
        }
    }

    private buildUrl(path: string, urlParams?: urlParams): URL {
        let url: URL = new URL(path, this.host);

        if (urlParams) {
            for (const param in urlParams) {
                url.searchParams.append(param, urlParams[param] + '');
            }
        }
        return url;
    }
}

type urlParams = {
    [key in string]: string | number;
}

type getOptions = {
    headers?: { [key in string]: string | number },
    params?: urlParams;
    /**
     * Request Promises will be rejected if the response does not include this code(s).
     */
    statusCode?: number | number[];
}

type postOptions = getOptions & {
    body?: any;
}