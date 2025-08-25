import { useSelector } from 'react-redux';

/**
 * Authentication hook providing user state from Redux store
 * Simple wrapper around Redux auth state for consistent usage
 */
export const useAuth = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const error = useSelector((state) => state.auth.error);

  return {
    user,
    isLoading,
    isAuthenticated,
    error
  };
};

export default useAuth;