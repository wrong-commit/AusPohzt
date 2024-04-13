import { parcel } from '@boganpost/backend/src/entities/parcel';
import { Dto } from '@boganpost/backend/src/types/Dto';
import React, { useEffect, useRef, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getParcels } from '../service/getParcels';
import { Box , BoxUI } from './box/Box';
import { ListEvents } from './events/ListEvents';
import { AddParcel } from './parcel/AddParcel';
import { DeleteParcel } from './parcel/DeleteParcel';
import { ListParcels } from './parcel/ListParcels';
import '../styles/components/App.css';
import { getQueued } from '../service/getQueued';
import { ListQueued } from './queued/ListQueued';
import { queued } from '@boganpost/backend/src/entities/queued';
import { useTimer } from '../hooks/useTimer';
import { TaskBar, TaskBarItem } from './taskbar/TaskBar';
import { RenameParcel } from './parcel/RenameParcel';
import { api } from '@boganpost/backend/src/services/api';
import { WindowProvider } from '../context/WindowContext';
import { Login } from './Login';

import { deleteParcel } from '../service/deleteParcel';

export { 
    App, 
    AppWrapper
 };

type Props = {
    userId: number,
    api: api,
}
const App = (props: Props) => {
    console.log('App props:', props);

    // sync parcels
    const [queued, fetchQueued, fetchingQueued, setQueued] = useAsync<Dto<queued>[]>(() => getQueued(props.api), undefined);
    const [parcels, fetchParcels, fetchingParcels, setFetchedParcels] = useAsync<Dto<parcel>[]>(() => getParcels(props.api, false), undefined);
    const [parcel, setParcel] = useState<Dto<parcel> | undefined>(undefined);

    const sync = async () => {
        await fetchParcels();
        await fetchQueued();
    }
    // ignore callback, this is just triggering useAsync calls
    const lastUpdated = useTimer(async () => {
        // await sync()
        return 1;
    }, 5000, () => null, [])

    // fetch parcels on first render, unless already fetching (unnecessary ?)
    useEffect(() => {
        if (!parcels && !fetchingParcels) {
            fetchParcels()
        }
    }, []);

    // fetch parcels on first render, unless already fetching (unnecessary ?)
    useEffect(() => {
        if (!queued && !fetchingQueued) {
            fetchQueued()
        }
    }, []);

    // deselect parcel if removed in refresh
    useEffect(() => {
        if (parcel && !parcels?.find(x => x.id === parcel.id)) {
            setParcel(undefined);
        }
    }, [parcels, queued])

    return (<AppUI
        api={props.api}
        fetchingParcels={fetchingParcels} 
        parcels={parcels} 
        parcel={parcel} 
        setParcel={setParcel}
        fetchQueued={fetchQueued}
        fetchingQueued={fetchingQueued}
        fetchParcels={fetchParcels}
        queued={queued}
        setFetchedParcels={setFetchedParcels}
        sync={sync}
        />
    )
}

type UIProps = {
    fetchingQueued:boolean;
    fetchingParcels:boolean;
    parcels:Dto<parcel>[] | undefined
    parcel:Dto<parcel>|undefined;
    setParcel:(x: Dto<parcel> | undefined) => void;
    setFetchedParcels:(x: Dto<parcel>[] | undefined) => void;
    sync: VoidFunction;
    fetchParcels: VoidFunction;
    fetchQueued: VoidFunction;
    queued: Dto<queued>[]|undefined;
    api: Props['api']
} 
function AppUI(props: UIProps) { 
    return (
        <>
            <div className={'App'}>
                <div className={'Boxes'}>
                <BoxUI id={'parcels'}
                    title={`Parcels ${props.fetchingParcels ? 'Loading' : ''}`}>
                    <div>
                        {!props.fetchingParcels && !props.parcels && (
                            <span style={{ color: 'red' }}>Error</span>
                        )}
                    </div>
                    <div>
                        <span style={{ userSelect: 'text' }}>Selected: <span className="/*PUT SOMETHING HERE*/">{props.parcel ? props.parcel.trackingId : 'None'}</span></span>
                       
                        {props.parcel && (
                            <RenameParcel id={props.parcel.id!}
                                name={props.parcel.nickName}
                                renamedParcel={(success, newName) => {
                                    if (success && props.parcel) {
                                        props.parcel.nickName = newName;
                                        props.sync()
                                    }
                                }} />
                        )}
                    </div>
                    <AddParcel addedParcel={() => { props.fetchQueued() }} />
                    {props.parcels && (
                        <ListParcels parcels={props.parcels!}
                            onClick={id => props.setParcel(props.parcels!.find(p => p.id === id))} />
                    )}
                </BoxUI>
                <BoxUI id={'queued'}
                    title={`Queued Parcels ${props.fetchingQueued ? 'Loading' : ''}`}>
                    {!props.fetchingQueued && !queued && (
                        <span style={{ color: 'red' }}>Error</span>
                    )}
                    {props.queued && (
                        <ListQueued queued={props.queued} />
                    )}
                </BoxUI>
                    <BoxUI id={'events'}
                        title={`${props.parcel?.nickName ?? props.parcel?.trackingId}: Events`}
                        onClose={() => props.setParcel(undefined)}>
                        <ListEvents key={props.parcel ? (props.parcel.id! + props.parcel.events.length) : undefined}
                            events={props.parcel?.events?? []} />
                    </BoxUI>
                </div>
                <TaskBar>
                    <TaskBarItem hidden={false}
                        onClick={props.sync}>
                        Refresh
                    </TaskBarItem>
                    <TaskBarItem hidden={false}
                        onClick={() => {
                            props.api.post('/v0/auth/logout')
                                .then(() => window.location.href = window.location.href)
                        }}>
                        Logout
                    </TaskBarItem>
                    {props.parcel && (
                        <TaskBarItem hidden={false}
                        onClick={() => {
                            // Delete package
                            deleteParcel(props.parcel!.id!).then(() => {
                                // Remove package from UI, resync parcels 
                                props.setFetchedParcels(undefined);
                                props.setParcel(undefined);
                                props.setFetchedParcels(props.parcels!.filter(x=> x.id != props.parcel!.id))
                                props.fetchParcels()
                            })
                        }}
                        children={`Delete '${props.parcel?.nickName ?? props.parcel?.trackingId}'`} /> 
                        )}
                </TaskBar>
            </div >
        </>
    )
}

function AppWrapper() { 
return ( 
    <React.StrictMode>
        <WindowProvider>
            <Login>
                {(userId, api) => ( 
                    <App userId={userId}
                    api={api} />
                )}
            </Login>
        </WindowProvider>
    </React.StrictMode>
)
}