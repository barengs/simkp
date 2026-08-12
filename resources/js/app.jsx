import './bootstrap';
import '../css/app.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { store } from './store/store';
import { setCredentials } from './store/slices/authSlice';
import AppRouter from './router/AppRouter';
import { kpApi } from './modules/kp/api/kpApi';

const App = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const { data } = await axios.get('/api/user', { withCredentials: true });
        if (data?.user) {
          store.dispatch(setCredentials({
            user: data.user,
            roles: data.roles || [],
            permissions: data.permissions || [],
          }));
          store.dispatch(kpApi.util.invalidateTags(['Plotting']));
        }
      } catch (err) {
        // Not authenticated or error - keep isAuthenticated as false
        console.debug('Auth hydration skipped:', err.message);
      } finally {
        setHydrated(true);
      }
    };

    hydrateAuth();
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
};

const container = document.getElementById('app');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
} else {
  console.error('Failed to find the root element');
}
