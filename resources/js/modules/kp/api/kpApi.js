import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Accept', 'application/json');
        headers.set('X-Requested-With', 'XMLHttpRequest');
        return headers;
    },
});

export const kpApi = createApi({
    reducerPath: 'kpApi',
    baseQuery,
    tagTypes: ['KelompokKp', 'Logbook', 'Verifikasi'],
    // Data transaksional: cache sedang (5 menit)
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({
        getKelompokKp: builder.query({
            query: () => '/kelompok-kp',
            providesTags: ['KelompokKp'],
        }),
        getKelompokKpById: builder.query({
            query: (id) => `/kelompok-kp/${id}`,
            providesTags: (result, error, id) => [{ type: 'KelompokKp', id }],
        }),
        createKelompokKp: builder.mutation({
            query: (body) => ({
                url: '/kelompok-kp',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['KelompokKp'],
        }),
        updateKelompokKp: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/kelompok-kp/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['KelompokKp'],
        }),
        deleteKelompokKp: builder.mutation({
            query: (id) => ({
                url: `/kelompok-kp/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['KelompokKp'],
        }),

        // Logbook
        getLogbook: builder.query({
            query: () => '/logbook',
            providesTags: ['Logbook'],
        }),
        createLogbook: builder.mutation({
            query: (body) => ({
                url: '/logbook',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Logbook'],
        }),
        updateLogbook: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/logbook/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Logbook'],
        }),
        deleteLogbook: builder.mutation({
            query: (id) => ({
                url: `/logbook/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Logbook'],
        }),

        // Verifikasi Pendaftaran
        getVerifikasi: builder.query({
            query: () => '/verifikasi-pendaftaran',
            providesTags: ['Verifikasi'],
        }),
        updateVerifikasi: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/verifikasi-pendaftaran/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Verifikasi', 'KelompokKp'],
        }),
    }),
});

export const {
    useGetKelompokKpQuery,
    useGetKelompokKpByIdQuery,
    useCreateKelompokKpMutation,
    useUpdateKelompokKpMutation,
    useDeleteKelompokKpMutation,
    useGetLogbookQuery,
    useCreateLogbookMutation,
    useUpdateLogbookMutation,
    useDeleteLogbookMutation,
    useGetVerifikasiQuery,
    useUpdateVerifikasiMutation,
} = kpApi;
