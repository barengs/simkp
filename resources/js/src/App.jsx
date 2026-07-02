
import React, { useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "./store/slice/authSlice";
import { fetchPublicSettings } from "./store/slice/settingSlice";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load components
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AdminDashboard = lazy(() => import("./admin/Dashboard"));
const DosenDashboard = lazy(() => import("./dosen/Dashboard"));
const StudentDashboard = lazy(() => import("./student/Dashboard"));
const PeriodManagement = lazy(() => import("./admin/Periods/PeriodManagement"));
const ThemeManagement = React.lazy(() => import("./admin/Themes/ThemeManagement"));
const LecturerList = React.lazy(() => import("./admin/master/Lecturers/LecturerList"));
const StudentList = lazy(() => import("./admin/master/Students/StudentList"));
const CompanyList = React.lazy(() => import("./admin/master/Companies/CompanyList"));
const Registration = lazy(() => import("./student/Registration"));
const TARegistration = lazy(() => import("./student/TARegistration"));
const StudentProfile = lazy(() => import("./student/StudentProfile"));
const StudentLogbook = lazy(() => import("./student/Logbooks/Logbook"));
const DosenLogbook = lazy(() => import("./dosen/Logbooks/Logbook"));
const AdminLogbook = lazy(() => import("./admin/Logbooks/Logbook"));
const StudentReport = lazy(() => import("./student/Reports/Report"));
const DosenReport = lazy(() => import("./dosen/Reports/Report"));
const AdminReport = lazy(() => import("./admin/Reports/Report"));
const StudentEvaluation = lazy(() => import("./student/Evaluations/Evaluation"));
const DosenEvaluation = lazy(() => import("./dosen/Evaluations/Evaluation"));
const AdminEvaluation = lazy(() => import("./admin/Evaluations/Evaluation"));
const AdminInternshipGroups = lazy(() => import("./admin/Internships/InternshipList"));
const DosenInternshipGroups = lazy(() => import("./dosen/Internships/InternshipList"));
const InternshipGroupDetail = lazy(() => import("./pages/InternshipGroupDetail"));
const Settings = lazy(() => import("./admin/Settings/Settings"));
const AdminActivity = lazy(() => import("./admin/Activities/ActivityIndex"));
const DosenActivity = lazy(() => import("./dosen/Activities/ActivityIndex"));
const StudentActivity = lazy(() => import("./student/Activities/ActivityIndex"));



/**
 * ProtectedRoute - Requires authentication.
 * Redirects to /login if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * ProfileGuard - For mahasiswa, checks if profile is complete.
 * If not, redirects to /student/profile.
 * Allows access to /student/profile itself.
 */
const ProfileGuard = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (
        user?.role === "mahasiswa" &&
        !user?.is_profile_complete &&
        location.pathname !== "/student/profile"
    ) {
        return <Navigate to="/student/profile" replace />;
    }

    return children;
};

/**
 * GuestRoute - Only accessible when NOT authenticated.
 */
const GuestRoute = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    if (isAuthenticated && user) {
        return <Navigate to={user.redirect_url || "/"} replace />;
    }

    return children;
};

/**
 * DashboardSwitcher - Renders the dashboard based on user role.
 */
const DashboardSwitcher = () => {
    const { user } = useSelector((state) => state.auth);
    const role = user?.role?.toLowerCase();

    if (role === "admin") return <AdminDashboard />;
    if (role === "dosen") return <DosenDashboard />;
    return <StudentDashboard />;
};

const App = () => {
    const dispatch = useDispatch();
    const { initialLoading } = useSelector((state) => state.auth);
    const { publicSettings } = useSelector((state) => state.settings || { publicSettings: {} });

    // On mount, try to restore session
    useEffect(() => {
        dispatch(fetchCurrentUser());
        dispatch(fetchPublicSettings());
    }, [dispatch]);

    // Dynamic Branding (Title & Favicon)
    useEffect(() => {
        if (publicSettings.app_name) {
            document.title = publicSettings.app_name;
        }
        if (publicSettings.app_favicon) {
            let favicon = document.getElementById("favicon");
            if (!favicon) {
                favicon = document.createElement("link");
                favicon.id = "favicon";
                favicon.rel = "icon";
                document.head.appendChild(favicon);
            }
            favicon.href = publicSettings.app_favicon;
        }
    }, [publicSettings]);

    // Show nothing while checking session
    if (initialLoading) return null;

    return (
        <>
            <Suspense fallback={null}>
                <Routes>
                    {/* Guest Routes: Only accessible when logged out */}
                    <Route element={<GuestRoute><Outlet /></GuestRoute>}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Profile Completion: Protected but lacks ProfileGuard */}
                    <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                        <Route path="/student/profile" element={<StudentProfile />} />
                    </Route>

                    {/* Protected Application Shell: Layout + Guarded */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <MainLayout />
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    >
                        {/* Universal */}
                        <Route index element={<DashboardSwitcher />} />

                        {/* Admin Routes */}
                        <Route path="admin">
                            <Route path="period-management" element={<PeriodManagement />} />
                            <Route path="theme-management" element={<ThemeManagement />} />
                            <Route path="master-mahasiswa" element={<StudentList />} />
                            <Route path="internship-groups" element={<AdminInternshipGroups />} />
                            <Route path="internship-groups/:internship_id" element={<InternshipGroupDetail />} />
                            <Route path="logbook" element={<AdminLogbook />} />
                            <Route path="reports" element={<AdminReport />} />
                            <Route path="evaluations" element={<AdminEvaluation />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="activities" element={<AdminActivity />} />
                            <Route path="master">
                                <Route path="mitra" element={<CompanyList />} />
                                <Route path="dosen" element={<LecturerList />} />
                            </Route>
                        </Route>

                        {/* Student Routes */}
                        <Route path="student">
                            <Route path="registration" element={<Registration />} />
                            <Route path="logbook" element={<StudentLogbook />} />
                            <Route path="reports" element={<StudentReport />} />
                            <Route path="evaluations" element={<StudentEvaluation />} />
                            <Route path="activities" element={<StudentActivity />} />
                            <Route path="ta-registration" element={<TARegistration />} />
                        </Route>

                        {/* Lecturer (Dosen) Routes */}
                        <Route path="dosen">
                            <Route path="internship-groups" element={<DosenInternshipGroups />} />
                            <Route path="internship-groups/:internship_id" element={<InternshipGroupDetail />} />
                            <Route path="logbook" element={<DosenLogbook />} />
                            <Route path="reports" element={<DosenReport />} />
                            <Route path="evaluations" element={<DosenEvaluation />} />
                            <Route path="activities" element={<DosenActivity />} />
                        </Route>
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
