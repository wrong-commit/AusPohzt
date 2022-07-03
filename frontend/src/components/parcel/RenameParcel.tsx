import React, { useEffect } from 'react';
import { useState } from "react"
import { useAsync } from "../../hooks/useAsync";
import { renameParcel } from "../../service/renameParcel";
import '../../styles/components/parcel/RenameParcel.css';

export { RenameParcel }

type Props = {
    id: number;
    name?: string;
    renamedParcel: (success: boolean, name: string) => void;
}

const RenameParcel = (props: Props) => {
    const [name, setName] = useState(props.name ?? "");
    const [renamed, trigger, renaming] = useAsync<boolean | undefined>(() => renameParcel(props.id, name), undefined)

    useEffect(() => {
        if (renamed != undefined) {
            props.renamedParcel(renamed, name);
        }
    }, [renamed])

    return (
        <div className={'RenameParcel'}>
            {!renaming && (
                <>
                    <input type={'text'}
                        placeholder={'Parcel Name'}
                        value={name}
                        onChange={e => setName(e.target.value)} />
                    <button onClick={() => trigger()}>
                        Rename
                    </button>
                </>
            )}
            {renaming && (
                <span>Renaming...</span>
            )}
        </div>
    );
}
