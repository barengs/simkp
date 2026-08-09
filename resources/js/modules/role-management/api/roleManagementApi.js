import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Accept', 'application/json');
        headers.set('X-Requested-With', 'XMLHttpRequest');

        const csrfToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        if (csrfToken) {
            headers.set('X-XSRF-TOKEN', decodeURIComponent(csrfToken));
        }

        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 419) {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        const retryResult = await baseQuery(args, api, extraOptions);
        return retryResult;
    }

    return result;
};

export const roleManagementApi = createApi({
    reducerPath: 'roleManagementApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Role', 'Permission'],
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: () => '/role',
            providesTags: ['Role'],
        }),
        getRole: builder.query({
            query: (id) => `/role/${id}`,
            providesTags: ['Role'],
        }),
        createRole: builder.mutation({
            query: (body) => ({
                url: '/role',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Role'],
        }),
        updateRole: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/role/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Role'],
        }),
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/role/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Role'],
        }),
        getPermissions: builder.query({
            query: () => '/permission',
            providesTags: ['Permission'],
        }),
    }),
});

export const {
    useGetRolesQuery,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetPermissionsQuery,
} = roleManagementApi;
