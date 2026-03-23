import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../src/api";

export const fetchBimbingan = createAsyncThunk(
    "grading/fetchBimbingan",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/internships/bimbingan");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal memuat data bimbingan");
        }
    },
    {
        condition: (_, { getState }) => {
            const { students, loading } = getState().grading;
            if (loading || students.length > 0) {
                return false; 
            }
        },
    }
);

export const submitEvaluation = createAsyncThunk(
    "grading/submitEvaluation",
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post("/evaluations", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menyimpan nilai");
        }
    }
);

const gradingSlice = createSlice({
    name: "grading",
    initialState: {
        students: [],
        selectedStudent: null,
        loading: false,
        submitLoading: false,
        error: null,
        success: false,
    },
    reducers: {
        setSelectedStudent: (state, action) => {
            state.selectedStudent = action.payload;
        },
        clearGradingState: (state) => {
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Bimbingan
            .addCase(fetchBimbingan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBimbingan.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload;
            })
            .addCase(fetchBimbingan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Submit Evaluation
            .addCase(submitEvaluation.pending, (state) => {
                state.submitLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitEvaluation.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.success = true;
                // Update student status in list
                const index = state.students.findIndex(s => s.id === action.payload.data.internship_id);
                if (index !== -1) {
                    state.students[index] = { 
                        ...state.students[index], 
                        status: 'finished',
                        evaluation: action.payload.data 
                    };
                }
            })
            .addCase(submitEvaluation.rejected, (state, action) => {
                state.submitLoading = false;
                state.error = action.payload;
            });
    },
});

export const { setSelectedStudent, clearGradingState } = gradingSlice.actions;
export default gradingSlice.reducer;
