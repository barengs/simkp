import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchThemes = createAsyncThunk(
    "themes/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/themes");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal mengambil data tema.");
        }
    }
);

export const createTheme = createAsyncThunk(
    "themes/create",
    async (themeData, { rejectWithValue }) => {
        try {
            const response = await api.post("/themes", themeData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menambah tema.");
        }
    }
);

export const updateTheme = createAsyncThunk(
    "themes/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/themes/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal memperbarui tema.");
        }
    }
);

export const deleteTheme = createAsyncThunk(
    "themes/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/themes/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menghapus tema.");
        }
    }
);

const themeSlice = createSlice({
    name: "themes",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchThemes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchThemes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchThemes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createTheme.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            .addCase(updateTheme.fulfilled, (state, action) => {
                const index = state.data.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) state.data[index] = action.payload;
            })
            .addCase(deleteTheme.fulfilled, (state, action) => {
                state.data = state.data.filter((t) => t.id !== action.payload);
            });
    },
});

export default themeSlice.reducer;
