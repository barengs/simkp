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
const TABimbingan = lazy(() => import("./student/TABimbingan"));
const TASidang = lazy(() => import("./student/TASidang"));
const TAFinal = lazy(() => import("./student/TAFinal"));
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
const KoordinatorTA = lazy(() => import("./admin/KoordinatorTA"));
const RoleManagement = lazy(() => import("./admin/RoleManagement"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));



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
    const roles = user?.roles || [];

    if (roles.includes("admin")) return <AdminDashboard />;
    if (roles.includes("dosen_pembimbing") || roles.includes("dosen_penguji")) return <DosenDashboard />;
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
                        <Route
                            path="profile"
                            element={
                                <PermissionGate permission="manage profile">
                                    <ProfileSettings />
                                </PermissionGate>
                            }
                        />

                        {/* Admin Routes */}
                        <Route path="admin">
                            <Route path="period-management" element={<PermissionGate permission="manage periods"><PeriodManagement /></PermissionGate>} />
                            <Route path="theme-management" element={<PermissionGate permission="manage themes"><ThemeManagement /></PermissionGate>} />
                            <Route path="master-mahasiswa" element={<PermissionGate permission="manage master data"><StudentList /></PermissionGate>} />
                            <Route path="role-management" element={<PermissionGate permission="manage roles"><RoleManagement /></PermissionGate>} />
                            <Route path="internship-groups" element={<PermissionGate permission="view internships"><AdminInternshipGroups /></PermissionGate>} />
                            <Route path="internship-groups/:internship_id" element={<PermissionGate permission="view internships"><InternshipGroupDetail /></PermissionGate>} />
                            <Route path="logbook" element={<PermissionGate permission="view internships"><AdminLogbook /></PermissionGate>} />
                            <Route path="reports" element={<PermissionGate permission="view internships"><AdminReport /></PermissionGate>} />
                            <Route path="evaluations" element={<PermissionGate permission="view internships"><AdminEvaluation /></PermissionGate>} />
                            <Route path="settings" element={<PermissionGate permission="manage settings"><Settings /></PermissionGate>} />
                            <Route path="activities" element={<PermissionGate permission="manage settings"><AdminActivity /></PermissionGate>} />
                            <Route path="koordinator-ta" element={<PermissionGate permission="manage ta"><KoordinatorTA /></PermissionGate>} />
                            <Route path="master">
                                <Route path="mitra" element={<PermissionGate permission="manage master data"><CompanyList /></PermissionGate>} />
                                <Route path="dosen" element={<PermissionGate permission="manage master data"><LecturerList /></PermissionGate>} />
                            </Route>
                        </Route>

                        {/* Student Routes */}
                        <Route path="student">
                            <Route path="registration" element={<PermissionGate permission="student registration"><Registration /></PermissionGate>} />
                            <Route path="logbook" element={<PermissionGate permission="student logbook"><StudentLogbook /></PermissionGate>} />
                            <Route path="reports" element={<PermissionGate permission="student report"><StudentReport /></PermissionGate>} />
                            <Route path="evaluations" element={<PermissionGate permission="student evaluation"><StudentEvaluation /></PermissionGate>} />
                            <Route path="activities" element={<PermissionGate permission="student logbook"><StudentActivity /></PermissionGate>} />
                            <Route path="ta-registration" element={<PermissionGate permission="student ta"><TARegistration /></PermissionGate>} />
                            <Route path="ta-bimbingan" element={<PermissionGate permission="student ta"><TABimbingan /></PermissionGate>} />
                            <Route path="ta-sidang" element={<PermissionGate permission="student ta"><TASidang /></PermissionGate>} />
                            <Route path="ta-final" element={<PermissionGate permission="student ta"><TAFinal /></PermissionGate>} />
                        </Route>

                        {/* Lecturer (Dosen) Routes */}
                        <Route path="dosen">
                            <Route path="internship-groups" element={<PermissionGate permission="view internships"><DosenInternshipGroups /></PermissionGate>} />
                            <Route path="internship-groups/:internship_id" element={<PermissionGate permission="view internships"><InternshipGroupDetail /></PermissionGate>} />
                            <Route path="logbook" element={<PermissionGate permission="validate logbook"><DosenLogbook /></PermissionGate>} />
                            <Route path="reports" element={<PermissionGate permission="validate report"><DosenReport /></PermissionGate>} />
                            <Route path="evaluations" element={<PermissionGate permission="score internships"><DosenEvaluation /></PermissionGate>} />
                            <Route path="activities" element={<PermissionGate permission="view internships"><DosenActivity /></PermissionGate>} />
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
