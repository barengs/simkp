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

export const kpApi = createApi({
    reducerPath: 'kpApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['KpGroup', 'KpCompany', 'Logbook', 'Verifikasi', 'DocumentType', 'KpDocument'],
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({

        // ── Kelompok KP ────────────────────────────────────────────────────────
        getKpGroups: builder.query({
            query: () => '/kp-group',
            providesTags: ['KpGroup'],
        }),
        getKpGroupById: builder.query({
            query: (id) => `/kp-group/${id}`,
            providesTags: (result, error, id) => [{ type: 'KpGroup', id }],
        }),
        createKpGroup: builder.mutation({
            query: (body) => ({ url: '/kp-group', method: 'POST', body }),
            invalidatesTags: ['KpGroup'],
        }),
        updateKpGroup: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/kp-group/${id}`, method: 'PUT', body }),
            invalidatesTags: ['KpGroup'],
        }),
        deleteKpGroup: builder.mutation({
            query: (id) => ({ url: `/kp-group/${id}`, method: 'DELETE' }),
            invalidatesTags: ['KpGroup'],
        }),
        acceptInvitation: builder.mutation({
            query: (id) => ({ url: `/kp-group/${id}/accept-invitation`, method: 'POST' }),
            invalidatesTags: ['KpGroup'],
        }),
        declineInvitation: builder.mutation({
            query: (id) => ({ url: `/kp-group/${id}/decline-invitation`, method: 'POST' }),
            invalidatesTags: ['KpGroup'],
        }),

        // ── Propose perusahaan baru (mahasiswa, tanpa master-data.manage) ─────
        proposeKpCompany: builder.mutation({
            query: (body) => ({ url: '/kp-company/propose', method: 'POST', body }),
            // Invalidate cache KpCompany di masterDataApi agar list langsung update
            // (cross-slice invalidation tidak langsung, tapi cukup untuk refetch)
            invalidatesTags: ['KpCompany'],
        }),

        // ── Tipe Dokumen ───────────────────────────────────────────────────────
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

        // ── Logbook ────────────────────────────────────────────────────────────
        getLogbook: builder.query({
            query: (groupId) => groupId ? `/logbook?group_id=${groupId}` : '/logbook',
            providesTags: ['Logbook'],
        }),
        createLogbook: builder.mutation({
            query: (body) => ({ url: '/logbook', method: 'POST', body }),
            invalidatesTags: ['Logbook'],
        }),
        updateLogbook: builder.mutation({
            query: (arg) => {
                const id = arg.id;
                let body = arg.body;
                if (!body) {
                    const { id: _, ...rest } = arg;
                    body = rest;
                }
                return { url: `/logbook/${id}`, method: 'PUT', body };
            },
            invalidatesTags: ['Logbook'],
        }),
        deleteLogbook: builder.mutation({
            query: (id) => ({ url: `/logbook/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Logbook'],
        }),

        // ── Verifikasi Pendaftaran ─────────────────────────────────────────────
        getVerifikasi: builder.query({
            query: () => '/registration-verification',
            providesTags: ['Verifikasi'],
        }),
        updateVerifikasi: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/registration-verification/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Verifikasi', 'KpGroup'],
        }),

        // ── Plotting Dosen Pembimbing ──────────────────────────────────────────
        getUnassignedGroups: builder.query({
            query: () => '/kp-plotting/groups/unassigned',
            providesTags: ['Plotting'],
        }),
        getAssignedGroups: builder.query({
            query: () => '/kp-plotting/groups/assigned',
            providesTags: ['Plotting'],
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
            keepUnusedDataFor: 0,
            async onQueryStarted(_args, { queryFulfilled }) {
                await queryFulfilled;
            },
        }),
        getAvailableLecturers: builder.query({
            query: () => '/kp-plotting/lecturers',
            providesTags: ['Plotting'],
        }),
        getMyAssignedGroups: builder.query({
            query: () => '/kp-plotting/my-groups',
            providesTags: ['Plotting'],
            refetchOnMountOrArgChange: true,
            refetchOnFocus: true,
            refetchOnReconnect: true,
            keepUnusedDataFor: 0,
            async onQueryStarted(_args, { queryFulfilled }) {
                await queryFulfilled;
            },
        }),
        assignSupervisor: builder.mutation({
            query: (body) => ({ url: '/kp-plotting/assign', method: 'POST', body }),
            invalidatesTags: ['Plotting', 'KpGroup'],
        }),
        removeSupervisor: builder.mutation({
            query: (kpGroupId) => ({ url: `/kp-plotting/groups/${kpGroupId}/remove`, method: 'DELETE' }),
            invalidatesTags: ['Plotting', 'KpGroup'],
        }),

        // ── Upload Dokumen KP ──────────────────────────────────────────────────
        uploadKpDocument: builder.mutation({
            query: (formData) => ({
                url: '/kp-document',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['KpDocument'],
        }),
        deleteKpDocument: builder.mutation({
            query: (id) => ({ url: `/kp-document/${id}`, method: 'DELETE' }),
            invalidatesTags: ['KpDocument'],
        }),
    }),
});

export const {
    useGetKpGroupsQuery,
    useGetKpGroupByIdQuery,
    useCreateKpGroupMutation,
    useUpdateKpGroupMutation,
    useDeleteKpGroupMutation,
    useProposeKpCompanyMutation,
    useGetDocumentTypesQuery,
    useGetDocumentTypeByIdQuery,
    useCreateDocumentTypeMutation,
    useUpdateDocumentTypeMutation,
    useDeleteDocumentTypeMutation,
    useGetLogbookQuery,
    useCreateLogbookMutation,
    useUpdateLogbookMutation,
    useDeleteLogbookMutation,
    useGetVerifikasiQuery,
    useUpdateVerifikasiMutation,
    useGetUnassignedGroupsQuery,
    useGetAssignedGroupsQuery,
    useGetAvailableLecturersQuery,
    useGetMyAssignedGroupsQuery,
    useAssignSupervisorMutation,
    useRemoveSupervisorMutation,
    useUploadKpDocumentMutation,
    useDeleteKpDocumentMutation,
    useAcceptInvitationMutation,
    useDeclineInvitationMutation,
} = kpApi;

// Alias lama agar tidak breaking pages lain yang masih pakai nama lama
export const {
    useGetKpGroupsQuery   : useGetKelompokKpQuery,
    useCreateKpGroupMutation : useCreateKelompokKpMutation,
    useUpdateKpGroupMutation : useUpdateKelompokKpMutation,
    useDeleteKpGroupMutation : useDeleteKelompokKpMutation,
} = kpApi;
