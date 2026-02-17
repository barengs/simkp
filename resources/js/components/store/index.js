import { configureStore } from "@reduxjs/toolkit";
import periodReducer from "./slices/periodSlice";
import themeReducer from "./slices/themeSlice";
import lecturerReducer from "./slices/lecturerSlice";
import studentReducer from "./slices/studentSlice";
import companyReducer from "./slices/companySlice";
import internshipReducer from "./slices/internshipSlice";
import logbookReducer from "./slices/logbookSlice";

export const store = configureStore({
    reducer: {
        periods: periodReducer,
        themes: themeReducer,
        lecturers: lecturerReducer,
        students: studentReducer,
        companies: companyReducer,
        internships: internshipReducer,
        logbooks: logbookReducer,
    },
});

export default store;
