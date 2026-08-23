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

export const taApi = createApi({
    reducerPath: 'taApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['TugasAkhir'],
    keepUnusedDataFor: 120,  // data transaksional, cache lebih pendek
    endpoints: (builder) => ({

        // ── Pengajuan Tugas Akhir ─────────────────────────────────────────────
        // GET  /api/ta/pengajuan  — mahasiswa: ambil pengajuan milik sendiri
        //                        — koordinator/dosen: semua antrean (+ filter ?status=pengajuan)
        getPengajuan: builder.query({
            query: (params) => params
                ? { url: '/ta/pengajuan', params }
                : '/ta/pengajuan',
            providesTags: ['TugasAkhir'],
        }),

        // POST /api/ta/pengajuan  — mahasiswa mengajukan judul baru
        createPengajuan: builder.mutation({
            query: (body) => ({ url: '/ta/pengajuan', method: 'POST', body }),
            invalidatesTags: ['TugasAkhir'],
        }),

        // ── Verifikasi Judul (Koordinator) ────────────────────────────────────
        // GET  /api/ta/pengajuan?status=pengajuan — get antrean verifikasi
        getVerifikasiQueue: builder.query({
            query: () => ({ url: '/ta/pengajuan', params: { status: 'pengajuan' } }),
            providesTags: ['TugasAkhir'],
            keepUnusedDataFor: 60,
        }),

        // PUT /api/ta/pengajuan/{id}/verifikasi-judul  — setujui / tolak dengan catatan
        verifyJudul: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/ta/pengajuan/${id}/verifikasi-judul`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['TugasAkhir'],
        }),

        // ── Plotting Dosen Pembimbing TA (Koordinator) ────────────────────────
        // GET  /api/ta/pengajuan?status=bimbingan — TA yang perlu/sudah di-plot
        getAntreanPlotting: builder.query({
            query: () => ({ url: '/ta/pengajuan', params: { status: 'bimbingan' } }),
            providesTags: ['TugasAkhir'],
            keepUnusedDataFor: 60,
        }),

        // PUT /api/ta/pengajuan/{id}/plotting-dosen  — tetapkan dosen pembimbing
        assignSupervisorTA: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/ta/pengajuan/${id}/plotting-dosen`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['TugasAkhir'],
        }),

        // ── Bimbingan TA ────────────────────────────────────────────────────────
        // GET  /api/ta/bimbingan/{finalProjectId}  — ambil catatan bimbingan
        getBimbingan: builder.query({
            query: (finalProjectId) => `/ta/bimbingan/${finalProjectId}`,
            providesTags: (result, error, finalProjectId) => [
                { type: 'Bimbingan', id: finalProjectId },
            ],
            keepUnusedDataFor: 60,
        }),

        // POST /api/ta/bimbingan/{finalProjectId}  — tambah catatan bimbingan
        addBimbingan: builder.mutation({
            query: ({ finalProjectId, ...body }) => {
                const formData = body instanceof FormData ? body : new FormData();
                if (!(body instanceof FormData)) {
                    Object.entries(body).forEach(([key, value]) => {
                        if (value !== null && value !== undefined) {
                            formData.append(key, value);
                        }
                    });
                }
                return {
                    url: `/ta/bimbingan/${finalProjectId}`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, finalProjectId) => [
                { type: 'Bimbingan', id: finalProjectId },
                'TugasAkhir',
            ],
        }),

        // PUT /api/ta/bimbingan/{finalProjectId}/{bimbinganId}  — update catatan
        updateBimbingan: builder.mutation({
            query: ({ finalProjectId, bimbinganId, ...body }) => {
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
                    url: `/ta/bimbingan/${finalProjectId}/${bimbinganId}`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { finalProjectId }) => [
                { type: 'Bimbingan', id: finalProjectId },
            ],
        }),

        // DELETE /api/ta/bimbingan/{finalProjectId}/{bimbinganId}  — hapus catatan
        deleteBimbingan: builder.mutation({
            query: ({ finalProjectId, bimbinganId }) => ({
                url: `/ta/bimbingan/${finalProjectId}/${bimbinganId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { finalProjectId }) => [
                { type: 'Bimbingan', id: finalProjectId },
            ],
        }),

    }),
});

export const {
    // Pengajuan
    useGetPengajuanQuery,
    useCreatePengajuanMutation,

    // Verifikasi Judul
    useGetVerifikasiQueueQuery,
    useVerifyJudulMutation,

    // Plotting
    useGetAntreanPlottingQuery,
    useAssignSupervisorTAMutation,

    // Bimbingan
    useGetBimbinganQuery,
    useAddBimbinganMutation,
    useUpdateBimbinganMutation,
    useDeleteBimbinganMutation,

} = taApi;
