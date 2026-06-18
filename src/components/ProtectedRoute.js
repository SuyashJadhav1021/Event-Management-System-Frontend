import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects to login if not authenticated
export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Redirects to home if not admin
export const AdminRoute = ({ children }) => {
  const { isAdmin, isLoggedIn, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const Spinner = () => (
  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
);
