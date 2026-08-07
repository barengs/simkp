// resources/js/modules/master-data/api/lecturerApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const lecturerApi = createApi({
  reducerPath: 'lecturerApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include'
  }),
  tagTypes: ['Lecturer'],
  endpoints: (builder) => ({
    getLecturers: builder.query({
      query: () => 'lecturer',
      providesTags: ['Lecturer']
    }),
    getLecturerById: builder.query({
      query: (id) => `lecturer/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lecturer', id }]
    }),
    createLecturer: builder.mutation({
      query: (lecturer) => ({
        url: 'lecturer',
        method: 'POST',
        body: lecturer
      }),
      invalidatesTags: ['Lecturer']
    }),
    updateLecturer: builder.mutation({
      query: ({ id, ...changes }) => ({
        url: `lecturer/${id}`,
        method: 'PUT',
        body: changes
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Lecturer', id }]
    }),
    deleteLecturer: builder.mutation({
      query: (id) => ({
        url: `lecturer/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Lecturer']
    }),
  }),
});

export const {
  useGetLecturersQuery,
  useGetLecturerByIdQuery,
  useCreateLecturerMutation,
  useUpdateLecturerMutation,
  useDeleteLecturerMutation
} = lecturerApi;
