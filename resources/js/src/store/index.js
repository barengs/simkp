import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import studentReducer from './slice/studentSlice';
import periodReducer from "./slice/periodSlice";
import themeReducer from "./slice/themeSlice";
import lecturerReducer from "./slice/lecturerSlice";
import companyReducer from "./slice/companySlice";
import internshipReducer from "./slice/internshipSlice";
import adminInternshipReducer from "./slice/adminInternshipSlice";
import logbookReducer from "./slice/logbookSlice";
import reportReducer from './slice/reportSlice';

const appReducer = combineReducers({
  auth: authReducer,
  students: studentReducer,
  periods: periodReducer,
  themes: themeReducer,
  lecturers: lecturerReducer,
  companies: companyReducer,
  internships: internshipReducer,
  adminInternships: adminInternshipReducer,
  logbooks: logbookReducer,
  reports: reportReducer,
});

const rootReducer = (state, action) => {
  // Clear all Redux state upon logout to prevent data leak between accounts
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/logout/rejected') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
