
import React, { useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "./store/slice/authSlice";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load components
const Login = lazy(() => import("./Login"));
const Register = lazy(() => import("./Register"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Dashboard = lazy(() => import("./Dashboard"));
const PeriodManagement = lazy(() => import("./admin/Periods/PeriodManagement"));
const ThemeManagement = React.lazy(() => import("./admin/Themes/ThemeManagement"));
const LecturerList = React.lazy(() => import("./admin/master/Lecturers/LecturerList"));
const StudentList = lazy(() => import("./admin/master/Students/StudentList"));
const CompanyList = React.lazy(() => import("./admin/master/Companies/CompanyList"));
const Registration = lazy(() => import("./student/Registration"));
const StudentProfile = lazy(() => import("./student/StudentProfile"));



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

const App = () => {
    const dispatch = useDispatch();
    const { initialLoading } = useSelector((state) => state.auth);

    // On mount, try to restore session
    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    // Show nothing while checking session
    if (initialLoading) return null;

    return (
        <>
            <Suspense fallback={null}>
                <Routes>
                    {/* Guest route: Login/Register */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />

                    {/* Guest route: Register */}
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />

                    {/* Student profile completion (protected but no ProfileGuard) */}
                    <Route
                        path="/student/profile"
                        element={
                            <ProtectedRoute>
                                <StudentProfile />
                            </ProtectedRoute>
                        }
                    />

                    {/* All protected routes wrapped with ProfileGuard */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <Dashboard />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/period-management"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <PeriodManagement />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/theme-management"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <ThemeManagement />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/master-mahasiswa"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <StudentList />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/master/mitra"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <CompanyList />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/master/dosen"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <LecturerList />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/registration"
                        element={
                            <ProtectedRoute>
                                <ProfileGuard>
                                    <Suspense fallback={null}>
                                        <MainLayout>
                                            <Registration />
                                        </MainLayout>
                                    </Suspense>
                                </ProfileGuard>
                            </ProtectedRoute>
                        }
                    />
                    {/* Catch all */}
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </Suspense>
            <ToastContainer autoClose={2500} />
        </>
    );
};

export default App;
