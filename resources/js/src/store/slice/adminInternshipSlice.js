import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchSubmittedInternships = createAsyncThunk(
    'adminInternship/fetchSubmitted',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/internships/submitted');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memuat data pendaftaran KP');
        }
    }
);

export const fetchApprovedInternships = createAsyncThunk(
    'adminInternship/fetchApproved',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/internships/approved');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memuat data plot dosen');
        }
    }
);

export const approveInternship = createAsyncThunk(
    'adminInternship/approve',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/internships/${id}/approve`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menyetujui pendaftaran');
        }
    }
);

export const rejectInternship = createAsyncThunk(
    'adminInternship/reject',
    async ({ id, note }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/internships/${id}/reject`, { note });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menolak pendaftaran');
        }
    }
);

export const assignSupervisor = createAsyncThunk(
    'adminInternship/assignSupervisor',
    async ({ id, supervisor_id }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/internships/${id}/assign-supervisor`, { supervisor_id });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menunjuk dosen pembimbing');
        }
    }
);

const adminInternshipSlice = createSlice({
    name: 'adminInternship',
    initialState: {
        submitted: [],
        approved: [],
        loadingSubmitted: false,
        loadingApproved: false,
        actionLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Submitted
            .addCase(fetchSubmittedInternships.pending, (state) => {
                state.loadingSubmitted = true;
                state.error = null;
            })
            .addCase(fetchSubmittedInternships.fulfilled, (state, action) => {
                state.loadingSubmitted = false;
                state.submitted = action.payload;
            })
            .addCase(fetchSubmittedInternships.rejected, (state, action) => {
                state.loadingSubmitted = false;
                state.error = action.payload;
            })
            
            // Fetch Approved (Plotting)
            .addCase(fetchApprovedInternships.pending, (state) => {
                state.loadingApproved = true;
                state.error = null;
            })
            .addCase(fetchApprovedInternships.fulfilled, (state, action) => {
                state.loadingApproved = false;
                state.approved = action.payload;
            })
            .addCase(fetchApprovedInternships.rejected, (state, action) => {
                state.loadingApproved = false;
                state.error = action.payload;
            })

            // Actions
            .addCase(approveInternship.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(approveInternship.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Remove from submitted list once approved
                state.submitted = state.submitted.filter(item => item.id !== action.payload.data.id);
                // Optionally add directly to approved list if we want immediate reactivity without refetch
                state.approved.unshift(action.payload.data);
            })
            .addCase(approveInternship.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            .addCase(rejectInternship.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(rejectInternship.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Remove from submitted
                state.submitted = state.submitted.filter(item => item.id !== action.payload.data.id);
            })
            .addCase(rejectInternship.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            .addCase(assignSupervisor.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(assignSupervisor.fulfilled, (state, action) => {
                state.actionLoading = false;
                // Remove from approved list once ongoing
                state.approved = state.approved.filter(item => item.id !== action.payload.data.id);
            })
            .addCase(assignSupervisor.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = adminInternshipSlice.actions;
export default adminInternshipSlice.reducer;
