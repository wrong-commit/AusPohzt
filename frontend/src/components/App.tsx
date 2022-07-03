import React, { useEffect } from 'react';
import { parcel } from '@boganpost/backend/src/entities/parcel';
// import { parcel } from '../../../backend/src/entities/parcel';
import { Dto } from '@boganpost/backend/src/types/Dto';
import { useAsync } from '../hooks/useAsync';
import { viewableDate } from '@boganpost/backend/src/util/viewableDate'

export { App }
type Props = {

}
const App = (props: Props) => {
    console.log(props);
    const [result, trigger, loading, setResult] = useAsync<Dto<parcel>[]>(() => {
        const request = new Request('http://localhost:3000/v0/parcel');

        return fetch(request, {
            method: 'GET',
        }).then(res => {
            if (res.ok) {
                throw new Error('Could not get parcels valid');
            }
            return res.json();
        }).then(res => {
            if (Array.isArray(res)) {
                return res.map(x => new parcel(x).toData())
            }
            console.warn(`Invalid response returned`);
            return undefined;
        }).catch(e => {
            console.error(`Error fetching parcels`, e);
            return undefined;
        })
    }, undefined);

    useEffect(() => {
        if (!result && !loading) {
            trigger()
        }
    }, []);

    return (
        <div>
            <h2>Yolo</h2>
            {loading && (
                <span>Loading...</span>
            )}
            {!loading && !result && (
                <span style={{ color: 'red' }}>ERROR LOADING PARCELS</span>
            )}
            {!loading && result && result.map(parcel => (
                <React.Fragment key={parcel.id + parcel.trackingId}>
                    <h3>{parcel.trackingId} {parcel.nickName ? ': ' + parcel.nickName : ''}</h3>
                    <span>Events</span>
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Location</th>
                                <th>Date Time</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcel.events.map(event => (
                                <tr key={event.id}>
                                    <td>{event.id}</td>
                                    <td>{event.location}</td>
                                    <td>{viewableDate(event.dateTime)}</td>
                                    <td>{event.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </React.Fragment>
            ))}
        </div >
    )
}