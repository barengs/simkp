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
import { useGetSettingsQuery } from './modules/pengaturan/api/pengaturanApi';
import { menuConfig } from './config/menuConfig';

const DocumentTitle = () => {
    const { data: settings } = useGetSettingsQuery();

    useEffect(() => {
        const appName = settings?.app_name || 'SIM-KPTA';
        document.title = appName;
    }, [settings]);

    useEffect(() => {
        const faviconPath = settings?.favicon_path;
        if (faviconPath) {
            const fullUrl = faviconPath.startsWith('http') ? faviconPath : `${window.location.origin}${faviconPath}`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = fullUrl;
        }
    }, [settings]);

    return null;
};

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
      <DocumentTitle />
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
