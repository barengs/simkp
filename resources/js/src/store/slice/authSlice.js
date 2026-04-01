import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// ── Thunks ──────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/login", credentials);
            if (response.data.status === "success") {
                const { token, user } = response.data;
                sessionStorage.setItem("AUTH_TOKEN", token);
                sessionStorage.setItem("USER_DATA", JSON.stringify(user));
                return user;
            }
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue(
                    error.response?.data?.message || "Email atau password salah."
                );
            }
            return rejectWithValue(
                error.response?.data?.message || "Login gagal. Silakan coba lagi."
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/register", formData);
            if (response.data.status === "success") {
                const { token, user } = response.data;
                sessionStorage.setItem("AUTH_TOKEN", token);
                sessionStorage.setItem("USER_DATA", JSON.stringify(user));
                return user;
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                const firstField = Object.keys(errors)[0];
                return rejectWithValue(errors[firstField][0]);
            }
            return rejectWithValue(
                error.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
            );
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            sessionStorage.removeItem("AUTH_TOKEN");
            sessionStorage.removeItem("USER_DATA");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { rejectWithValue }) => {
        const token = sessionStorage.getItem("AUTH_TOKEN");
        if (!token) {
            return rejectWithValue(null);
        }
        try {
            const response = await api.get("/auth/user");
            if (response.status === 200) {
                const userData = response.data;
                sessionStorage.setItem("USER_DATA", JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            sessionStorage.removeItem("AUTH_TOKEN");
            sessionStorage.removeItem("USER_DATA");
            return rejectWithValue(null);
        }
    }
);

export const completeProfile = createAsyncThunk(
    "auth/completeProfile",
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/complete-profile", profileData);
            if (response.data.status === "success") {
                const userData = response.data.user;
                sessionStorage.setItem("USER_DATA", JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                const firstField = Object.keys(errors)[0];
                return rejectWithValue(errors[firstField][0]);
            }
            return rejectWithValue(
                error.response?.data?.message || "Gagal melengkapi profil."
            );
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        initialLoading: false,
    },
    reducers: {
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // ── Login ──
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Register ──
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Logout ──
        builder
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            });

        // ── Fetch Current User (session restore) ──
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.initialLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.initialLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.initialLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            });

        // ── Complete Profile ──
        builder
            .addCase(completeProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(completeProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
