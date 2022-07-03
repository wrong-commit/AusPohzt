import React from 'react';
import { queued } from '@boganpost/backend/src/entities/queued';
import { Dto } from '@boganpost/backend/src/types/Dto';

export { ListQueued }
type Props = {
    queued: Dto<queued>[];
}

const ListQueued = (props: Props) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tracking Number</th>
                </tr>
            </thead>
            <tbody>
                {props.queued.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.trackingId}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}