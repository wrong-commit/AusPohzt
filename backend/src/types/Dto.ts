import { NonMethodKeys } from "./NonMethodKeys";

export { Dto };

type DtoProperties<T> = {
    // K is property of type T
    [K in keyof T]:
    // change Array<U> to Array<Dto<U>>
    T[K] extends Array<infer U> ? Array<Dto<U>> :
    // change object to Dto<>
    T[K] extends object ? Dto<T[K]>
    // primatives
    : T[K]
};

// remove Method keys from DtoProperties
type Dto<T> = Pick<DtoProperties<T>, NonMethodKeys<T>>
