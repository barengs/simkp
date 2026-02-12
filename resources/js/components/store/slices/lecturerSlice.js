import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

export const fetchLecturers = createAsyncThunk(
    'lecturers/fetchLecturers',
    async ({ page = 1, perPage = 10, search = '' }, { rejectWithValue }) => {
        try {
            const response = await api.get('/lecturers', {
                params: { page, per_page: perPage, search }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data dosen');
        }
    },
    {
        condition: ({ page = 1, perPage = 10, search = '' }, { getState }) => {
            const { lecturers } = getState();
            if (!lecturers.forceRefetch && 
                lecturers.lecturers.length > 0 && 
                lecturers.lastParams?.page === page && 
                lecturers.lastParams?.per_page === perPage && 
                lecturers.lastParams?.search === search
            ) {
                return false; // Skip fetch, data is cached
            }
        }
    }
);

export const createLecturer = createAsyncThunk(
    'lecturers/createLecturer',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/lecturers', formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan dosen');
        }
    }
);

export const updateLecturer = createAsyncThunk(
    'lecturers/updateLecturer',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/lecturers/${id}`, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memperbarui dosen');
        }
    }
);

export const deleteLecturer = createAsyncThunk(
    'lecturers/deleteLecturer',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/lecturers/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus dosen');
        }
    }
);

const initialState = {
    lecturers: [],
    pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    },
    loading: false,
    initialLoading: true,
    error: null,
    lastParams: null,
    forceRefetch: false,
};

const lecturerSlice = createSlice({
    name: 'lecturers',
    initialState,
    reducers: {
        setForceRefetch: (state, action) => {
            state.forceRefetch = action.payload;
        },
        resetInitialLoading: (state) => {
            state.initialLoading = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLecturers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLecturers.fulfilled, (state, action) => {
                state.loading = false;
                state.initialLoading = false;
                if (action.payload === null) return;

                state.lecturers = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    per_page: action.payload.per_page,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page,
                };
                state.lastParams = {
                    page: action.payload.current_page,
                    per_page: action.payload.per_page,
                    search: action.meta.arg.search || '',
                };
                state.forceRefetch = false;
            })
            .addCase(fetchLecturers.rejected, (state, action) => {
                state.loading = false;
                state.initialLoading = false;
                state.error = action.payload;
            })
            .addCase(createLecturer.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParams = null; // Clear cache
            })
            .addCase(updateLecturer.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParams = null; // Clear cache
            })
            .addCase(deleteLecturer.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParams = null; // Clear cache
            });
    },
});

export const { setForceRefetch, resetInitialLoading } = lecturerSlice.actions;
export default lecturerSlice.reducer;
