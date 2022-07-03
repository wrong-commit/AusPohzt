import { NonMethodKeys } from "./NonMethodKeys"

export { Dto }

type Dto<T> = Pick<T, NonMethodKeys<T>>;