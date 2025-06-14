import { useAuth0 } from '@auth0/auth0-react';

const API_BASE_URL = "http://localhost:8080/api";

export interface ApiAction {
  id: number;
  user_id: string;
  note_id: number;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateActionRequest {
  note_id: number;
  description: string;
}

export interface UpdateActionRequest {
  completed: boolean;
}

export interface PendingAction {
  id: number;
  action: 'create' | 'update' | 'delete';
  data?: any;
  timestamp: number;
}

class ActionApiService {
  private getAccessToken: (() => Promise<string>) | null = null;

  setTokenProvider(getAccessToken: () => Promise<string>) {
    this.getAccessToken = getAccessToken;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.getAccessToken) {
      throw new Error('Authentication not configured. Please login first.');
    }
    
    try {
      const token = await this.getAccessToken();
      return {
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      throw new Error('Failed to get authentication token. Please login again.');
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const authHeaders = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/actions`, {
        method: 'HEAD',
      }, 3000);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAllActions(): Promise<ApiAction[]> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/actions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async createAction(action: CreateActionRequest): Promise<ApiAction> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/actions`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async updateAction(id: number, action: UpdateActionRequest): Promise<ApiAction> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/actions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(action),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async deleteAction(id: number): Promise<void> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/actions/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export const actionApiService = new ActionApiService(); 