import { parcel } from '@boganpost/backend/src/entities/parcel';
import { Dto } from '@boganpost/backend/src/types/Dto';
import React, { useEffect, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getParcels } from '../service/getParcels';
import { Box } from './box/Box';
import { ListEvents } from './events/ListEvents';
import { AddParcel } from './parcel/AddParcel';
import { ListParcels } from './parcel/ListParcels';
import '../styles/components/App.css';
import { DeleteParcel } from './parcel/DeleteParcel';


export { App };
type Props = {

}

const App = (props: Props) => {
    console.log(props);

    // sync parcels
    const [parcels, fetchParcels, loading, setFetchedParcels] = useAsync<Dto<parcel>[]>(() => getParcels(), undefined);
    const [parcel, setParcel] = useState<Dto<parcel> | undefined>(undefined);

    useEffect(() => {
        // fetch parcels on first render, unless already fetching (unnecessary ?)
        if (!parcels && !loading) {
            fetchParcels()
        }
    }, []);

    const loadedParcels = !loading && parcels;

    return (
        <div className={'App'}>
            {/* <h2>Yolo</h2> */}
            <Box title={'Parcels'}>
                {loading && (
                    <span>Loading Parcels...</span>
                )}
                {!loading && !parcels && (
                    <span style={{ color: 'red' }}>ERROR LOADING PARCELS</span>
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
                <AddParcel addedParcel={() => fetchParcels()} />
                {loadedParcels && (
                    <ListParcels parcels={parcels!}
                        onClick={id => setParcel(parcels.find(p => p.id === id))} />
                )}
            </Box>
            {parcel && (
                <Box title={`${parcel.trackingId}: Events`} onClose={() => setParcel(undefined)}>
                    <ListEvents events={parcel.events} />
                </Box>
            )}
        </div >
    )
}