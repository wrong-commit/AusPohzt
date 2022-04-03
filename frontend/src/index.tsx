import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
import { Login } from './components/Login';
import { WindowProvider } from './context/WindowContext';

import './index.css';
import './styles/global/font.css';
import './styles/global/colors.css';

ReactDOM.render(
    <React.StrictMode>
        <WindowProvider>

            <Login>
                {(userId, api) => (
                    <App userId={userId} api={api} />
                )}
            </Login>

        </WindowProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);