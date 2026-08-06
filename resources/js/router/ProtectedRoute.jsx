import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ permission, children }) {
    const { permissions, isAuthenticated } = useSelector((s) => s.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (permission && !permissions.includes(permission)) {
        return <Navigate to="/403" replace />;
    }

    return children;
}

export default ProtectedRoute;
