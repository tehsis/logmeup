import { useAuth0 } from '@auth0/auth0-react';

const API_BASE_URL = "http://localhost:8080/api";

export interface ApiNote {
  id: number;
  user_id: string;
  content: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  content: string;
  date: string;
}

export interface UpdateNoteRequest {
  content: string;
}

// Enhanced logging utility
const logNoteInfo = (operation: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[NoteAPI-${operation}] ${timestamp}: ${message}`, data || '');
};

const logNoteError = (operation: string, error: any, context?: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[NoteAPI-${operation}-ERROR] ${timestamp}:`, {
    error: error.message || error,
    stack: error.stack,
    context,
    type: error.name,
  });
};

class NoteApiService {
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
    const operation = `${options.method || 'GET'} ${url}`;
    logNoteInfo('Request', `Starting ${operation}`, { options });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      logNoteError('Timeout', new Error(`Request timeout after ${timeout}ms`), { url, options });
    }, timeout);
    
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
      
      if (!response.ok) {
        logNoteError('HTTP Error', new Error(`HTTP ${response.status} ${response.statusText}`), {
          url,
          status: response.status,
          statusText: response.statusText,
        });
      } else {
        logNoteInfo('Response', `Successful ${operation}`, { status: response.status });
      }
      
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        logNoteError('Aborted', new Error('Request was aborted'), { url, timeout });
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        logNoteError('Network', new Error('Network error - server may be offline'), { url, originalError: error.message });
      } else {
        logNoteError('Fetch', error, { url, options });
      }
      
      throw error;
    }
  }

  async getNotesByDate(date: string): Promise<ApiNote[]> {
    try {
      logNoteInfo('GetByDate', 'Fetching notes by date', { date });
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/notes?date=${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: HTTP ${response.status}`);
      }
      
      const notes = await response.json();
      logNoteInfo('GetByDate', `Successfully fetched ${notes.length} notes for date ${date}`);
      return notes;
    } catch (error) {
      logNoteError('GetByDate', error, { date });
      throw error;
    }
  }

  async createNote(note: CreateNoteRequest): Promise<ApiNote> {
    try {
      logNoteInfo('Create', 'Creating new note', note);
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/notes`, {
        method: 'POST',
        body: JSON.stringify(note),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logNoteError('Create', new Error(`Failed to create note: HTTP ${response.status}`), {
          requestData: note,
          responseBody: errorText,
        });
        throw new Error(`Failed to create note: HTTP ${response.status}`);
      }
      
      const createdNote = await response.json();
      logNoteInfo('Create', `Successfully created note with ID ${createdNote.id}`, createdNote);
      return createdNote;
    } catch (error) {
      logNoteError('Create', error, { requestData: note });
      throw error;
    }
  }

  async getOrCreateTodayNote(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      logNoteInfo('GetOrCreateToday', 'Getting or creating today\'s note', { date: today });
      
      // First, try to get existing note for today
      const existingNotes = await this.getNotesByDate(today);
      
      if (existingNotes.length > 0) {
        logNoteInfo('GetOrCreateToday', 'Found existing note for today', { 
          noteId: existingNotes[0].id, 
          date: today 
        });
        return existingNotes[0].id;
      }
      
      // If no note exists for today, create one
      logNoteInfo('GetOrCreateToday', 'No existing note found, creating new note for today');
      const newNote = await this.createNote({
        content: ' ', // Space instead of empty content to satisfy backend validation
        date: today,
      });
      
      logNoteInfo('GetOrCreateToday', 'Successfully created today\'s note', { 
        noteId: newNote.id, 
        date: today 
      });
      
      return newNote.id;
      
    } catch (error) {
      logNoteError('GetOrCreateToday', error, { date: today });
      throw error;
    }
  }
}

export const noteApiService = new NoteApiService(); 