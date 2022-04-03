import { Jwt, JwtPayload } from 'jsonwebtoken';


declare global {
    declare namespace Express {
        interface Request {
            claims?: string | JwtPayload;
        }
    }
}
