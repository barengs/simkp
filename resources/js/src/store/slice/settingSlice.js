import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Fetch public settings for branding (Logo, Name)
export const fetchPublicSettings = createAsyncThunk(
    'settings/fetchPublic',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings/public');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memuat pengaturan publik');
        }
    }
);

// Fetch all settings (Admin only)
export const fetchAllSettings = createAsyncThunk(
    'settings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memuat semua pengaturan');
        }
    }
);

// Update settings
export const updateSettings = createAsyncThunk(
    'settings/update',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memperbarui pengaturan');
        }
    }
);

const settingSlice = createSlice({
    name: 'settings',
    initialState: {
        publicSettings: {},
        allSettings: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Public Settings
            .addCase(fetchPublicSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPublicSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.publicSettings = action.payload;
            })
            .addCase(fetchPublicSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // All Settings (Admin)
            .addCase(fetchAllSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.allSettings = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
            })
            .addCase(fetchAllSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Settings
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.publicSettings = action.payload.settings;
                // We might need to refresh allSettings if in admin page
            });
    },
});

export default settingSlice.reducer;
