import { parcel } from '@boganpost/backend/src/entities/parcel';
import { Dto } from '@boganpost/backend/src/types/Dto';
import React, { useEffect, useState } from 'react';
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
import { TaskBar } from './taskbar/TaskBar';


export { App };
type Props = {
    userId: number
}

const App = (props: Props) => {
    console.log(props);

    // sync parcels
    const [queued, fetchQueued, fetchingQueued, setQueued] = useAsync<Dto<queued>[]>(() => getQueued(), undefined);
    const [parcels, fetchParcels, fetchingParcels, setFetchedParcels] = useAsync<Dto<parcel>[]>(() => getParcels(), undefined);
    const [parcel, setParcel] = useState<Dto<parcel> | undefined>(undefined);

    useEffect(() => {
        // fetch parcels on first render, unless already fetching (unnecessary ?)
        if (!parcels && !fetchingParcels) {
            fetchParcels()
        }
    }, []);


    useEffect(() => {
        // fetch parcels on first render, unless already fetching (unnecessary ?)
        if (!queued && !fetchingQueued) {
            fetchQueued()
        }
    }, []);

    return (
        <>
            <div className={'App'}>
                <Box id={'parcels'}
                    title={'Parcels'}
                    defaultX={50}
                    defaultY={100}>
                    {fetchingParcels && (
                        <span>Loading Parcels...</span>
                    )}
                    {!fetchingParcels && !parcels && (
                        <span style={{ color: 'red' }}>Error</span>
                    )}
                    <div>
                        <span>Selected: {parcel ? parcel.trackingId : 'None'}</span>

                        {parcel && (
                            <DeleteParcel id={parcel.id!} deletedParcel={() => {
                                setFetchedParcels(undefined);
                                setParcel(undefined);
                                fetchParcels()
                            }} />
                        )}
                    </div>
                    <AddParcel addedParcel={() => { fetchQueued() }} />
                    {!fetchingParcels && parcels && (
                        <ListParcels parcels={parcels!}
                            onClick={id => setParcel(parcels.find(p => p.id === id))} />
                    )}
                </Box>

                <Box id={'queued'}
                    title={'Queued Parcels'}
                    defaultX={200}
                    defaultY={300}>
                    {fetchingQueued && (
                        <span>Loading...</span>
                    )}
                    {!fetchingQueued && !queued && (
                        <span style={{ color: 'red' }}>Error</span>
                    )}
                    {!fetchingQueued && queued && (
                        <ListQueued queued={queued} />
                    )}
                </Box>

                {parcel && (
                    <Box id={'events'}
                        title={`${parcel.trackingId}: Events`}
                        onClose={() => setParcel(undefined)}>
                        <ListEvents events={parcel.events} />
                    </Box>
                )}

                <TaskBar />
            </div >
        </>
    )
}