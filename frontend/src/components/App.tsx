import { parcel } from '@boganpost/backend/src/entities/parcel';
import { Dto } from '@boganpost/backend/src/types/Dto';
import React, { useEffect, useRef, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getParcels } from '../service/getParcels';
import { Box } from './box/Box';
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
    const [parcels, fetchParcels, fetchingParcels, setFetchedParcels] = useAsync<Dto<parcel>[]>(() => getParcels(props.api, true), undefined);
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

    return (
        <>
            <div className={'App'}>
                <Box id={'parcels'}
                    title={`Parcels ${fetchingParcels ? 'Loading' : ''}`}
                    defaultX={50}
                    defaultY={200}>
                    <div>
                        {/* {fetchingParcels && (
                            <span>Loading Parcels...</span>
                        )} */}
                        {!fetchingParcels && !parcels && (
                            <span style={{ color: 'red' }}>Error</span>
                        )}
                    </div>
                    <div>
                        <span style={{ userSelect: 'text' }}>Selected: <span className="/*PUT SOMETHING HERE*/">{parcel ? parcel.trackingId : 'None'}</span></span>
                        {parcel && (
                            <DeleteParcel id={parcel.id!} deletedParcel={() => {
                                setFetchedParcels(undefined);
                                setParcel(undefined);
                                fetchParcels()
                            }} />
                        )}


                        {parcel && (
                            <RenameParcel id={parcel.id!}
                                name={parcel.nickName}
                                renamedParcel={(success, newName) => {
                                    if (success) {
                                        parcel.nickName = newName;
                                    }
                                }} />
                        )}
                    </div>
                    <AddParcel addedParcel={() => { fetchQueued() }} />
                    {parcels && (
                        <ListParcels parcels={parcels!}
                            onClick={id => setParcel(parcels.find(p => p.id === id))} />
                    )}
                </Box>

                <Box id={'queued'}
                    title={`Queued Parcels ${fetchingQueued ? 'Loading' : ''}`}
                    defaultX={800}
                    defaultY={250}>
                    {!fetchingQueued && !queued && (
                        <span style={{ color: 'red' }}>Error</span>
                    )}
                    {queued && (
                        <ListQueued queued={queued} />
                    )}
                </Box>

                {parcel && (
                    <Box id={'events'}
                        title={`${parcel.trackingId}: Events`}
                        onClose={() => setParcel(undefined)}>
                        {/* todo: is this a crap way to refresh components ?  */}
                        <ListEvents key={parcel.id! + parcel.events.length}
                            events={parcel.events} />
                    </Box>
                )}

                <TaskBar>
                    <TaskBarItem hidden={false}
                        onClick={sync}>
                        Refresh
                    </TaskBarItem>
                    <TaskBarItem hidden={false}
                        onClick={() => {
                            props.api.post('/v0/auth/logout')
                                .then(() => window.location.href = window.location.href)
                        }}>
                        Logout
                    </TaskBarItem>
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