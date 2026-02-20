import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import studentReducer from './slice/studentSlice';
import periodReducer from './slice/periodSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    periods: periodReducer,
  },
});

