import { useAuthToken } from '../hooks/useAuthToken';

export class AuthenticatedApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Promise<Record<string, string>>;

  constructor(baseUrl: string, getAuthHeaders: () => Promise<Record<string, string>>) {
    this.baseUrl = baseUrl;
    this.getAuthHeaders = getAuthHeaders;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Hook to create an authenticated API client
export const useApiClient = (baseUrl: string = '/api') => {
  const { getAuthHeaders, isAuthenticated } = useAuthToken();

  if (!isAuthenticated) {
    throw new Error('User must be authenticated to use API client');
  }

  return new AuthenticatedApiClient(baseUrl, getAuthHeaders);
}; 