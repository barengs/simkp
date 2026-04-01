import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchEvaluations = createAsyncThunk(
    'evaluations/fetchAll',
    async (_, { rejectWithValue, getState }) => {
        const state = getState();
        if (state.evaluations && state.evaluations.data && state.evaluations.data.length > 0) {
            return state.evaluations.data;
        }

        try {
            const response = await api.get('/evaluations');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data evaluasi');
        }
    }
);

export const saveEvaluation = createAsyncThunk(
    'evaluations/save',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/evaluations', formData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menyimpan evaluasi');
        }
    }
);

export const deleteEvaluation = createAsyncThunk(
    'evaluations/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/evaluations/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus evaluasi');
        }
    }
);

const initialState = {
    data: [],
    loading: false,
    error: null,
};

const evaluationSlice = createSlice({
    name: 'evaluations',
    initialState,
    reducers: {
        clearEvaluationsCache: (state) => {
            state.data = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchEvaluations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvaluations.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchEvaluations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Save
            .addCase(saveEvaluation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveEvaluation.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex((item) => item.internship_id === action.payload.internship_id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                } else {
                    state.data.unshift(action.payload);
                }
            })
            .addCase(saveEvaluation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteEvaluation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvaluation.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((r) => r.id !== action.payload);
            })
            .addCase(deleteEvaluation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearEvaluationsCache } = evaluationSlice.actions;
export default evaluationSlice.reducer;
