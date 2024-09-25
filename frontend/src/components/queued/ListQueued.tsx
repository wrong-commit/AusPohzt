import React from 'react';
import { queued } from '@boganpost/backend/src/entities/queued';
import { Dto } from '@boganpost/backend/src/types/Dto';
import { useAsync } from '../../hooks/useAsync';
import { deleteQueued } from '../../service/deleteQueued';

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
                    <th>Fail Count</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {props.queued.map(p => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.trackingId}</td>
                        <td>{p.checked}</td>
                        <td>
                            <button onClick={() => deleteQueued(p.trackingId)}>X</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}