import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * PermissionGate HOC wrapper to protect routes and components from unauthorised access.
 */
const PermissionGate = ({ permission, children, fallbackRedirect = "/" }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    const userPermissions = user.permissions || [];
    const hasPermission = userPermissions.includes(permission);

    if (!hasPermission) {
        return <Navigate to={fallbackRedirect} replace />;
    }

    return children;
};

export default PermissionGate;
