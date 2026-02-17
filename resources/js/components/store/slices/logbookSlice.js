import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../src/api";

export const fetchLogbooks = createAsyncThunk(
    "logbooks/fetchLogbooks",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/logbooks");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal memuat logbook");
        }
    },
    {
        condition: (_, { getState }) => {
            const { logbooks, loading } = getState().logbooks;
            if (loading || logbooks.length > 0) {
                return false;
            }
        },
    }
);

export const createLogbook = createAsyncThunk(
    "logbooks/createLogbook",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post("/logbooks", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menyimpan logbook");
        }
    }
);

export const validateLogbook = createAsyncThunk(
    "logbooks/validateLogbook",
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/logbooks/${id}/validate`, { status, reason });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal memvalidasi logbook");
        }
    }
);

const logbookSlice = createSlice({
    name: "logbooks",
    initialState: {
        logbooks: [],
        loading: false,
        submitLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Logbooks
            .addCase(fetchLogbooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLogbooks.fulfilled, (state, action) => {
                state.loading = false;
                state.logbooks = action.payload;
            })
            .addCase(fetchLogbooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Logbook
            .addCase(createLogbook.pending, (state) => {
                state.submitLoading = true;
                state.error = null;
            })
            .addCase(createLogbook.fulfilled, (state, action) => {
                state.submitLoading = false;
                state.logbooks.unshift(action.payload.data);
            })
            .addCase(createLogbook.rejected, (state, action) => {
                state.submitLoading = false;
                state.error = action.payload;
            })
            // Validate Logbook
            .addCase(validateLogbook.pending, (state) => {
                state.submitLoading = true;
                state.error = null;
            })
            .addCase(validateLogbook.fulfilled, (state, action) => {
                state.submitLoading = false;
                const index = state.logbooks.findIndex(l => l.id === action.payload.data.id);
                if (index !== -1) {
                    state.logbooks[index] = action.payload.data;
                }
            })
            .addCase(validateLogbook.rejected, (state, action) => {
                state.submitLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = logbookSlice.actions;
export default logbookSlice.reducer;
