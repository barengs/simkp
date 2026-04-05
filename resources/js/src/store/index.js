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
import evaluationReducer from './slice/evaluationSlice';
import settingReducer from './slice/settingSlice';
import activityReducer from './slice/activitySlice';

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
  evaluations: evaluationReducer,
  settings: settingReducer,
  activities: activityReducer,
});

const rootReducer = (state, action) => {
  // Clear all Redux state upon logout to prevent data leak between accounts
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/logout/rejected') {
    const publicSettings = state?.settings?.publicSettings;
    state = undefined;
    if (publicSettings) {
        // Re-inject public settings into the initial state
        state = { settings: { publicSettings, allSettings: [], loading: false, error: null } };
    }
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
