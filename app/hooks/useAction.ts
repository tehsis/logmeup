import { useState, useEffect } from "react";
import {
  type ActionItem,
  loadActions,
  saveActions,
  createAction,
  toggleActionCompletion,
  deleteActionById,
} from "../models/Action";
import { actionSyncService, type SyncStatus, type RemoteActionEvent } from "../services/actionSync";

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

  // Set up remote event listener for real-time updates
  useEffect(() => {
    const handleRemoteEvent = (event: RemoteActionEvent) => {
      console.log('Received remote event:', event);
      
      switch (event.type) {
        case 'created':
          if (event.action) {
            const newAction = event.action;
            setActions(prevActions => {
              // Check if action already exists (avoid duplicates)
              // First check by server ID, then by text content for recently created actions
              const exists = prevActions.some(a => {
                // If both have server IDs, compare them
                if (a.serverId && newAction.serverId) {
                  return a.serverId === newAction.serverId;
                }
                // If the remote action has a server ID but local doesn't,
                // check if it's the same action by text and recent creation time
                if (!a.serverId && newAction.serverId) {
                  const timeDiff = Math.abs(a.createdAt - newAction.createdAt);
                  return a.text === newAction.text && timeDiff < 10000; // Within 10 seconds
                }
                return false;
              });
              
              if (!exists) {
                console.log('Adding remote action:', newAction);
                return [newAction, ...prevActions];
              } else {
                // Update existing local action with server ID if it doesn't have one
                console.log('Updating existing action with server ID:', newAction);
                return prevActions.map(action => {
                  if (!action.serverId && action.text === newAction.text) {
                    const timeDiff = Math.abs(action.createdAt - newAction.createdAt);
                    if (timeDiff < 10000) { // Within 10 seconds
                      return { ...action, serverId: newAction.serverId, lastUpdated: newAction.lastUpdated };
                    }
                  }
                  return action;
                });
              }
            });
          }
          break;
          
        case 'updated':
          if (event.action) {
            const updatedAction = event.action;
            setActions(prevActions => 
              prevActions.map(action => 
                action.serverId === updatedAction.id
                  ? { ...action, ...updatedAction, id: action.id } // Keep local ID
                  : action
              )
            );
          }
          break;
          
        case 'deleted':
          if (event.actionId) {
            const deletedActionId = event.actionId;
            setActions(prevActions => 
              prevActions.filter(action => action.serverId !== deletedActionId)
            );
          }
          break;
      }
    };

    actionSyncService.addRemoteEventListener(handleRemoteEvent);

    return () => {
      actionSyncService.removeRemoteEventListener(handleRemoteEvent);
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