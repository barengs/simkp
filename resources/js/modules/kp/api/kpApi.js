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
    tagTypes: ['KpGroup', 'KpCompany', 'Logbook', 'Verifikasi', 'DocumentType', 'KpDocument', 'KpGrade', 'EvaluationCriteria', 'Plotting'],
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
            query: (params) => {
                if (typeof params === 'object' && params !== null) {
                    return { url: '/logbook', params };
                }
                return params ? `/logbook?group_id=${params}` : '/logbook';
            },
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

                if (body instanceof FormData) {
                    body.append('_method', 'PUT');
                    return { url: `/logbook/${id}`, method: 'POST', body };
                }

                return { url: `/logbook/${id}`, method: 'PUT', body };
            },
            invalidatesTags: ['Logbook'],
        }),
        deleteLogbook: builder.mutation({
            query: (id) => ({ url: `/logbook/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Logbook'],
        }),

        // ── Report ───────────────────────────────────────────────────────────────
        getReport: builder.query({
            query: (params) => {
                if (typeof params === 'object' && params !== null) {
                    return { url: '/report', params };
                }
                return params ? `/report?group_id=${params}` : '/report';
            },
            providesTags: ['Report'],
        }),
        createReport: builder.mutation({
            query: (body) => ({ url: '/report', method: 'POST', body }),
            invalidatesTags: ['Report'],
        }),
        updateReport: builder.mutation({
            query: (arg) => {
                const id = arg.id;
                let body = arg.body;
                if (!body) {
                    const { id: _, ...rest } = arg;
                    body = rest;
                }

                if (body instanceof FormData) {
                    body.append('_method', 'PUT');
                    return { url: `/report/${id}`, method: 'POST', body };
                }

                return { url: `/report/${id}`, method: 'PUT', body };
            },
            invalidatesTags: ['Report'],
        }),
        deleteReport: builder.mutation({
            query: (id) => ({ url: `/report/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Report'],
        }),

        // ── Kp Grade ─────────────────────────────────────────────────────────────
        getKpGrade: builder.query({
            query: (groupId) => groupId ? `/kp-grade?group_id=${groupId}` : '/kp-grade',
            providesTags: ['KpGrade'],
        }),
        createKpGrade: builder.mutation({
            query: (body) => ({ url: '/kp-grade', method: 'POST', body }),
            invalidatesTags: ['KpGrade'],
        }),
        updateKpGrade: builder.mutation({
            query: (arg) => {
                const id = arg.id;
                let body = arg.body;
                if (!body) {
                    const { id: _, ...rest } = arg;
                    body = rest;
                }
                return { url: `/kp-grade/${id}`, method: 'PUT', body };
            },
            invalidatesTags: ['KpGrade'],
        }),
        deleteKpGrade: builder.mutation({
            query: (id) => ({ url: `/kp-grade/${id}`, method: 'DELETE' }),
            invalidatesTags: ['KpGrade'],
        }),
        createGroupGrade: builder.mutation({
            query: (body) => ({ url: '/kp-grade/group', method: 'POST', body }),
            invalidatesTags: ['KpGrade', 'KpGroup'],
        }),
        getSupervisedGroups: builder.query({
            query: () => '/kp-grade/supervised-groups',
            providesTags: ['KpGrade'],
        }),

        // ── Evaluation Criteria ──────────────────────────────────────────────────
        getEvaluationCriteria: builder.query({
            query: () => '/evaluation-criteria',
            providesTags: ['EvaluationCriteria'],
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
        removeGroupMember: builder.mutation({
            query: ({ groupId, memberId }) => ({
                url: `/registration-verification/${groupId}/members/${memberId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Verifikasi', 'KpGroup'],
        }),
        addGroupMember: builder.mutation({
            query: ({ groupId, studentId }) => ({
                url: `/registration-verification/${groupId}/members`,
                method: 'POST',
                body: { student_id: studentId },
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

        // ── Approval Dokumen ──────────────────────────────────────────────────
        approveKpDocument: builder.mutation({
            query: (id) => ({ url: `/kp-document/${id}/approve`, method: 'POST' }),
            invalidatesTags: ['KpDocument', 'KpGroup'],
        }),
        rejectKpDocument: builder.mutation({
            query: (id) => ({ url: `/kp-document/${id}/reject`, method: 'POST' }),
            invalidatesTags: ['KpDocument', 'KpGroup'],
        }),
        submitDocumentRevision: builder.mutation({
            query: ({ groupId, documentId, notes }) => ({
                url: `/kp-document/${documentId}/revise`,
                method: 'POST',
                body: { notes, group_id: groupId },
            }),
            invalidatesTags: ['KpDocument', 'KpGroup'],
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
    useGetReportQuery,
    useCreateReportMutation,
    useUpdateReportMutation,
    useDeleteReportMutation,
    useGetKpGradeQuery,
    useCreateKpGradeMutation,
    useUpdateKpGradeMutation,
    useDeleteKpGradeMutation,
    useCreateGroupGradeMutation,
    useGetSupervisedGroupsQuery,
    useGetEvaluationCriteriaQuery,
    useGetVerifikasiQuery,
    useUpdateVerifikasiMutation,
    useRemoveGroupMemberMutation,
    useAddGroupMemberMutation,
    useGetUnassignedGroupsQuery,
    useGetAssignedGroupsQuery,
    useGetAvailableLecturersQuery,
    useGetMyAssignedGroupsQuery,
    useAssignSupervisorMutation,
    useRemoveSupervisorMutation,
    useUploadKpDocumentMutation,
    useDeleteKpDocumentMutation,
    useApproveKpDocumentMutation,
    useRejectKpDocumentMutation,
    useSubmitDocumentRevisionMutation,
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
