import bent, { NodeResponse } from 'bent';

export { api }

class api {
    host: string;

    constructor(host: string) {
        this.host = host;
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
    async post(path: string, options?: postOptions): Promise<bent.NodeResponse> {
        const url = this.buildUrl(path, options?.params);
        const request = bent<NodeResponse>('POST');

        const response = await request(url.toString(), options?.body, this.buildHeaders(options?.headers));

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
     * 
     * @param headerKeyVal 
     * @returns 
     */
    private buildHeaders(headerKeyVal?: { [key in string]: string | number }): Record<string, string | number> | undefined {
        if (!headerKeyVal) return undefined;

        const headers: Record<string, string | number> = headerKeyVal ?? {}
        this.addDefaultHeaders(headers);
        return headers;
    }

    // provided for override by implementing classes
    addDefaultHeaders(headers: Record<string, string | number>): void {
        headers; // TS config complains that headers is unused otherwise
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
    [key in string]: string | number | boolean;
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
