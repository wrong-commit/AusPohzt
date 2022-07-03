import React from "react";


export { useAsync }

/**
 * A custom React hook to allow functional components to run async methods.
 * This hook returns a loading state variable that will trigger a render of the using Component. 
 * The result of the async function is returned in the result variable, but you can ignore this if the async function
 * is updating internal state of a different object ( see RegexDlfEditor reuse calculation for a reference)
 * 
 * Unmounted components are handled within the `if(mounted)` branch.
 * 
 * @param actionAsync 
 * @param initialResult 
 * @returns [result, trigger, loading, setResult]
 */
function useAsync<R = any>(
    actionAsync: () => Promise<R | undefined>,
    initialResult: R | undefined
): [R | undefined, () => void, boolean, (overrideResult: R | undefined) => void] {
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<R | undefined>(initialResult);
    const [fetchFlag, setFetchFlag] = React.useState(0);

    React.useEffect(() => {
        if (fetchFlag == 0) {
            // Run only after triggerFetch is called 
            return;
        }
        let mounted = true;
        setLoading(true);
        actionAsync().then(res => {
            if (mounted) {
                // Only modify state if component is still mounted
                setLoading(false);
                setResult(res);
            }
        })
        // Signal that compnoent has been 'cleaned up'
        return () => { mounted = false };
    }, [fetchFlag])

    function triggerFetch(): void {
        // Set fetchFlag to indirectly trigger the useEffect above
        setFetchFlag(Math.random() + 1); // + 1 to avoid generating 0
    }
    return [
        result,
        triggerFetch,
        loading,
        setResult,
    ];
}
