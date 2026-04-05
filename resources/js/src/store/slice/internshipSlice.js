import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchMyInternship = createAsyncThunk(
    'internship/fetchMyInternship',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/internships');
            return response.data.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data KP');
        }
    }
);

export const registerInternship = createAsyncThunk(
    'internship/registerInternship',
    async (formData, { rejectWithValue }) => {
        try {
            // Using FormData for file uploads
            const response = await api.post('/internships', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mendaftar KP');
        }
    }
);

export const fetchInternshipGroups = createAsyncThunk(
    'internship/fetchInternshipGroups',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/internships/groups');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil daftar kelompok');
        }
    }
);

const internshipSlice = createSlice({
    name: 'internship',
    initialState: {
        data: null,
        groups: [],
        loading: false,
        error: null,
        registrationSuccess: false,
    },
    reducers: {
        resetRegistrationStatus: (state) => {
            state.registrationSuccess = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyInternship.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMyInternship.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchMyInternship.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchInternshipGroups.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInternshipGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.groups = action.payload;
            })
            .addCase(fetchInternshipGroups.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(registerInternship.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerInternship.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.registrationSuccess = true;
            })
            .addCase(registerInternship.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetRegistrationStatus } = internshipSlice.actions;
export default internshipSlice.reducer;
