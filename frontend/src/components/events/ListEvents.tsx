import React from 'react';
import { trackingEvent } from "@boganpost/backend/src/entities/trackingEvent";
import { Dto } from "@boganpost/backend/src/types/Dto";
import '../../styles/table.css';

export { ListEvents }

type Props = {
    events: Dto<trackingEvent>[];
}

const ListEvents = (props: Props) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Location</th>
                    <th>Date Time</th>
                    <th>Message</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {props.events.map(event => (
                    <tr key={event.id}>
                        <td>{event.id}</td>
                        <td>{event.location}</td>
                        <td>{event.dateTime}</td>
                        <td>{event.message}</td>
                        <td style={{
                            color: event.type === 'delivered' ? 'green' :
                                event.type === 'failed' ? 'red' :
                                    event.type === 'awaiting collection' ? 'blue' : 'gray'

                        }}>{event.type}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}