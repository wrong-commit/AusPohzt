import { api } from "./api";

export { jwtApi }

class jwtApi extends api {
    token: string;
    static HEADER_JWT = 'Authorization: Bearer ';

    constructor(host: string, token?: string) {
        super(host);
        if (!token) {
            throw new Error('jwtApi must be initialized with a JWT Token')
        }
        this.token = token;
    }

    static initWithToken(host: string, token?: string): jwtApi {
        return new jwtApi(host, token);
    }

    override addDefaultHeaders(headers: Record<string, string | number>): void {
        console.debug(`Adding JWT header`);
        headers[jwtApi.HEADER_JWT] = this.token;
    }

}