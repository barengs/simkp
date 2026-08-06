import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        roles: [],
        permissions: [],
        isAuthenticated: false,
        loading: false,
    },
    reducers: {
        login: (state, action) => {
            state.user = action.payload.user;
            state.roles = action.payload.roles || [];
            state.permissions = action.payload.permissions || [];
            state.isAuthenticated = true;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.roles = [];
            state.permissions = [];
            state.isAuthenticated = false;
            state.loading = false;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.roles = action.payload.roles || [];
            state.permissions = action.payload.permissions || [];
            state.isAuthenticated = true;
        },
    },
});

export const { login, logout, setLoading, setCredentials } = authSlice.actions;
export default authSlice.reducer;
