import { useCallback, useEffect, useRef, useState } from "react";
export { useTimer };

function useTimer<T, D extends any[]>(
    asyncMethod: (...args: D) => Promise<T | undefined>,
    intervalMs: number,
    callback: (value: T) => void,
    deps: D): [number] {
    const intervalRef = useRef<undefined | number | NodeJS.Timeout>(-1)

    const [lastUpdated, setLastUpdated] = useState<null | number>(null);

    const timerCallback = useCallback(async (cb: typeof callback) => {
        const asyncResponse = await asyncMethod(...deps)
        if (intervalRef.current == undefined) {
            return;
        }
        intervalRef.current = setTimeout(() => timerCallback(cb), intervalMs);
        if (asyncResponse) {
            cb(asyncResponse);
            setLastUpdated(Date.now());
        }
    }, deps);

    useEffect(() => {
        timerCallback(callback);
        return function cleanup() { { clearTimeout(intervalRef.current as number); intervalRef.current = undefined } }
    }, [])

    return [lastUpdated ?? -1];
}