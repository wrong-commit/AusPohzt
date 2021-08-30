export { Without }

type Without<T, K> = {
    [L in Exclude<keyof T, K>]: T[L]
};
