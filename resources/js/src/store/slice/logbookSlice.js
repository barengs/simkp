import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchLogbooks = createAsyncThunk(
    'logbook/fetchLogbooks',
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        const logbookState = state.logbooks || state.logbook;
        if (logbookState && logbookState.data && logbookState.data.length > 0) {
            return logbookState.data;
        }

        try {
            const response = await api.get('/logbooks');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data logbook');
        }
    }
);

export const addLogbook = createAsyncThunk(
    'logbook/addLogbook',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/logbooks', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan logbook');
        }
    }
);

export const updateLogbook = createAsyncThunk(
    'logbook/updateLogbook',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            formData.append('_method', 'PUT');
            const response = await api.post(`/logbooks/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate logbook');
        }
    }
);

export const approveLogbook = createAsyncThunk(
    'logbook/approveLogbook',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/logbooks/${id}/approve`, { status });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status');
        }
    }
);

export const deleteLogbook = createAsyncThunk(
    'logbook/deleteLogbook',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/logbooks/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus logbook');
        }
    }
);

const logbookSlice = createSlice({
    name: 'logbook',
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLogbooks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLogbooks.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload || [];
            })
            .addCase(fetchLogbooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addLogbook.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            .addCase(updateLogbook.fulfilled, (state, action) => {
                const index = state.data.findIndex((l) => l.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(approveLogbook.fulfilled, (state, action) => {
                const index = state.data.findIndex((l) => l.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(deleteLogbook.fulfilled, (state, action) => {
                state.data = state.data.filter((l) => l.id !== action.payload);
            });
    },
});

export default logbookSlice.reducer;
