import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

// Async Thunks
export const fetchPeriods = createAsyncThunk(
    'periods/fetchPeriods',
    async ({ page = 1, perPage = 10, search = '' }, { getState, rejectWithValue }) => {
        try {
            const { periods } = getState();
            // Caching logic: if already loaded and params are same, skip
            if (!periods.forceRefetch && 
                periods.periods.length > 0 && 
                periods.lastParams?.page === page && 
                periods.lastParams?.per_page === perPage && 
                periods.lastParams?.search === search
            ) {
                return null; // Signals to skip update
            }

            const response = await api.get('/periods', {
                params: { page, per_page: perPage, search }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data periode');
        }
    }
);

export const createPeriod = createAsyncThunk(
    'periods/createPeriod',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/periods', formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan data periode');
        }
    }
);

export const updatePeriod = createAsyncThunk(
    'periods/updatePeriod',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/periods/${id}`, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memperbarui data periode');
        }
    }
);

export const deletePeriod = createAsyncThunk(
    'periods/deletePeriod',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/periods/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus data periode');
        }
    }
);

export const activatePeriod = createAsyncThunk(
    'periods/activatePeriod',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/periods/${id}/activate`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengaktifkan periode');
        }
    }
);

const initialState = {
    periods: [],
    pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    },
    loading: false,
    error: null,
    lastParams: null,
    forceRefetch: false,
};

const periodSlice = createSlice({
    name: 'periods',
    initialState,
    reducers: {
        setSearchTerm: (state, action) => {
            if (state.lastParams) {
                state.lastParams.search = action.payload;
            }
        },
        setForceRefetch: (state, action) => {
            state.forceRefetch = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Periods
            .addCase(fetchPeriods.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPeriods.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload === null) return; // Fetch skipped due to caching

                state.periods = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    per_page: action.payload.per_page,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page,
                };
                state.lastParams = {
                    page: action.payload.current_page,
                    per_page: action.payload.per_page,
                    search: state.lastParams?.search || '',
                };
                state.forceRefetch = false;
            })
            .addCase(fetchPeriods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create, Update, Delete, Activate (fulfilled states for refresh)
            .addCase(createPeriod.fulfilled, (state) => {
                state.error = null;
                state.forceRefetch = true;
            })
            .addCase(updatePeriod.fulfilled, (state) => {
                state.error = null;
                state.forceRefetch = true;
            })
            .addCase(deletePeriod.fulfilled, (state) => {
                state.error = null;
                state.forceRefetch = true;
            })
            .addCase(activatePeriod.fulfilled, (state) => {
                state.error = null;
                state.forceRefetch = true;
            });
    },
});

export const { setSearchTerm, setForceRefetch } = periodSlice.actions;
export default periodSlice.reducer;
