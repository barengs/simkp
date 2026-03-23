import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/dashboard-stats');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil statistik dashboard');
        }
    },
    {
        condition: (_, { getState }) => {
            const { dashboard } = getState();
            if (dashboard.fetched && !dashboard.forceRefetch) return false;
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        stats: [],
        monthlyTrends: [],
        recentActivities: [],
        loading: false,
        error: null,
        fetched: false,
        forceRefetch: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.fetched = true;
                state.forceRefetch = false;
                state.stats = action.payload.stats;
                state.monthlyTrends = action.payload.monthlyTrends;
                state.recentActivities = action.payload.recentActivities;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;
