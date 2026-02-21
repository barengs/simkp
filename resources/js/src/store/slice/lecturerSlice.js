import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchLecturers = createAsyncThunk(
    "lecturers/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/lecturers");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal mengambil data dosen.");
        }
    }
);

export const createLecturer = createAsyncThunk(
    "lecturers/create",
    async (lecturerData, { rejectWithValue }) => {
        try {
            const response = await api.post("/lecturers", lecturerData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menambah dosen.");
        }
    }
);

export const updateLecturer = createAsyncThunk(
    "lecturers/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/lecturers/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal memperbarui dosen.");
        }
    }
);

export const deleteLecturer = createAsyncThunk(
    "lecturers/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/lecturers/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menghapus dosen.");
        }
    }
);

export const resetLecturerPassword = createAsyncThunk(
    "lecturers/resetPassword",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/lecturers/${id}/reset-password`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal mereset password.");
        }
    }
);

const lecturerSlice = createSlice({
    name: "lecturers",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLecturers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLecturers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchLecturers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createLecturer.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            .addCase(updateLecturer.fulfilled, (state, action) => {
                const index = state.data.findIndex((l) => l.id === action.payload.id);
                if (index !== -1) state.data[index] = action.payload;
            })
            .addCase(deleteLecturer.fulfilled, (state, action) => {
                state.data = state.data.filter((l) => l.id !== action.payload);
            });
    },
});

export default lecturerSlice.reducer;
