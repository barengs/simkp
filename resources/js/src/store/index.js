import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import studentReducer from './slice/studentSlice';
import periodReducer from "./slice/periodSlice";
import themeReducer from "./slice/themeSlice";
import lecturerReducer from "./slice/lecturerSlice";
import companyReducer from "./slice/companySlice";
import internshipReducer from "./slice/internshipSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    periods: periodReducer,
    themes: themeReducer,
    lecturers: lecturerReducer,
    companies: companyReducer,
    internships: internshipReducer,
  },
});
