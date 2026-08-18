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
        return await baseQuery(args, api, extraOptions);
    }
    return result;
};

export const pengaturanApi = createApi({
    reducerPath: 'pengaturanApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['DocumentType', 'Setting', 'Profile'],
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({
        // Tipe Dokumen KP
        getDocumentTypes: builder.query({
            query: () => '/document-type',
            providesTags: ['DocumentType'],
        }),
        getDocumentTypeById: builder.query({
            query: (id) => `/document-type/${id}`,
            providesTags: (result, error, id) => [{ type: 'DocumentType', id }],
        }),
        createDocumentType: builder.mutation({
            query: (body) => ({ url: '/document-type', method: 'POST', body }),
            invalidatesTags: ['DocumentType'],
        }),
        updateDocumentType: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/document-type/${id}`, method: 'PUT', body }),
            invalidatesTags: ['DocumentType'],
        }),
        deleteDocumentType: builder.mutation({
            query: (id) => ({ url: `/document-type/${id}`, method: 'DELETE' }),
            invalidatesTags: ['DocumentType'],
        }),

        // Pengaturan Aplikasi (public - untuk sidebar/logo)
        getPublicSettings: builder.query({
            query: () => '/setting/public',
            providesTags: ['Setting'],
        }),
        getSettings: builder.query({
            query: () => '/setting',
            providesTags: ['Setting'],
        }),
        updateSettings: builder.mutation({
            query: (body) => {
                const formData = body instanceof FormData ? body : new FormData();
                if (!(body instanceof FormData)) {
                    Object.entries(body).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            formData.append(key, value);
                        }
                    });
                }

                if (formData instanceof FormData && !formData.has('_method')) {
                    formData.append('_method', 'PUT');
                }

                return {
                    url: '/setting',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Setting'],
        }),

        // Profile
        updateProfile: builder.mutation({
            query: (arg) => {
                const body = arg instanceof FormData ? arg : new FormData();
                if (!(arg instanceof FormData)) {
                    Object.entries(arg).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            body.append(key, value);
                        }
                    });
                }

                if (body instanceof FormData && !body.has('_method')) {
                    body.append('_method', 'PUT');
                }

                return {
                    url: '/user/profile',
                    method: 'POST',
                    body,
                };
            },
            invalidatesTags: ['Profile'],
        }),
    }),
});

export const {
    useGetDocumentTypesQuery,
    useGetDocumentTypeByIdQuery,
    useCreateDocumentTypeMutation,
    useUpdateDocumentTypeMutation,
    useDeleteDocumentTypeMutation,
    useGetPublicSettingsQuery,
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useUpdateProfileMutation,
} = pengaturanApi;
