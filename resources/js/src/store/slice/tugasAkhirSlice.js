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

// Get Student Bimbingan list
export const fetchBimbinganTA = createAsyncThunk(
    'tugasAkhir/fetchBimbingan',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/student/bimbingan-ta');
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengambil data bimbingan.');
        }
    }
);

// Create Bimbingan entry (accepts FormData)
export const createBimbinganTA = createAsyncThunk(
    'tugasAkhir/createBimbingan',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post('/student/bimbingan-ta', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal menambah bimbingan.');
        }
    }
);

// Delete Bimbingan entry
export const deleteBimbinganTA = createAsyncThunk(
    'tugasAkhir/deleteBimbingan',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/student/bimbingan-ta/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal menghapus bimbingan.');
        }
    }
);

// Send discussion message for a bimbingan session
export const sendBimbinganMessage = createAsyncThunk(
    'tugasAkhir/sendBimbinganMessage',
    async ({ bimbinganId, message }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/student/bimbingan-ta/${bimbinganId}/messages`, { message });
            return { bimbinganId, message: res.data.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengirim pesan.');
        }
    }
);

// Fetch discussion messages for a bimbingan session
export const fetchBimbinganMessages = createAsyncThunk(
    'tugasAkhir/fetchBimbinganMessages',
    async (bimbinganId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/student/bimbingan-ta/${bimbinganId}/messages`);
            return { bimbinganId, messages: res.data.data || [] };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengambil pesan diskusi.');
        }
    }
);

// Get Sidang & requirements details
export const fetchSidangTA = createAsyncThunk(
    'tugasAkhir/fetchSidang',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/student/sidang-ta');
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengambil data sidang.');
        }
    }
);

// Upload exam requirement document (accepts FormData)
export const uploadSidangRequirement = createAsyncThunk(
    'tugasAkhir/uploadRequirement',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post('/student/sidang-ta/upload-requirement', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengunggah berkas.');
        }
    }
);

// Submit revision to examiner (accepts { nilaiUjianId, formData })
export const submitSidangRevision = createAsyncThunk(
    'tugasAkhir/submitRevision',
    async ({ nilaiUjianId, formData }, { rejectWithValue }) => {
        try {
            const res = await api.post(`/student/sidang-ta/submit-revision/${nilaiUjianId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengirim berkas revisi.');
        }
    }
);

// Fetch Repository Draft
export const fetchRepositoryTA = createAsyncThunk(
    'tugasAkhir/fetchRepository',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/student/repository-ta');
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal mengambil data repository.');
        }
    }
);

// Submit Repository Draft (accepts FormData)
export const submitRepositoryTA = createAsyncThunk(
    'tugasAkhir/submitRepository',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await api.post('/student/repository-ta', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Gagal menyimpan berkas repository.');
        }
    }
);

const tugasAkhirSlice = createSlice({
    name: 'tugasAkhir',
    initialState: {
        eligibility: null,
        myTA: null,
        bimbinganList: [],
        bimbinganMessages: {},  // { [bimbinganId]: [...messages] }
        sidangData: { schedules: [], requirements: [] },
        repositoryData: null,
        loading: false,
        eligibilityLoading: false,
        registerLoading: false,
        actionLoading: false,
        error: null,
        registrationSuccess: false,
        actionSuccess: false,
    },
    reducers: {
        resetTARegistrationStatus: (state) => {
            state.registrationSuccess = false;
            state.actionSuccess = false;
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
            })
            // Bimbingan list
            .addCase(fetchBimbinganTA.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBimbinganTA.fulfilled, (state, action) => {
                state.loading = false;
                state.bimbinganList = action.payload;
            })
            .addCase(fetchBimbinganTA.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Bimbingan
            .addCase(createBimbinganTA.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(createBimbinganTA.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.bimbinganList.unshift(action.payload);
                state.actionSuccess = true;
            })
            .addCase(createBimbinganTA.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Delete Bimbingan
            .addCase(deleteBimbinganTA.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(deleteBimbinganTA.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.bimbinganList = state.bimbinganList.filter(b => b.id !== action.payload);
            })
            .addCase(deleteBimbinganTA.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Send Bimbingan Message
            .addCase(sendBimbinganMessage.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
            })
            .addCase(sendBimbinganMessage.fulfilled, (state, action) => {
                state.actionLoading = false;
                const { bimbinganId, message } = action.payload;
                if (!state.bimbinganMessages[bimbinganId]) {
                    state.bimbinganMessages[bimbinganId] = [];
                }
                state.bimbinganMessages[bimbinganId].push(message);
            })
            .addCase(sendBimbinganMessage.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Fetch Bimbingan Messages
            .addCase(fetchBimbinganMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBimbinganMessages.fulfilled, (state, action) => {
                state.loading = false;
                const { bimbinganId, messages } = action.payload;
                state.bimbinganMessages[bimbinganId] = messages;
            })
            .addCase(fetchBimbinganMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Sidang Data
            .addCase(fetchSidangTA.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSidangTA.fulfilled, (state, action) => {
                state.loading = false;
                state.sidangData = action.payload;
            })
            .addCase(fetchSidangTA.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Upload Requirement
            .addCase(uploadSidangRequirement.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(uploadSidangRequirement.fulfilled, (state, action) => {
                state.actionLoading = false;
                const index = state.sidangData.requirements.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.sidangData.requirements[index] = action.payload;
                } else {
                    state.sidangData.requirements.push(action.payload);
                }
                state.actionSuccess = true;
            })
            .addCase(uploadSidangRequirement.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Submit Revision
            .addCase(submitSidangRevision.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(submitSidangRevision.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.actionSuccess = true;
                // update schedule grade with new notes
                state.sidangData.schedules.forEach(sched => {
                    const gradeIndex = sched.nilai_ujian.findIndex(g => g.id === action.payload.id);
                    if (gradeIndex !== -1) {
                        sched.nilai_ujian[gradeIndex] = action.payload;
                    }
                });
            })
            .addCase(submitSidangRevision.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })
            // Fetch Repository
            .addCase(fetchRepositoryTA.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRepositoryTA.fulfilled, (state, action) => {
                state.loading = false;
                state.repositoryData = action.payload;
            })
            .addCase(fetchRepositoryTA.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Submit Repository
            .addCase(submitRepositoryTA.pending, (state) => {
                state.actionLoading = true;
                state.error = null;
                state.actionSuccess = false;
            })
            .addCase(submitRepositoryTA.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.repositoryData = action.payload;
                state.actionSuccess = true;
            })
            .addCase(submitRepositoryTA.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetTARegistrationStatus } = tugasAkhirSlice.actions;
export default tugasAkhirSlice.reducer;
