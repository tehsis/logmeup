import { useState, useEffect } from "react";
import {
  type ActionItem,
  loadActions,
  saveActions,
  createAction,
  toggleActionCompletion,
  deleteActionById,
} from "../models/Action";
import { actionSyncService, type SyncStatus } from "../services/actionSync";

export function useAction() {
  const [actions, setActions] = useState<ActionItem[]>(() => loadActions());
  const [newAction, setNewAction] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSync: null,
    pendingCount: 0,
    syncing: false,
  });

  // Save to localStorage whenever actions change
  useEffect(() => {
    saveActions(actions);
  }, [actions]);

  // Set up sync status listener
  useEffect(() => {
    const updateSyncStatus = async () => {
      const status = await actionSyncService.getSyncStatus();
      setSyncStatus(status);
    };

    updateSyncStatus();
    actionSyncService.addSyncListener(setSyncStatus);

    return () => {
      actionSyncService.removeSyncListener(setSyncStatus);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (syncStatus.isOnline && syncStatus.pendingCount > 0 && !syncStatus.syncing) {
      syncWithServer();
    }
  }, [syncStatus.isOnline]);

  const addAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim() === "") return;

    const action = createAction(newAction);
    setActions([...actions, action]);
    setNewAction("");

    // Queue for sync
    actionSyncService.queueCreateAction(action);
  };

  const toggleAction = (id: number) => {
    const updatedActions = toggleActionCompletion(actions, id);
    setActions(updatedActions);

    // Find the updated action and queue for sync
    const updatedAction = updatedActions.find(a => a.id === id);
    if (updatedAction) {
      actionSyncService.queueUpdateAction(updatedAction);
    }
  };

  const deleteAction = (id: number) => {
    const actionToDelete = actions.find(a => a.id === id);
    setActions(deleteActionById(actions, id));

    // Queue for sync
    if (actionToDelete) {
      actionSyncService.queueDeleteAction(actionToDelete);
    }
  };

  const syncWithServer = async () => {
    try {
      const result = await actionSyncService.fullSync();
      if (result.success && result.actions) {
        // Merge server actions with local actions, prioritizing server data
        const mergedActions = mergeActions(actions, result.actions);
        setActions(mergedActions);
      }
      return result;
    } catch (error) {
      console.error("Sync failed:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const mergeActions = (localActions: ActionItem[], serverActions: ActionItem[]): ActionItem[] => {
    const merged = new Map<number, ActionItem>();

    // Add server actions first (they have priority)
    serverActions.forEach(action => {
      merged.set(action.id, action);
    });

    // Add local actions that don't exist on server
    localActions.forEach(action => {
      if (!action.serverId && !merged.has(action.id)) {
        merged.set(action.id, action);
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
  };

  return {
    actions,
    newAction,
    setNewAction,
    addAction,
    toggleAction,
    deleteAction,
    syncStatus,
    syncWithServer,
  };
} 