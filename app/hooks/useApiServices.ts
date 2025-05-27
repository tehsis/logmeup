import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { actionApiService } from '~/services/actionApi';
import { noteApiService } from '~/services/noteApi';

export function useApiServices() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      const getToken = async () => {
        try {
          return await getAccessTokenSilently();
        } catch (error) {
          console.error('Failed to get access token:', error);
          throw error;
        }
      };

      // Initialize API services with token provider
      actionApiService.setTokenProvider(getToken);
      noteApiService.setTokenProvider(getToken);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return {
    actionApiService,
    noteApiService,
  };
} 