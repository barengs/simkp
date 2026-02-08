import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import MainLayout from "./layouts/MainLayout";
import AdminDashboard from "./admin/Dashboard";
import DosenDashboard from "./dosen/Dashboard";
import StudentDashboard from "./student/Dashboard";
import PeriodManagement from "./admin/PeriodManagement";
import ThemeManagement from "./admin/ThemeManagement";
import MasterDosen from "./admin/master/MasterDosen";
import MasterMahasiswa from "./admin/master/MasterMahasiswa";
import MasterMitra from "./admin/master/MasterMitra";
import RegistrationValidation from "./admin/RegistrationValidation";
import PlottingDosen from "./admin/PlottingDosen";
import Registration from "./student/Registration";
import Logbook from "./student/Logbook";
import LogbookValidation from "./dosen/LogbookValidation";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./ui/Toast";
import { StudentProvider } from "./context/StudentContext";
import ProtectedRoute from "./protected/ProtectedRoute";
import { LecturerProvider } from "./context/LecturerContext";
import { PeriodProvider } from "./context/PeriodContext";
import { MitraProvider } from "./context/MitraContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StudentDashboardProvider } from "./context/StudentDashboardContext";
import { AdminInternshipProvider } from "./context/AdminInternshipContext";

const App = () => {
    return (
        <ToastProvider>
            <AuthProvider>
                <LecturerProvider>
                    <StudentProvider>
                        <MitraProvider>
                            <ThemeProvider>
                                <PeriodProvider>
                                    <AdminInternshipProvider>
                                        <StudentDashboardProvider>
                                            <AppRoutes />
                                        </StudentDashboardProvider>
                                    </AdminInternshipProvider>
                                </PeriodProvider>
                            </ThemeProvider>
                        </MitraProvider>
                    </StudentProvider>
                </LecturerProvider>
            </AuthProvider>
        </ToastProvider>
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

                            {/* Dosen Features */}
                            <Route path="logbook/validation" element={
                                <ProtectedRoute allowedRoles={['dosen']}>
                                    <LogbookValidation />
                                </ProtectedRoute>
                            } />

                            {/* Dashboard redirection helper */}
                            <Route path="dashboard" element={<DashboardRedirect />} />

                            {/* Nested catch-all within MainLayout */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
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
