import React, { useEffect, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { addParcel } from '../../service/addParcel';
export { AddParcel }

type Props = {
    addedParcel: (trackingId: string) => void;
}

const AddParcel = (props: Props) => {

    const [trackingId, setTrackingId] = useState<string>('');

    const [added, trigger, loading] = useAsync<boolean | undefined>(() => addParcel(trackingId!), undefined)

    useEffect(() => {
        if (added) {
            props.addedParcel(trackingId);
        }
    }, [added])

    return (
        <>
            <input type={'text'}
                value={trackingId}
                disabled={loading}
                onChange={e => setTrackingId(e.target.value)}
            />
            {!loading && (
                <button disabled={trackingId.length === 0}
                    onClick={() => trigger()}>
                    Add
                </button>
            )}
            {loading && (
                <span>Loading...</span>
            )}
        </>
    );
}