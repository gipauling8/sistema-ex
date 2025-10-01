import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
    app_metadata: {
        role: string;
    };
}

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.app_metadata.role)) {
            return <Navigate to="/" replace />;
        }

    } catch (error) {
        localStorage.removeItem('authToken');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
