import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./protected/ProtectedRoute";

// Lazy-loaded route components (code-splitting)
const AdminDashboard = React.lazy(() => import("./admin/Dashboard"));
const DosenDashboard = React.lazy(() => import("./dosen/Dashboard"));
const StudentDashboard = React.lazy(() => import("./student/Dashboard"));
const PeriodManagement = React.lazy(() => import("./admin/PeriodManagement"));
const ThemeManagement = React.lazy(() => import("./admin/ThemeManagement"));
const MasterDosen = React.lazy(() => import("./admin/master/MasterDosen"));
const MasterMahasiswa = React.lazy(() => import("./admin/master/MasterMahasiswa"));
const MasterMitra = React.lazy(() => import("./admin/master/MasterMitra"));
const RegistrationValidation = React.lazy(() => import("./admin/RegistrationValidation"));
const PlottingDosen = React.lazy(() => import("./admin/PlottingDosen"));
const Registration = React.lazy(() => import("./student/Registration"));
const Logbook = React.lazy(() => import("./student/Logbook"));
const Report = React.lazy(() => import("./student/Report"));
const LogbookValidation = React.lazy(() => import("./dosen/LogbookValidation"));
const Grading = React.lazy(() => import("./dosen/Grading"));

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[300px]">
        <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
    </div>
);

const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

const AppRoutes = () => {
    const { user, logout, isLoading } = useAuth();

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-slate-50">
    //             <div className="relative w-20 h-20">
    //                 <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
    //                 <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/*" element={
                <ProtectedRoute>
                    <MainLayout user={user} onLogout={logout}>
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route index element={<Navigate to="/dashboard" replace />} />

                                {/* Role Dashboards */}
                                <Route path="admin" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="dosen" element={
                                    <ProtectedRoute allowedRoles={['dosen']}>
                                        <DosenDashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="mahasiswa" element={
                                    <ProtectedRoute allowedRoles={['mahasiswa']}>
                                        <StudentDashboard />
                                    </ProtectedRoute>
                                } />

                                {/* Admin Features */}
                                <Route path="period-management" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <PeriodManagement />
                                    </ProtectedRoute>
                                } />
                                <Route path="theme/management" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <ThemeManagement />
                                    </ProtectedRoute>
                                } />
                                <Route path="master/dosen" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <MasterDosen />
                                    </ProtectedRoute>
                                } />
                                <Route path="master/mahasiswa" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <MasterMahasiswa />
                                    </ProtectedRoute>
                                } />
                                <Route path="master/mitra" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <MasterMitra />
                                    </ProtectedRoute>
                                } />
                                <Route path="registration/validation" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <RegistrationValidation />
                                    </ProtectedRoute>
                                } />
                                <Route path="registration/plotting" element={
                                    <ProtectedRoute allowedRoles={['admin']}>
                                        <PlottingDosen />
                                    </ProtectedRoute>
                                } />

                                {/* Student Features */}
                                <Route path="student/registration" element={
                                    <ProtectedRoute allowedRoles={['mahasiswa']}>
                                        <Registration />
                                    </ProtectedRoute>
                                } />
                                <Route path="student/logbook" element={
                                    <ProtectedRoute allowedRoles={['mahasiswa']}>
                                        <Logbook />
                                    </ProtectedRoute>
                                } />
                                <Route path="student/report" element={
                                    <ProtectedRoute allowedRoles={['mahasiswa']}>
                                        <Report />
                                    </ProtectedRoute>
                                } />

                                {/* Dosen Features */}
                                <Route path="logbook/validation" element={
                                    <ProtectedRoute allowedRoles={['dosen']}>
                                        <LogbookValidation />
                                    </ProtectedRoute>
                                } />
                                <Route path="grading" element={
                                    <ProtectedRoute allowedRoles={['dosen']}>
                                        <Grading />
                                    </ProtectedRoute>
                                } />

                                {/* Dashboard redirection helper */}
                                <Route path="dashboard" element={<DashboardRedirect />} />

                                {/* Nested catch-all within MainLayout */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </MainLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

// Helper component for dashboard redirection
const DashboardRedirect = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'dosen') return <Navigate to="/dosen" replace />;
    if (user?.role === 'mahasiswa') return <Navigate to="/mahasiswa" replace />;

    return <Navigate to="/login" replace />;
};

export default App;
