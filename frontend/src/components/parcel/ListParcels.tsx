import React from 'react';
import { parcel } from "@boganpost/backend/src/entities/parcel";
import { Dto } from "@boganpost/backend/src/types/Dto";

export { ListParcels };

type Props = {
    parcels: Dto<parcel>[];
    onClick: (id: number) => void;
}

const ListParcels = (props: Props) => {

    return (
        <table>
            <thead>
                <tr>
                    <th>Parcel ID</th>
                    <th>Tracking Number</th>
                    <th>Nick</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody>
                {props.parcels.map(p => (
                    <tr key={p.id} onClick={() => props.onClick(p.id!)}>
                        <td>{p.id}</td>
                        <td>{p.trackingId}</td>
                        <td>{p.nickName}</td>
                        <td>{p.lastSync}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}