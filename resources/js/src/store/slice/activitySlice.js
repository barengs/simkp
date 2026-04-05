import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchAllActivities = createAsyncThunk(
    "activities/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/activities");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchLatestActivities = createAsyncThunk(
    "activities/fetchLatest",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/activities/latest");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const activitySlice = createSlice({
    name: "activities",
    initialState: {
        allActivities: [],
        latestActivities: [],
        loading: false,
        error: null,
        pagination: null,
    },
    reducers: {
        resetActivityState: (state) => {
            state.allActivities = [];
            state.latestActivities = [];
            state.pagination = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch All
        builder.addCase(fetchAllActivities.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchAllActivities.fulfilled, (state, action) => {
            state.loading = false;
            state.allActivities = action.payload.data;
            state.pagination = action.payload.meta;
        });
        builder.addCase(fetchAllActivities.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Fetch Latest
        builder.addCase(fetchLatestActivities.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchLatestActivities.fulfilled, (state, action) => {
            state.loading = false;
            state.latestActivities = action.payload.data;
        });
        builder.addCase(fetchLatestActivities.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export const { resetActivityState } = activitySlice.actions;
export default activitySlice.reducer;
