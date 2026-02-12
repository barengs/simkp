import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

export const fetchCompanies = createAsyncThunk(
    'companies/fetchCompanies',
    async ({ page = 1, perPage = 10, search = '' }, { getState, rejectWithValue }) => {
        try {
            const { companies } = getState();
            if (!companies.forceRefetch && 
                companies.companies.length > 0 && 
                companies.lastParams?.page === page && 
                companies.lastParams?.per_page === perPage && 
                companies.lastParams?.search === search
            ) {
                return null;
            }

            const response = await api.get('/companies', {
                params: { page, per_page: perPage, search }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data mitra');
        }
    }
);

export const createCompany = createAsyncThunk(
    'companies/createCompany',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/companies', formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan mitra');
        }
    }
);

export const updateCompany = createAsyncThunk(
    'companies/updateCompany',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/companies/${id}`, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memperbarui mitra');
        }
    }
);

export const deleteCompany = createAsyncThunk(
    'companies/deleteCompany',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/companies/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus mitra');
        }
    }
);

const initialState = {
    companies: [],
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

const companySlice = createSlice({
    name: 'companies',
    initialState,
    reducers: {
        setForceRefetch: (state, action) => {
            state.forceRefetch = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompanies.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload === null) return;

                state.companies = action.payload.data;
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
            .addCase(fetchCompanies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCompany.fulfilled, (state) => {
                state.forceRefetch = true;
            })
            .addCase(updateCompany.fulfilled, (state) => {
                state.forceRefetch = true;
            })
            .addCase(deleteCompany.fulfilled, (state) => {
                state.forceRefetch = true;
            });
    },
});

export const { setForceRefetch } = companySlice.actions;
export default companySlice.reducer;
