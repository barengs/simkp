import React, { useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "./store/slice/authSlice";
import { fetchPublicSettings } from "./store/slice/settingSlice";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PermissionGate from "./components/PermissionGate";

// Lazy load components
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const DashboardSwitcher = lazy(() => import("./components/DashboardSwitcher"));

// Feature-based components (reusable, permission-driven)
const InternshipGroupList = lazy(() => import("./components/InternshipGroupList"));
const LogbookMonitoring = lazy(() => import("./components/LogbookMonitoring"));
const ReportMonitoring = lazy(() => import("./components/ReportMonitoring"));
const EvaluationMonitoring = lazy(() => import("./components/EvaluationMonitoring"));
const InternshipGroupDetail = lazy(() => import("./pages/InternshipGroupDetail"));

// Admin specific
const PeriodManagement = lazy(() => import("./admin/Periods/PeriodManagement"));
const ThemeManagement = lazy(() => import("./admin/Themes/ThemeManagement"));
const StudentList = lazy(() => import("./admin/master/Students/StudentList"));
const CompanyList = lazy(() => import("./admin/master/Companies/CompanyList"));
const LecturerList = lazy(() => import("./admin/master/Lecturers/LecturerList"));
const RoleManagement = lazy(() => import("./admin/RoleManagement"));
const Settings = lazy(() => import("./admin/Settings/Settings"));
const KoordinatorTA = lazy(() => import("./admin/KoordinatorTA"));
const AdminActivity = lazy(() => import("./admin/Activities/ActivityIndex"));

// Student specific
const Registration = lazy(() => import("./student/Registration"));
const TARegistration = lazy(() => import("./student/TARegistration"));
const TABimbingan = lazy(() => import("./student/TABimbingan"));
const TASidang = lazy(() => import("./student/TASidang"));
const TAFinal = lazy(() => import("./student/TAFinal"));
const StudentProfile = lazy(() => import("./student/StudentProfile"));
const StudentLogbook = lazy(() => import("./student/Logbook"));
const StudentReport = lazy(() => import("./student/Reports/Report"));
const StudentEvaluation = lazy(() => import("./student/Evaluations/Evaluation"));
const StudentActivity = lazy(() => import("./student/Activities/ActivityIndex"));

// Dosen specific
const DosenActivity = lazy(() => import("./dosen/Activities/ActivityIndex"));
const LogbookValidation = lazy(() => import("./dosen/LogbookValidation"));

/**
 * ProtectedRoute - Requires authentication.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

/**
 * ProfileGuard - For mahasiswa, checks if profile is complete.
 */
const ProfileGuard = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    if (user?.role === "mahasiswa" && !user?.is_profile_complete && location.pathname !== "/student/profile") {
        return <Navigate to="/student/profile" replace />;
    }
    return children;
};

/**
 * GuestRoute - Only accessible when NOT authenticated.
 */
const GuestRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    if (isAuthenticated && user) return <Navigate to={user.redirect_url || "/"} replace />;
    return children;
};

