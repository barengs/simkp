import React, { lazy } from 'react';
import { useSelector } from 'react-redux';

/**
 * DashboardSwitcher - Render dashboard based on user permissions.
 * Prioritized: Permissions > Legacy Roles.
 */
const DashboardSwitcher = () => {
    const { user } = useSelector((state) => state.auth);
    const permissions = user?.permissions || [];
    const roles = user?.roles || [];

    // Priority 1: Permission-based (future-proof)
    if (permissions.includes('manage settings')) return <AdminDashboard />;
    if (permissions.includes('view internships') || permissions.includes('validate logbook')) return <DosenDashboard />;
    if (permissions.includes('student logbook')) return <StudentDashboard />;

    // Priority 2: Fallback role-based (legacy)
    if (roles.includes('admin')) return <AdminDashboard />;
    if (roles.includes('dosen_pembimbing') || roles.includes('dosen_penguji')) return <DosenDashboard />;
    return <StudentDashboard />;
};

// Lazy load dashboards (circular dependency protection)
const AdminDashboard = React.lazy(() => import('../admin/Dashboard'));
const DosenDashboard = React.lazy(() => import('../dosen/Dashboard'));
const StudentDashboard = React.lazy(() => import('../student/Dashboard'));

export default DashboardSwitcher;
