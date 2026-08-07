import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import axios from 'axios';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
        headers.set('Accept', 'application/json');
        headers.set('X-Requested-With', 'XMLHttpRequest');

        // Get CSRF token from cookie
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

// Wrap baseQuery to handle CSRF token mismatch errors
const baseQueryWithReauth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 419) {
        // CSRF token mismatch - refresh token and retry
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        const retryResult = await baseQuery(args, api, extraOptions);
        return retryResult;
    }

    return result;
};

export const masterDataApi = createApi({
    reducerPath: 'masterDataApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['ProgramStudi', 'PeriodeAkademik', 'Mahasiswa', 'Dosen', 'PerusahaanKp', 'TemaKp'],
    keepUnusedDataFor: 600,
    endpoints: (builder) => ({
        // Program Studi endpoints (added missing endpoint)
        getProgramStudi: builder.query({
            query: () => '/program-studi',
            providesTags: ['ProgramStudi'],
        }),

        // Dosen endpoints
        getDosen: builder.query({
            query: () => '/dosen',
            providesTags: ['Dosen'],
        }),
        createDosen: builder.mutation({
            query: (body) => ({
                url: '/dosen',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Dosen'],
        }),
        updateDosen: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/dosen/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Dosen'],
        }),
        deleteDosen: builder.mutation({
            query: (id) => ({
                url: `/dosen/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Dosen'],
        }),

        // Mahasiswa endpoints
        getMahasiswa: builder.query({
            query: () => '/mahasiswa',
            providesTags: ['Mahasiswa'],
        }),
        createMahasiswa: builder.mutation({
            query: (body) => ({
                url: '/mahasiswa',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Mahasiswa'],
        }),
        updateMahasiswa: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/mahasiswa/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Mahasiswa'],
        }),
        deleteMahasiswa: builder.mutation({
            query: (id) => ({
                url: `/mahasiswa/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Mahasiswa'],
        }),

        // Perusahaan KP endpoints
        getPerusahaanKp: builder.query({
            query: () => '/perusahaan-kp',
            providesTags: ['PerusahaanKp'],
        }),
        createPerusahaanKp: builder.mutation({
            query: (body) => ({
                url: '/perusahaan-kp',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PerusahaanKp'],
        }),
        updatePerusahaanKp: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/perusahaan-kp/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['PerusahaanKp'],
        }),
        deletePerusahaanKp: builder.mutation({
            query: (id) => ({
                url: `/perusahaan-kp/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PerusahaanKp'],
        }),

        // Periode Akademik endpoints
        getPeriodeAkademik: builder.query({
            query: () => '/periode-akademik',
            providesTags: ['PeriodeAkademik'],
        }),
        createPeriodeAkademik: builder.mutation({
            query: (body) => ({
                url: '/periode-akademik',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['PeriodeAkademik'],
        }),
        updatePeriodeAkademik: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/periode-akademik/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['PeriodeAkademik'],
        }),
        deletePeriodeAkademik: builder.mutation({
            query: (id) => ({
                url: `/periode-akademik/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PeriodeAkademik'],
        }),

        // Tema KP endpoints
        getTemaKp: builder.query({
            query: () => '/tema-kp',
            providesTags: ['TemaKp'],
        }),
        createTemaKp: builder.mutation({
            query: (body) => ({
                url: '/tema-kp',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['TemaKp'],
        }),
        updateTemaKp: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/tema-kp/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['TemaKp'],
        }),
        deleteTemaKp: builder.mutation({
            query: (id) => ({
                url: `/tema-kp/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TemaKp'],
        }),
    }),
});

export const {
    useGetProgramStudiQuery,  // Added missing export
    useGetDosenQuery,
    useCreateDosenMutation,
    useUpdateDosenMutation,
    useDeleteDosenMutation,
    useGetMahasiswaQuery,
    useCreateMahasiswaMutation,
    useUpdateMahasiswaMutation,
    useDeleteMahasiswaMutation,
    useGetPerusahaanKpQuery,
    useCreatePerusahaanKpMutation,
    useUpdatePerusahaanKpMutation,
    useDeletePerusahaanKpMutation,
    useGetPeriodeAkademikQuery,
    useCreatePeriodeAkademikMutation,
    useUpdatePeriodeAkademikMutation,
    useDeletePeriodeAkademikMutation,
    useGetTemaKpQuery,
    useCreateTemaKpMutation,
    useUpdateTemaKpMutation,
    useDeleteTemaKpMutation,
} = masterDataApi;
