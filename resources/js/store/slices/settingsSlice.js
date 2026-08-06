import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        appName: 'SIM-KPTA',
        logoPath: null,
        faviconPath: null,
        kpJumlahAnggotaDefault: 3,
    },
    reducers: {
        setSettings: (state, action) => {
            state.appName = action.payload.appName || state.appName;
            state.logoPath = action.payload.logoPath || state.logoPath;
            state.faviconPath = action.payload.faviconPath || state.faviconPath;
            state.kpJumlahAnggotaDefault =
                action.payload.kpJumlahAnggotaDefault || state.kpJumlahAnggotaDefault;
        },
    },
});

export const { setSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
