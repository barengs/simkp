import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import { masterDataApi } from '../modules/master-data/api/masterDataApi';
import { kpApi } from '../modules/kp/api/kpApi';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        settings: settingsReducer,
        [masterDataApi.reducerPath]: masterDataApi.reducer,
        [kpApi.reducerPath]: kpApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(masterDataApi.middleware, kpApi.middleware),
});
