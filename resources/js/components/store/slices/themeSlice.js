import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

export const fetchThemes = createAsyncThunk(
    'themes/fetchThemes',
    async ({ page = 1, perPage = 10, search = '' }, { getState, rejectWithValue }) => {
        try {
            const { themes } = getState();
            if (!themes.forceRefetch && 
                themes.themes.length > 0 && 
                themes.lastParams?.page === page && 
                themes.lastParams?.per_page === perPage && 
                themes.lastParams?.search === search
            ) {
                return null;
            }

            const response = await api.get('/themes', {
                params: { page, per_page: perPage, search }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data tema');
        }
    }
);

export const createTheme = createAsyncThunk(
    'themes/createTheme',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/themes', formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan tema');
        }
    }
);

export const updateTheme = createAsyncThunk(
    'themes/updateTheme',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/themes/${id}`, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memperbarui tema');
        }
    }
);

export const deleteTheme = createAsyncThunk(
    'themes/deleteTheme',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/themes/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus tema');
        }
    }
);

const initialState = {
    themes: [],
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

const themeSlice = createSlice({
    name: 'themes',
    initialState,
    reducers: {
        setForceRefetch: (state, action) => {
            state.forceRefetch = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchThemes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchThemes.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload === null) return;

                state.themes = action.payload.data;
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
            .addCase(fetchThemes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTheme.fulfilled, (state) => {
                state.forceRefetch = true;
            })
            .addCase(updateTheme.fulfilled, (state) => {
                state.forceRefetch = true;
            })
            .addCase(deleteTheme.fulfilled, (state) => {
                state.forceRefetch = true;
            });
    },
});

export const { setForceRefetch } = themeSlice.actions;
export default themeSlice.reducer;
