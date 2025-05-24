import type { ActionItem } from "../models/Action";
import { actionApiService, type ApiAction, type CreateActionRequest, type UpdateActionRequest, type PendingAction } from "./actionApi";
import { noteApiService } from "./noteApi";
import { webSocketService, type WebSocketEventHandlers } from "./websocketService";

const PENDING_ACTIONS_KEY = "pending_actions";
const LAST_SYNC_KEY = "last_sync";
const SYNC_QUEUE_KEY = "sync_queue";

export interface SyncQueue {
  create: Array<{ localId: number; data: CreateActionRequest }>;
  update: Array<{ id: number; data: UpdateActionRequest }>;
  delete: Array<{ id: number }>;
}

export interface SyncStatus {
  isOnline: boolean;
  wsConnected: boolean;
  lastSync: number | null;
  pendingCount: number;
  syncing: boolean;
}

// Enhanced logging utility for sync operations
const logSyncInfo = (operation: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[ActionSync-${operation}] ${timestamp}: ${message}`, data || '');
};

const logSyncError = (operation: string, error: any, context?: any) => {
  const timestamp = new Date().toISOString();
  console.error(`[ActionSync-${operation}-ERROR] ${timestamp}:`, {
    error: error.message || error,
    stack: error.stack,
    context,
    type: error.name,
  });
};

const logSyncSuccess = (operation: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[ActionSync-${operation}-SUCCESS] ${timestamp}: ${message}`, data || '');
};

