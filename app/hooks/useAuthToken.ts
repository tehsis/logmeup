import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

export const useAuthToken = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const getToken = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('User is not authenticated');
    }

    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [getToken]);

  return {
    getToken,
    getAuthHeaders,
    isAuthenticated,
    isLoading,
  };
}; 