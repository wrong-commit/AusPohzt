import React from 'react';
import ReactDOM from 'react-dom';
import { parcel } from '@boganpost/backend/src/entities/parcel';

import './index.css';
import { App } from './components/App';

ReactDOM.render(
    <React.StrictMode>
        <App />

    </React.StrictMode>,
    document.getElementById('root'),
);
