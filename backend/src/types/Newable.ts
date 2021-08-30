export { Newable }
type Newable<T> = { new(...args: any[]): T; };
