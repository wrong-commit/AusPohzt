import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';

import './index.css';
import './styles/global/font.css';
import './styles/global/colors.css';

ReactDOM.render(<React.StrictMode> <App /> </React.StrictMode>,
    document.getElementById('root'),
);