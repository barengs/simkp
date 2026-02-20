import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchPeriods = createAsyncThunk(
    "periods/fetchPeriods",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/periods");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addPeriod = createAsyncThunk(
    "periods/addPeriod",
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post("/periods", data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updatePeriod = createAsyncThunk(
    "periods/updatePeriod",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/periods/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deletePeriod = createAsyncThunk(
    "periods/deletePeriod",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/periods/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const togglePeriodActive = createAsyncThunk(
    "periods/toggleActive",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await api.post(`/periods/${id}/toggle-active`);
            // Refresh periods after toggle to ensure status is synced
            dispatch(fetchPeriods());
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const periodSlice = createSlice({
    name: "periods",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchPeriods.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPeriods.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchPeriods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addPeriod.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            // Update
            .addCase(updatePeriod.fulfilled, (state, action) => {
                const index = state.data.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            // Delete
            .addCase(deletePeriod.fulfilled, (state, action) => {
                state.data = state.data.filter((p) => p.id !== action.payload);
            });
    },
});

export const { clearError } = periodSlice.actions;
export default periodSlice.reducer;
