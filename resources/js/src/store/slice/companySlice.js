import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const fetchCompanies = createAsyncThunk(
    "companies/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/companies");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal mengambil data mitra.");
        }
    }
);

export const createCompany = createAsyncThunk(
    "companies/create",
    async (companyData, { rejectWithValue }) => {
        try {
            const response = await api.post("/companies", companyData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menambah mitra.");
        }
    }
);

export const updateCompany = createAsyncThunk(
    "companies/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/companies/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal memperbarui mitra.");
        }
    }
);

export const deleteCompany = createAsyncThunk(
    "companies/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/companies/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal menghapus mitra.");
        }
    }
);

export const toggleCompanyVerified = createAsyncThunk(
    "companies/toggleVerified",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/companies/${id}/toggle-verified`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Gagal mengubah status verifikasi.");
        }
    }
);

const companySlice = createSlice({
    name: "companies",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompanies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCompanies.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCompanies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCompany.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            .addCase(updateCompany.fulfilled, (state, action) => {
                const index = state.data.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) state.data[index] = action.payload;
            })
            .addCase(deleteCompany.fulfilled, (state, action) => {
                state.data = state.data.filter((c) => c.id !== action.payload);
            })
            .addCase(toggleCompanyVerified.fulfilled, (state, action) => {
                const index = state.data.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) state.data[index] = action.payload;
            });
    },
});

export default companySlice.reducer;
