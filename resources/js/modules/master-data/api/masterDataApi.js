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

export const masterDataApi = createApi({
    reducerPath: 'masterDataApi',
    baseQuery,
    tagTypes: [
        'ProgramStudi',
        'PeriodeAkademik',
        'Mahasiswa',
        'Dosen',
        'PerusahaanKp',
        'TemaKp',
    ],
    keepUnusedDataFor: 600, // master data jarang berubah, cache 10 menit
    endpoints: (builder) => ({
        // Dosen
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

        // Mahasiswa
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

        // Perusahaan KP
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

        // Periode Akademik
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

        // Tema KP
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

        // Program Studi
        getProgramStudi: builder.query({
            query: () => '/program-studi',
            providesTags: ['ProgramStudi'],
        }),
        createProgramStudi: builder.mutation({
            query: (body) => ({
                url: '/program-studi',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ProgramStudi'],
        }),
        updateProgramStudi: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/program-studi/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['ProgramStudi'],
        }),
        deleteProgramStudi: builder.mutation({
            query: (id) => ({
                url: `/program-studi/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProgramStudi'],
        }),
    }),
});

export const {
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
    useGetProgramStudiQuery,
    useCreateProgramStudiMutation,
    useUpdateProgramStudiMutation,
    useDeleteProgramStudiMutation,
} = masterDataApi;
