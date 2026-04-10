import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Fetch all reports (depends on user role on backend)
export const fetchReports = createAsyncThunk(
    'reports/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        const state = getState();
        if (state.reports && state.reports.data && state.reports.data.length > 0) {
            return state.reports.data;
        }

        try {
            const response = await api.get('/reports');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data laporan');
        }
    }
);

export const addReport = createAsyncThunk(
    'reports/add',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengunggah laporan');
        }
    }
);

export const deleteReport = createAsyncThunk(
    'reports/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/reports/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus laporan');
        }
    }
);

export const approveReport = createAsyncThunk(
    'reports/approve',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/reports/${id}/approve`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menyetujui laporan');
        }
    }
);

export const rejectReport = createAsyncThunk(
    'reports/reject',
    async ({ id, feedback }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/reports/${id}/reject`, { feedback });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menolak laporan');
        }
    }
);

const initialState = {
    data: [],
    loading: false,
    error: null,
};

const reportSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        clearReportsCache: (state) => {
            state.data = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addReport.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(addReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReport.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((r) => r.id !== action.payload);
            })
            .addCase(deleteReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Approve
            .addCase(approveReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveReport.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(approveReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reject
            .addCase(rejectReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectReport.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(rejectReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearReportsCache } = reportSlice.actions;
export default reportSlice.reducer;
