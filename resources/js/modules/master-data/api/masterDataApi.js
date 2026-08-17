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
    tagTypes: [
        'StudyProgram',
        'AcademicPeriod',
        'Student',
        'Lecturer',
        'KpCompany',
        'KpTheme',
        'DocumentType',
        'Room',
    ],
    keepUnusedDataFor: 600,
    endpoints: (builder) => ({
        // Study Program endpoints (program-studi -> study-program)
        getStudyPrograms: builder.query({
            query: () => '/study-program',
            providesTags: ['StudyProgram'],
        }),

        getLecturers: builder.query({
            query: (params) => ({
                url: '/lecturer',
                params,
            }),
            providesTags: ['Lecturer'],
        }),
        createLecturer: builder.mutation({
            query: (body) => ({
                url: '/lecturer',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Lecturer'],
        }),
        updateLecturer: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/lecturer/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Lecturer'],
        }),
        deleteLecturer: builder.mutation({
            query: (id) => ({
                url: `/lecturer/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Lecturer'],
        }),

        getStudents: builder.query({
            query: (params) => ({
                url: '/student',
                params,
            }),
            providesTags: ['Student'],
        }),
        createStudent: builder.mutation({
            query: (body) => ({
                url: '/student',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Student'],
        }),
        updateStudent: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/student/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Student'],
        }),
        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `/student/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Student'],
        }),

        getKpCompanies: builder.query({
            query: (params) => ({
                url: '/kp-company',
                params,
            }),
            providesTags: ['KpCompany'],
        }),
        createKpCompany: builder.mutation({
            query: (body) => ({
                url: '/kp-company',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['KpCompany'],
        }),
        updateKpCompany: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/kp-company/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['KpCompany'],
        }),
        deleteKpCompany: builder.mutation({
            query: (id) => ({
                url: `/kp-company/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['KpCompany'],
        }),

        getAcademicPeriods: builder.query({
            query: (params) => ({
                url: '/academic-period',
                params,
            }),
            providesTags: ['AcademicPeriod'],
        }),
        createAcademicPeriod: builder.mutation({
            query: (body) => ({
                url: '/academic-period',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AcademicPeriod'],
        }),
        updateAcademicPeriod: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/academic-period/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['AcademicPeriod'],
        }),
        deleteAcademicPeriod: builder.mutation({
            query: (id) => ({
                url: `/academic-period/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AcademicPeriod'],
        }),

        getKpThemes: builder.query({
            query: (params) => ({
                url: '/kp-theme',
                params,
            }),
            providesTags: ['KpTheme'],
        }),
        createKpTheme: builder.mutation({
            query: (body) => ({
                url: '/kp-theme',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['KpTheme'],
        }),
        updateKpTheme: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/kp-theme/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['KpTheme'],
        }),
        deleteKpTheme: builder.mutation({
            query: (id) => ({
                url: `/kp-theme/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['KpTheme'],
        }),

        // Document Type (jenis_dokumen_kp -> document_type)
        getDocumentTypes: builder.query({
            query: () => '/document-type',
            providesTags: ['DocumentType'],
        }),
        createDocumentType: builder.mutation({
            query: (body) => ({
                url: '/document-type',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['DocumentType'],
        }),
        updateDocumentType: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/document-type/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['DocumentType'],
        }),
        deleteDocumentType: builder.mutation({
            query: (id) => ({
                url: `/document-type/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['DocumentType'],
        }),

        // Room endpoints (ruangan -> room)
        getRooms: builder.query({
            query: () => '/room',
            providesTags: ['Room'],
        }),
        createRoom: builder.mutation({
            query: (body) => ({
                url: '/room',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Room'],
        }),
        updateRoom: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/room/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Room'],
        }),
        deleteRoom: builder.mutation({
            query: (id) => ({
                url: `/room/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Room'],
        }),
    }),
});

export const {
    useGetStudyProgramsQuery,
    useGetLecturersQuery,
    useCreateLecturerMutation,
    useUpdateLecturerMutation,
    useDeleteLecturerMutation,
    useGetStudentsQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
    useGetKpCompaniesQuery,
    useCreateKpCompanyMutation,
    useUpdateKpCompanyMutation,
    useDeleteKpCompanyMutation,
    useGetAcademicPeriodsQuery,
    useCreateAcademicPeriodMutation,
    useUpdateAcademicPeriodMutation,
    useDeleteAcademicPeriodMutation,
    useGetKpThemesQuery,
    useCreateKpThemeMutation,
    useUpdateKpThemeMutation,
    useDeleteKpThemeMutation,
    useGetDocumentTypesQuery,
    useCreateDocumentTypeMutation,
    useUpdateDocumentTypeMutation,
    useDeleteDocumentTypeMutation,
    useGetRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
} = masterDataApi;
