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
    tagTypes: ['DocumentType'],
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
    }),
});

export const {
    useGetDocumentTypesQuery,
    useGetDocumentTypeByIdQuery,
    useCreateDocumentTypeMutation,
    useUpdateDocumentTypeMutation,
    useDeleteDocumentTypeMutation,
} = pengaturanApi;
