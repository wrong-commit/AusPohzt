import React from 'react';
import ReactDOM from 'react-dom';
import { App,AppWrapper } from './components/App';
import { Login } from './components/Login';
import { WindowProvider } from './context/WindowContext';
import './styles/global/colors.css'
import './index.css'

ReactDOM.render(AppWrapper(),
    document.getElementById('root'),
);