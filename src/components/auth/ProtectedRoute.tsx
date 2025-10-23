// Protected route component with role-based access control
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'company' | 'student')[];
}

/**
 * ProtectedRoute Component
 * Restricts access to routes based on authentication and user role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !role) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else if (role === 'company') {
      return <Navigate to="/company/internships" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};

export default ProtectedRoute;

