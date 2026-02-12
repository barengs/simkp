import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        // Redirect to login but save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Role not authorized - redirect to a specific page or dashboard
        const dashboardMap = {
            admin: '/admin',
            dosen: '/dosen',
            mahasiswa: '/mahasiswa'
        };

        return <Navigate to={dashboardMap[user?.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
