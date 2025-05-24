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
    wsConnected: false,
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

  // Automatically refresh actions when sync status changes (for real-time updates)
  useEffect(() => {
    if (syncStatus.wsConnected && syncStatus.isOnline) {
      // Refresh actions from server when real-time connection is established
      refreshActionsFromServer();
    }
  }, [syncStatus.wsConnected, syncStatus.isOnline]);

  const refreshActionsFromServer = async () => {
    try {
      const result = await actionSyncService.fetchFromServer();
      const mergedActions = mergeActions(actions, result);
      setActions(mergedActions);
    } catch (error) {
      console.error("Failed to refresh actions from server:", error);
    }
  };

  const addAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAction.trim() === "") return;

    const action = createAction(newAction);
    setActions([...actions, action]);
    setNewAction("");

    // Queue for sync (now with automatic sync)
    try {
      await actionSyncService.queueCreateAction(action);
    } catch (error) {
      console.error("Failed to queue action for sync:", error);
    }
  };

  const toggleAction = async (id: number) => {
    const updatedActions = toggleActionCompletion(actions, id);
    setActions(updatedActions);

    // Find the updated action and queue for sync
    const updatedAction = updatedActions.find(a => a.id === id);
    if (updatedAction) {
      try {
        await actionSyncService.queueUpdateAction(updatedAction);
      } catch (error) {
        console.error("Failed to queue action update for sync:", error);
      }
    }
  };

  const deleteAction = async (id: number) => {
    const actionToDelete = actions.find(a => a.id === id);
    setActions(deleteActionById(actions, id));

    // Queue for sync
    if (actionToDelete) {
      try {
        await actionSyncService.queueDeleteAction(actionToDelete);
      } catch (error) {
        console.error("Failed to queue action deletion for sync:", error);
      }
    }
  };

  const manualSync = async () => {
    try {
      const result = await actionSyncService.fullSync();
      if (result.success && result.actions) {
        // Merge server actions with local actions, prioritizing server data
        const mergedActions = mergeActions(actions, result.actions);
        setActions(mergedActions);
      }
      return result;
    } catch (error) {
      console.error("Manual sync failed:", error);
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
    manualSync, // Keep for debugging purposes, but UI won't show sync button
    refreshActionsFromServer,
  };
} 