class ActionSyncService {
  private syncInProgress = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];
  private wsConnected = false;

  constructor() {
    logSyncInfo('Constructor', 'ActionSyncService initialized with real-time support');
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    const handlers: WebSocketEventHandlers = {
      onConnected: () => {
        logSyncSuccess('WebSocket', 'WebSocket connected');
        this.wsConnected = true;
        this.notifyStatusChange();
      },
      onDisconnected: () => {
        logSyncInfo('WebSocket', 'WebSocket disconnected');
        this.wsConnected = false;
        this.notifyStatusChange();
      },
      onError: (error) => {
        logSyncError('WebSocket', error, 'WebSocket connection error');
        this.wsConnected = false;
        this.notifyStatusChange();
      },
      onActionCreated: (action) => {
        logSyncInfo('WebSocket', 'Received action created event', action);
        this.handleRemoteActionCreated(action);
      },
      onActionUpdated: (action) => {
        logSyncInfo('WebSocket', 'Received action updated event', action);
        this.handleRemoteActionUpdated(action);
      },
      onActionDeleted: (actionId) => {
        logSyncInfo('WebSocket', 'Received action deleted event', { actionId });
        this.handleRemoteActionDeleted(actionId);
      },
    };

    webSocketService.connect(handlers);
  }

  // Remote event handlers for real-time updates
  private handleRemoteActionCreated(action: ActionItem) {
    // Notify listeners about the remote action (this will update UI)
    this.syncListeners.forEach(listener => {
      try {
        // For remote events, we trigger a status change to let the UI refresh
        this.notifyStatusChange();
      } catch (error) {
        logSyncError('RemoteEvent', error, 'Error in remote action created handler');
      }
    });
  }

  private handleRemoteActionUpdated(action: ActionItem) {
    this.syncListeners.forEach(listener => {
      try {
        this.notifyStatusChange();
      } catch (error) {
        logSyncError('RemoteEvent', error, 'Error in remote action updated handler');
      }
    });
  }

  private handleRemoteActionDeleted(actionId: number) {
    this.syncListeners.forEach(listener => {
      try {
        this.notifyStatusChange();
      } catch (error) {
        logSyncError('RemoteEvent', error, 'Error in remote action deleted handler');
      }
    });
  }

  addSyncListener(listener: (status: SyncStatus) => void) {
    logSyncInfo('Listener', 'Adding sync listener');
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener: (status: SyncStatus) => void) {
    logSyncInfo('Listener', 'Removing sync listener');
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  private async notifyStatusChange() {
    const status = await this.getSyncStatus();
    logSyncInfo('Listener', 'Notifying listeners of status change', status);
    this.syncListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        logSyncError('Listener', error, 'Error in sync listener callback');
      }
    });
  }

  private getSyncQueue(): SyncQueue {
    if (typeof window === "undefined") return { create: [], update: [], delete: [] };
    
    try {
      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      const parsedQueue = queue ? JSON.parse(queue) : { create: [], update: [], delete: [] };
      logSyncInfo('Queue', 'Retrieved sync queue', {
        createCount: parsedQueue.create?.length || 0,
        updateCount: parsedQueue.update?.length || 0,
        deleteCount: parsedQueue.delete?.length || 0,
      });
      return parsedQueue;
    } catch (error) {
      logSyncError('Queue', error, 'Failed to parse sync queue from localStorage');
      return { create: [], update: [], delete: [] };
    }
  }

  private setSyncQueue(queue: SyncQueue) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
        logSyncInfo('Queue', 'Saved sync queue', {
          createCount: queue.create.length,
          updateCount: queue.update.length,
          deleteCount: queue.delete.length,
        });
      } catch (error) {
        logSyncError('Queue', error, 'Failed to save sync queue to localStorage');
      }
    }
  }

  private getLastSync(): number | null {
    if (typeof window === "undefined") return null;
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    const timestamp = lastSync ? parseInt(lastSync) : null;
    logSyncInfo('LastSync', 'Retrieved last sync timestamp', timestamp);
    return timestamp;
  }

  private setLastSync(timestamp: number) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
      logSyncInfo('LastSync', 'Updated last sync timestamp', timestamp);
    }
  }

  private convertApiActionToLocal(apiAction: ApiAction): ActionItem {
    const converted = {
      id: apiAction.id,
      text: apiAction.description,
      completed: apiAction.completed,
      createdAt: new Date(apiAction.created_at).getTime(),
      serverId: apiAction.id,
      lastUpdated: new Date(apiAction.updated_at).getTime(),
    };
    logSyncInfo('Convert', 'Converted API action to local format', {
      apiId: apiAction.id,
      localId: converted.id,
      description: converted.text,
    });
    return converted;
  }

  async getSyncStatus(): Promise<SyncStatus> {
    logSyncInfo('Status', 'Getting sync status');
    
    try {
      const isOnline = await actionApiService.isOnline();
      const queue = this.getSyncQueue();
      const pendingCount = queue.create.length + queue.update.length + queue.delete.length;
      
      const status = {
        isOnline,
        wsConnected: this.wsConnected,
        lastSync: this.getLastSync(),
        pendingCount,
        syncing: this.syncInProgress,
      };
      
      logSyncInfo('Status', 'Sync status retrieved', status);
      return status;
    } catch (error) {
      logSyncError('Status', error, 'Failed to get sync status');
      return {
        isOnline: false,
        wsConnected: this.wsConnected,
        lastSync: this.getLastSync(),
        pendingCount: 0,
        syncing: this.syncInProgress,
      };
    }
  }

  // Queue operations for offline use
  async queueCreateAction(action: ActionItem) {
    logSyncInfo('QueueCreate', 'Queueing action for creation', {
      localId: action.id,
      text: action.text,
    });
    
    try {
      // Get today's note ID, or use 1 as fallback if offline
      let noteId = 1;
      try {
        noteId = await noteApiService.getOrCreateTodayNote();
        logSyncInfo('QueueCreate', 'Got today\'s note ID', { noteId });
      } catch (error) {
        logSyncError('QueueCreate', error, 'Failed to get today\'s note ID, using fallback');
      }
      
      const queue = this.getSyncQueue();
      queue.create.push({
        localId: action.id,
        data: {
          note_id: noteId,
          description: action.text,
        }
      });
      this.setSyncQueue(queue);
      logSyncSuccess('QueueCreate', 'Action queued for creation', { noteId });

      // Try to sync immediately if online
      await this.autoSyncIfOnline();
    } catch (error) {
      logSyncError('QueueCreate', error, 'Failed to queue action for creation');
      throw error;
    }
  }

  async queueUpdateAction(action: ActionItem) {
    logSyncInfo('QueueUpdate', 'Queueing action for update', {
      localId: action.id,
      serverId: action.serverId,
      completed: action.completed,
    });
    
    const queue = this.getSyncQueue();
    // Remove from create queue if it exists (local-only action)
    const createIndex = queue.create.findIndex(item => item.localId === action.id);
    if (createIndex >= 0) {
      logSyncInfo('QueueUpdate', 'Updating existing create queue entry', createIndex);
      queue.create[createIndex].data.description = action.text;
    } else if (action.serverId) {
      // Only queue update if action exists on server
      const existingIndex = queue.update.findIndex(item => item.id === action.serverId);
      if (existingIndex >= 0) {
        logSyncInfo('QueueUpdate', 'Updating existing update queue entry', existingIndex);
        queue.update[existingIndex].data.completed = action.completed;
      } else {
        logSyncInfo('QueueUpdate', 'Adding new update queue entry');
        queue.update.push({
          id: action.serverId,
          data: { completed: action.completed }
        });
      }
    }
    this.setSyncQueue(queue);
    logSyncSuccess('QueueUpdate', 'Action queued for update');

    // Try to sync immediately if online
    await this.autoSyncIfOnline();
  }

  async queueDeleteAction(action: ActionItem) {
    logSyncInfo('QueueDelete', 'Queueing action for deletion', {
      localId: action.id,
      serverId: action.serverId,
    });
    
    const queue = this.getSyncQueue();
    // Remove from create queue if it exists (local-only action)
    const createIndex = queue.create.findIndex(item => item.localId === action.id);
    if (createIndex >= 0) {
      logSyncInfo('QueueDelete', 'Removing from create queue (local-only action)', createIndex);
      queue.create.splice(createIndex, 1);
    } else if (action.serverId) {
      // Remove from update queue if exists
      const updateIndex = queue.update.findIndex(item => item.id === action.serverId);
      if (updateIndex >= 0) {
        logSyncInfo('QueueDelete', 'Removing from update queue', updateIndex);
        queue.update.splice(updateIndex, 1);
      }
      // Add to delete queue
      logSyncInfo('QueueDelete', 'Adding to delete queue', action.serverId);
      queue.delete.push({ id: action.serverId });
    }
    this.setSyncQueue(queue);
    logSyncSuccess('QueueDelete', 'Action queued for deletion');

    // Try to sync immediately if online
    await this.autoSyncIfOnline();
  }

  // Auto-sync if online and not already syncing
  private async autoSyncIfOnline() {
    try {
      const isOnline = await actionApiService.isOnline();
      const queue = this.getSyncQueue();
      const hasPendingOperations = queue.create.length > 0 || queue.update.length > 0 || queue.delete.length > 0;
      
      if (isOnline && hasPendingOperations && !this.syncInProgress) {
        logSyncInfo('AutoSync', 'Starting automatic sync');
        await this.syncWithServer();
      }
    } catch (error) {
      logSyncError('AutoSync', error, 'Auto-sync failed, will retry later');
    }
  }

  async syncWithServer(): Promise<{ success: boolean; error?: string }> {
    if (this.syncInProgress) {
      logSyncInfo('Sync', 'Sync already in progress, skipping');
      return { success: false, error: "Sync already in progress" };
    }

    logSyncInfo('Sync', 'Starting sync with server');
    this.syncInProgress = true;
    await this.notifyStatusChange();

    try {
      const isOnline = await actionApiService.isOnline();
      if (!isOnline) {
        logSyncError('Sync', new Error('Server not reachable'), 'Cannot sync while offline');
        return { success: false, error: "Server is not reachable" };
      }

      const queue = this.getSyncQueue();
      logSyncInfo('Sync', 'Processing sync queue', {
        createCount: queue.create.length,
        updateCount: queue.update.length,
        deleteCount: queue.delete.length,
      });

      const results: { 
        creates: Array<{ localId: number; serverAction: ApiAction }>; 
        updates: number[]; 
        deletes: number[] 
      } = { creates: [], updates: [], deletes: [] };

      // Process creates
      logSyncInfo('Sync', 'Processing creates', queue.create.length);
      for (const createItem of queue.create) {
        try {
          logSyncInfo('Sync', 'Creating action on server', createItem);
          const serverAction = await actionApiService.createAction(createItem.data);
          results.creates.push({ localId: createItem.localId, serverAction });
          logSyncSuccess('Sync', 'Action created on server', { localId: createItem.localId, serverId: serverAction.id });
        } catch (error) {
          logSyncError('Sync', error, 'Failed to create action on server');
          throw error;
        }
      }

      // Process updates
      logSyncInfo('Sync', 'Processing updates', queue.update.length);
      for (const updateItem of queue.update) {
        try {
          logSyncInfo('Sync', 'Updating action on server', updateItem);
          await actionApiService.updateAction(updateItem.id, updateItem.data);
          results.updates.push(updateItem.id);
          logSyncSuccess('Sync', 'Action updated on server', updateItem.id);
        } catch (error) {
          logSyncError('Sync', error, 'Failed to update action on server');
          throw error;
        }
      }

      // Process deletes
      logSyncInfo('Sync', 'Processing deletes', queue.delete.length);
      for (const deleteItem of queue.delete) {
        try {
          logSyncInfo('Sync', 'Deleting action on server', deleteItem);
          await actionApiService.deleteAction(deleteItem.id);
          results.deletes.push(deleteItem.id);
          logSyncSuccess('Sync', 'Action deleted on server', deleteItem.id);
        } catch (error) {
          logSyncError('Sync', error, 'Failed to delete action on server');
          throw error;
        }
      }

      // Clear queue on success
      this.setSyncQueue({ create: [], update: [], delete: [] });
      this.setLastSync(Date.now());

      logSyncSuccess('Sync', 'Sync completed successfully', {
        createdCount: results.creates.length,
        updatedCount: results.updates.length,
        deletedCount: results.deletes.length,
      });

      await this.notifyStatusChange();

      return { success: true };
    } catch (error) {
      logSyncError('Sync', error, 'Sync failed');
      await this.notifyStatusChange();
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      this.syncInProgress = false;
      logSyncInfo('Sync', 'Sync process finished');
    }
  }

  async fetchFromServer(): Promise<ActionItem[]> {
    logSyncInfo('Fetch', 'Fetching actions from server');
    
    try {
      const apiActions = await actionApiService.getAllActions();
      const localActions = apiActions.map(this.convertApiActionToLocal);
      
      logSyncSuccess('Fetch', 'Actions fetched from server', {
        count: localActions.length,
      });
      
      return localActions;
    } catch (error) {
      logSyncError('Fetch', error, 'Failed to fetch actions from server');
      throw error;
    }
  }

  async fullSync(): Promise<{ success: boolean; actions?: ActionItem[]; error?: string }> {
    logSyncInfo('FullSync', 'Starting full sync');
    
    try {
      // First sync pending changes
      logSyncInfo('FullSync', 'Step 1: Syncing pending changes');
      const syncResult = await this.syncWithServer();
      if (!syncResult.success) {
        logSyncError('FullSync', new Error(syncResult.error || 'Unknown sync error'), 'Failed to sync pending changes');
        return syncResult;
      }

      // Then fetch all actions from server
      logSyncInfo('FullSync', 'Step 2: Fetching all actions from server');
      const actions = await this.fetchFromServer();
      
      logSyncSuccess('FullSync', 'Full sync completed successfully', {
        actionsCount: actions.length,
      });
      
      return { success: true, actions };
    } catch (error) {
      logSyncError('FullSync', error, 'Full sync failed');
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  // Connect/disconnect WebSocket
  connectWebSocket() {
    this.initializeWebSocket();
  }

  disconnectWebSocket() {
    webSocketService.disconnect();
    this.wsConnected = false;
    this.notifyStatusChange();
  }
}

export const actionSyncService = new ActionSyncService(); 