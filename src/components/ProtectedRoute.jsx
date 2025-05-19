import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute component to secure routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const currentPath = window.location.pathname + window.location.search;

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login and save the current path for redirect after login
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, navigate, currentPath]);

  // Only render children if authenticated
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;

