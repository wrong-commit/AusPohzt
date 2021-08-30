import React from 'react';
import ReactDOM from 'react-dom';
import { parcel } from '@boganpost/backend/src/entities/parcel';

const parcelDto = new parcel({
    events: [],
    lastSync: 0,
    owner: 0,
    trackingId: 'trackingId',
    id: 99,
    nickName: 'test',
}).toData()

// import App from './App';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <h2>Yolo</h2>
        <span>TrackingId: {parcelDto.trackingId}</span>
        <span>Nickname: {parcelDto.nickName}</span>
    </React.StrictMode>,
    document.getElementById('root'),
);
