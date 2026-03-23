import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../src/api";

export const uploadReport = createAsyncThunk(
    "reports/upload",
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post("/reports", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    dispatch(setProgress(progress));
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal mengunggah laporan");
        }
    }
);

const reportSlice = createSlice({
    name: "reports",
    initialState: {
        loading: false,
        progress: 0,
        error: null,
        success: false,
    },
    reducers: {
        setProgress: (state, action) => {
            state.progress = action.payload;
        },
        resetState: (state) => {
            state.loading = false;
            state.progress = 0;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadReport.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.progress = 0;
            })
            .addCase(uploadReport.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.progress = 100;
            })
            .addCase(uploadReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.progress = 0;
            });
    },
});

export const { setProgress, resetState } = reportSlice.actions;
export default reportSlice.reducer;
