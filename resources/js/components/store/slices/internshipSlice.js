import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

export const fetchInternships = createAsyncThunk(
    'internships/fetchInternships',
    async ({ status = 'submitted', page = 1, perPage = 10, search = '' }, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/internships', {
                params: { status, page, per_page: perPage, search }
            });
            const cacheKey = `${status}_${page}_${perPage}_${search}`;
            return { status, data: response.data, cacheKey };
        } catch (error) {
            const message = error.response?.data?.message || 'Gagal mengambil data pendaftaran';
            return rejectWithValue(message);
        }
    },
    {
        condition: ({ status = 'submitted', page = 1, perPage = 10, search = '' }, { getState }) => {
            const { internships } = getState();
            const cacheKey = `${status}_${page}_${perPage}_${search}`;
            if (!internships.forceRefetch && internships.lastParamsByStatus[status] === cacheKey) {
                return false; // Skip fetch, data is cached
            }
        }
    }
);

export const validateInternship = createAsyncThunk(
    'internships/validateInternship',
    async ({ id, status, notes }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/internships/${id}/status`, { status, notes });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal melakukan validasi');
        }
    }
);

export const plotLecturer = createAsyncThunk(
    'internships/plotLecturer',
    async ({ id, lecturer_id }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/internships/${id}/plot`, { lecturer_id });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal melakukan plotting dosen');
        }
    }
);

export const assignTeacher = createAsyncThunk(
    'internships/assignTeacher',
    async ({ internship_ids, teacher_id }, { rejectWithValue }) => {
        try {
            const response = await api.patch('/admin/internships/assign-teacher', { internship_ids, teacher_id });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menugaskan dosen');
        }
    }
);

export const registerInternship = createAsyncThunk(
    'internships/registerInternship',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/internships/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengirim pendaftaran');
        }
    }
);

export const checkLocation = createAsyncThunk(
    'internships/checkLocation',
    async ({ company_name, period_id }, { rejectWithValue }) => {
        try {
            const response = await api.get('/internships/check-location', {
                params: { company_name, period_id }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memeriksa lokasi');
        }
    }
);

export const fetchStudentDashboard = createAsyncThunk(
    'internships/fetchStudentDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const [internshipRes, historyRes] = await Promise.all([
                api.get('/internships/my'),
                api.get('/internships/my/history'),
            ]);
            return {
                existing_internship: internshipRes.data,
                internship_history: historyRes.data,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data dashboard');
        }
    },
    {
        condition: (_, { getState }) => {
            const { internships } = getState();
            // Skip fetch if already fetched and no force refetch
            if (!internships.forceRefetch && internships.dashboardFetched) {
                return false;
            }
        }
    }
);

const initialState = {
    internshipsByStatus: {
        submitted: { data: [], pagination: {} },
        approved: { data: [], pagination: {} },
        rejected: { data: [], pagination: {} },
    },
    dashboardData: null,
    dashboardFetched: false,
    internshipHistory: [],
    activePeriod: null,
    locationStatus: null,
    loading: false,
    error: null,
    lastParamsByStatus: {},
    forceRefetch: false,
};

const internshipSlice = createSlice({
    name: 'internships',
    initialState,
    reducers: {
        setForceRefetch: (state, action) => {
            state.forceRefetch = action.payload;
        },
        resetLocationStatus: (state) => {
            state.locationStatus = null;
        },
        resetInternshipState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInternships.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInternships.fulfilled, (state, action) => {
                state.loading = false;
                const { status, data, cacheKey } = action.payload;
                state.internshipsByStatus[status] = {
                    data: Array.isArray(data) ? data : [],
                    pagination: {}
                };
                state.lastParamsByStatus[status] = cacheKey;
                state.forceRefetch = false;
            })
            .addCase(fetchInternships.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(validateInternship.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParamsByStatus = {}; // Invalidate all caches
            })
            .addCase(plotLecturer.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParamsByStatus = {}; // Invalidate all caches
            })
            .addCase(assignTeacher.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParamsByStatus = {}; // Invalidate all caches
            })
            .addCase(registerInternship.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerInternship.fulfilled, (state) => {
                state.loading = false;
                state.forceRefetch = true;
                state.dashboardFetched = false; // Invalidate dashboard cache
                state.lastParamsByStatus = {};
            })
            .addCase(registerInternship.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(checkLocation.fulfilled, (state, action) => {
                state.locationStatus = action.payload;
            })
            .addCase(fetchStudentDashboard.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardFetched = true;
                state.dashboardData = action.payload.existing_internship;
                state.internshipHistory = action.payload.internship_history || [];
                state.activePeriod = action.payload.existing_internship?.period || null;
            })
            .addCase(fetchStudentDashboard.rejected, (state, action) => {
                state.loading = false;
                state.dashboardFetched = true; // Mark as fetched even on error to prevent loops
                state.error = action.payload;
            });
    },
});

export const { setForceRefetch, resetLocationStatus, resetInternshipState } = internshipSlice.actions;
export default internshipSlice.reducer;