const App = () => {
    const dispatch = useDispatch();
    const { initialLoading } = useSelector((state) => state.auth);
    const { publicSettings } = useSelector((state) => state.settings || { publicSettings: {} });

    useEffect(() => {
        dispatch(fetchCurrentUser());
        dispatch(fetchPublicSettings());
    }, [dispatch]);

    useEffect(() => {
        if (publicSettings.app_name) document.title = publicSettings.app_name;
    }, [publicSettings]);

    if (initialLoading) return null;

    return (
        <>
            <Suspense fallback={null}>
                <Routes>
                    {/* Guest Routes */}
                    <Route element={<GuestRoute><Outlet /></GuestRoute>}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Profile Completion */}
                    <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                        <Route path="/student/profile" element={<StudentProfile />} />
                    </Route>

                    {/* Protected Application Shell */}
                    <Route element={<ProtectedRoute><ProfileGuard><MainLayout /></ProfileGuard></ProtectedRoute>}>
                        {/* Dashboard */}
                        <Route index element={<DashboardSwitcher />} />

                        {/* Universal Features (permission-based) */}
                        <Route path="internship-groups">
                            <Route index element={<PermissionGate permission="view internships"><InternshipGroupList /></PermissionGate>} />
                            <Route path=":internship_id" element={<PermissionGate permission="view internships"><InternshipGroupDetail /></PermissionGate>} />
                        </Route>
                        <Route path="logbook-monitoring" element={<PermissionGate permission="view logbook monitoring"><LogbookMonitoring /></PermissionGate>} />
                        <Route path="report-monitoring" element={<PermissionGate permission="view kp reports"><ReportMonitoring /></PermissionGate>} />
                        <Route path="evaluation-recap" element={<PermissionGate permission="view evaluation recap"><EvaluationMonitoring /></PermissionGate>} />
                        <Route path="logbook-validation" element={<PermissionGate permission="validate logbook"><LogbookValidation /></PermissionGate>} />

                        {/* Admin Routes */}
                        <Route path="admin">
                            <Route path="period-management" element={<PermissionGate permission="manage periods"><PeriodManagement /></PermissionGate>} />
                            <Route path="theme-management" element={<PermissionGate permission="manage themes"><ThemeManagement /></PermissionGate>} />
                            <Route path="master-mahasiswa" element={<PermissionGate permission="manage master data"><StudentList /></PermissionGate>} />
                            <Route path="master/mitra" element={<PermissionGate permission="manage master data"><CompanyList /></PermissionGate>} />
                            <Route path="master/dosen" element={<PermissionGate permission="manage master data"><LecturerList /></PermissionGate>} />
                            <Route path="role-management" element={<PermissionGate permission="manage roles"><RoleManagement /></PermissionGate>} />
                            <Route path="settings" element={<PermissionGate permission="manage settings"><Settings /></PermissionGate>} />
                            <Route path="activities" element={<AdminActivity />} />
                            <Route path="koordinator-ta" element={<PermissionGate permission="manage ta"><KoordinatorTA /></PermissionGate>} />
                        </Route>

                        {/* Student Routes */}
                        <Route path="student">
                            <Route path="registration" element={<PermissionGate permission="student registration"><Registration /></PermissionGate>} />
                            <Route path="logbook" element={<PermissionGate permission="student logbook"><StudentLogbook /></PermissionGate>} />
                            <Route path="reports" element={<PermissionGate permission="student report"><StudentReport /></PermissionGate>} />
                            <Route path="evaluations" element={<PermissionGate permission="student evaluation"><StudentEvaluation /></PermissionGate>} />
                            <Route path="ta-registration" element={<PermissionGate permission="student ta"><TARegistration /></PermissionGate>} />
                            <Route path="ta-bimbingan" element={<PermissionGate permission="student ta"><TABimbingan /></PermissionGate>} />
                            <Route path="ta-sidang" element={<PermissionGate permission="student ta"><TASidang /></PermissionGate>} />
                            <Route path="ta-final" element={<PermissionGate permission="student ta"><TAFinal /></PermissionGate>} />
                            <Route path="activities" element={<PermissionGate permission="student logbook"><StudentActivity /></PermissionGate>} />
                        </Route>

                        {/* Dosen Routes */}
                        <Route path="dosen">
                            <Route path="activities" element={<DosenActivity />} />
                        </Route>

                        {/* Legacy Redirects (zero-downtime migration) */}
                        <Route path="admin/internship-groups" element={<Navigate to="/internship-groups" replace />} />
                        <Route path="admin/logbook" element={<Navigate to="/logbook-monitoring" replace />} />
                        <Route path="admin/reports" element={<Navigate to="/report-monitoring" replace />} />
                        <Route path="admin/evaluations" element={<Navigate to="/evaluation-recap" replace />} />
                        <Route path="dosen/internship-groups" element={<Navigate to="/internship-groups" replace />} />
                        <Route path="dosen/logbook" element={<Navigate to="/logbook-validation" replace />} />
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
            <ToastContainer autoClose={2500} />
        </>
    );
};

export default App;
