import React, { useEffect } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { deleteParcel } from '../../service/deleteParcel';
export { DeleteParcel };

type Props = {
    id: number
    deletedParcel: (success: boolean) => void;
}

const DeleteParcel = (props: Props) => {
    const [deleted, trigger, deleting] = useAsync<boolean | undefined>(() => deleteParcel(props.id), undefined)

    useEffect(() => {
        if (deleted) {
            props.deletedParcel(deleted);
        }
    }, [deleted])

    return (
        <>
            {!deleting && (
                <button onClick={() => trigger()}>
                    Delete
                </button>
            )}
            {deleting && (
                <span>Deleting...</span>
            )}
        </>
    );
}