import React from 'react';
import { parcel } from "@boganpost/backend/src/entities/parcel";
import { Dto } from "@boganpost/backend/src/types/Dto";
import '../../styles/table.css';
import { viewableDate } from '../../service/viewableDate';

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
                {props.parcels.sort((a, b) => a.id! - b.id!).map(p => (
                    <tr key={p.id} onClick={() => props.onClick(p.id!)}>
                        <td>{p.id}</td>
                        <td>{p.trackingId}</td>
                        <td>{p.nickName}</td>
                        <td>{viewableDate(p.lastSync * 1000)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}