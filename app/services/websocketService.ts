import type { ActionItem } from "../models/Action";

const WS_URL = "ws://localhost:8080/ws";

export type WebSocketMessageType = 
  | "action_created" 
  | "action_updated" 
  | "action_deleted";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  action?: {
    id: number;
    note_id: number;
    description: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  };
  id?: number; // For delete events
}

export interface WebSocketEventHandlers {
  onActionCreated?: (action: ActionItem) => void;
  onActionUpdated?: (action: ActionItem) => void;
  onActionDeleted?: (actionId: number) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

// Enhanced logging utility for WebSocket operations
const logWSInfo = (operation: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[WebSocket-${operation}] ${timestamp}: ${message}`, data || '');
};

const logWSError = (operation: string, error: any, context?: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[WebSocket-${operation}-ERROR] ${timestamp}:`, {
    error: error.message || error,
    context,
    type: error.name || 'Unknown',
  });
};

const logWSSuccess = (operation: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[WebSocket-${operation}-SUCCESS] ${timestamp}: ${message}`, data || '');
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000; // Start with 1 second
  private maxReconnectInterval = 30000; // Max 30 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private handlers: WebSocketEventHandlers = {};

  constructor() {
    logWSInfo('Constructor', 'WebSocketService initialized');
  }

  private convertApiActionToLocal(apiAction: WebSocketMessage['action']): ActionItem {
    if (!apiAction) {
      throw new Error('Invalid action data');
    }

    return {
      id: apiAction.id,
      text: apiAction.description,
      completed: apiAction.completed,
      createdAt: new Date(apiAction.created_at).getTime(),
      serverId: apiAction.id,
      lastUpdated: new Date(apiAction.updated_at).getTime(),
    };
  }

  connect(handlers: WebSocketEventHandlers = {}) {
    this.handlers = handlers;
    this.isIntentionallyClosed = false;

    if (this.ws?.readyState === WebSocket.OPEN) {
      logWSInfo('Connect', 'Already connected');
      return;
    }

    logWSInfo('Connect', 'Attempting to connect to WebSocket', { url: WS_URL });

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        logWSSuccess('Connect', 'WebSocket connection established');
        this.reconnectAttempts = 0;
        this.reconnectInterval = 1000;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        this.handlers.onConnected?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          logWSInfo('Message', 'Received WebSocket message', message);
          this.handleMessage(message);
        } catch (error) {
          logWSError('Message', error, 'Failed to parse WebSocket message');
        }
      };

      this.ws.onclose = (event) => {
        logWSInfo('Close', 'WebSocket connection closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        this.ws = null;
        this.handlers.onDisconnected?.();

        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        logWSError('Connection', error, 'WebSocket connection error');
        this.handlers.onError?.(error);
      };

    } catch (error) {
      logWSError('Connect', error, 'Failed to create WebSocket connection');
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: WebSocketMessage) {
    try {
      switch (message.type) {
        case 'action_created':
          if (message.action) {
            const action = this.convertApiActionToLocal(message.action);
            logWSInfo('Message', 'Action created event', action);
            this.handlers.onActionCreated?.(action);
          }
          break;

        case 'action_updated':
          if (message.action) {
            const action = this.convertApiActionToLocal(message.action);
            logWSInfo('Message', 'Action updated event', action);
            this.handlers.onActionUpdated?.(action);
          }
          break;

        case 'action_deleted':
          if (message.id) {
            logWSInfo('Message', 'Action deleted event', { id: message.id });
            this.handlers.onActionDeleted?.(message.id);
          }
          break;

        default:
          logWSError('Message', new Error('Unknown message type'), message);
      }
    } catch (error) {
      logWSError('Message', error, 'Error handling WebSocket message');
    }
  }

  private scheduleReconnect() {
    if (this.isIntentionallyClosed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logWSError('Reconnect', new Error('Max reconnection attempts reached'), {
          attempts: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts,
        });
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectInterval);

    logWSInfo('Reconnect', `Scheduling reconnection attempt ${this.reconnectAttempts}`, {
      delayMs: delay,
      nextAttempt: new Date(Date.now() + delay).toISOString(),
    });

    this.reconnectTimer = setTimeout(() => {
      logWSInfo('Reconnect', `Reconnection attempt ${this.reconnectAttempts}`);
      this.connect(this.handlers);
    }, delay);
  }

  disconnect() {
    logWSInfo('Disconnect', 'Intentionally disconnecting WebSocket');
    this.isIntentionallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

export const webSocketService = new WebSocketService(); 