import { Dto } from "./Dto";

export { DtoNewable }

type DtoNewable<T> = { new(data: Dto<T>): T; };
