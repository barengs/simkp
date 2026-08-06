import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppRouter from './router/AppRouter';

const container = document.getElementById('app');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <Provider store={store}>
            <AppRouter />
        </Provider>
    );
} else {
    console.error('Failed to find the root element');
}
