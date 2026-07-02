import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Check TA eligibility
export const fetchEligibilityTA = createAsyncThunk(
    'tugasAkhir/fetchEligibility',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/student/eligibility-ta');
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengecek kelayakan TA.');
        }
    }
);

// Register TA
export const registerTA = createAsyncThunk(
    'tugasAkhir/register',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post('/student/register-ta', formData);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mendaftarkan Tugas Akhir.');
        }
    }
);

// Get my active TA
export const fetchMyTA = createAsyncThunk(
    'tugasAkhir/fetchMyTA',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/student/my-ta');
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengambil data TA.');
        }
    }
);

const tugasAkhirSlice = createSlice({
    name: 'tugasAkhir',
    initialState: {
        eligibility: null,
        myTA: null,
        loading: false,
        eligibilityLoading: false,
        registerLoading: false,
        error: null,
        registrationSuccess: false,
    },
    reducers: {
        resetTARegistrationStatus: (state) => {
            state.registrationSuccess = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Eligibility
            .addCase(fetchEligibilityTA.pending, (state) => {
                state.eligibilityLoading = true;
                state.error = null;
            })
            .addCase(fetchEligibilityTA.fulfilled, (state, action) => {
                state.eligibilityLoading = false;
                state.eligibility = action.payload;
            })
            .addCase(fetchEligibilityTA.rejected, (state, action) => {
                state.eligibilityLoading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerTA.pending, (state) => {
                state.registerLoading = true;
                state.error = null;
                state.registrationSuccess = false;
            })
            .addCase(registerTA.fulfilled, (state, action) => {
                state.registerLoading = false;
                state.myTA = action.payload;
                state.registrationSuccess = true;
            })
            .addCase(registerTA.rejected, (state, action) => {
                state.registerLoading = false;
                state.error = action.payload;
                state.registrationSuccess = false;
            })
            // Fetch My TA
            .addCase(fetchMyTA.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyTA.fulfilled, (state, action) => {
                state.loading = false;
                state.myTA = action.payload;
            })
            .addCase(fetchMyTA.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetTARegistrationStatus } = tugasAkhirSlice.actions;
export default tugasAkhirSlice.reducer;
