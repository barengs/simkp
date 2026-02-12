import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../src/api';

export const fetchStudents = createAsyncThunk(
    'students/fetchStudents',
    async ({ page = 1, perPage = 10, search = '' }, { rejectWithValue }) => {
        try {
            const response = await api.get('/students', {
                params: { page, per_page: perPage, search }
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data mahasiswa');
        }
    },
    {
        condition: ({ page = 1, perPage = 10, search = '' }, { getState }) => {
            const { students } = getState();
            if (!students.forceRefetch && 
                students.students.length > 0 && 
                students.lastParams?.page === page && 
                students.lastParams?.per_page === perPage && 
                students.lastParams?.search === search
            ) {
                return false; 
            }
        }
    }
);

export const createStudent = createAsyncThunk(
    'students/createStudent',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post('/students', formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan mahasiswa');
        }
    }
);

export const updateStudent = createAsyncThunk(
    'students/updateStudent',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/students/${id}`, formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal memperbarui mahasiswa');
        }
    }
);

export const deleteStudent = createAsyncThunk(
    'students/deleteStudent',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/students/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Gagal menghapus mahasiswa');
        }
    }
);

const initialState = {
    students: [],
    pagination: {
        total: 0,
        per_page: 10,
        current_page: 1,
        last_page: 1,
    },
    loading: false,
    initialLoading: true,
    error: null,
    lastParams: null,
    forceRefetch: false,
};

const studentSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        setForceRefetch: (state, action) => {
            state.forceRefetch = action.payload;
        },
        resetInitialLoading: (state) => {
            state.initialLoading = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.initialLoading = false;
                if (action.payload === null) return;

                state.students = action.payload.data;
                state.pagination = {
                    total: action.payload.total,
                    per_page: action.payload.per_page,
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page,
                };
                state.lastParams = {
                    page: action.payload.current_page,
                    per_page: action.payload.per_page,
                    search: action.meta.arg.search || '',
                };
                state.forceRefetch = false;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.initialLoading = false;
                state.error = action.payload;
            })
            .addCase(createStudent.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParams = null;
            })
            .addCase(updateStudent.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParams = null;
            })
            .addCase(deleteStudent.fulfilled, (state) => {
                state.forceRefetch = true;
                state.lastParams = null;
            });
    },
});

export const { setForceRefetch, resetInitialLoading } = studentSlice.actions;
export default studentSlice.reducer;
