import type { ActionCandidate, ActionItem } from "../models/Action";
import type { SyncStatus } from "../services/actionSync";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeClasses, getActionItemClasses, getSuggestionItemClasses, getInputClasses } from "../utils/theme";

// Define props for the Action component
interface ActionProps {
  actions: ActionItem[];
  newAction: string;
  setNewAction: (value: string) => void;
  addAction: (e: React.FormEvent) => Promise<void>;
  toggleAction: (id: number) => Promise<void>;
  deleteAction: (id: number) => Promise<void>;
  candidates: ActionCandidate[];
  isLoading: boolean;
  error: string | null;
  onAddCandidate: (text: string) => void;
  syncStatus: SyncStatus;
  manualSync?: () => Promise<{ success: boolean; error?: string }>; // Optional for debugging
}

export function Action({
  actions,
  newAction,
  setNewAction,
  addAction,
  toggleAction,
  deleteAction,
  candidates,
  isLoading,
  error,
  onAddCandidate,
  syncStatus,
  manualSync,
}: ActionProps) {
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getConnectionStatusDisplay = () => {
    if (syncStatus.wsConnected && syncStatus.isOnline) {
      return (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${theme.status.online}`} />
          <span className={theme.text.success}>Real-time</span>
        </div>
      );
    } else if (syncStatus.isOnline) {
      return (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full bg-yellow-500`} />
          <span className={theme.text.primary}>Online</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${theme.status.offline}`} />
          <span className={theme.text.danger}>Offline</span>
        </div>
      );
    }
  };

  return (
    <div className={`h-full p-4 flex flex-col ${theme.bg.primary}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className={`text-xl font-bold ${theme.text.primary}`}>Action List</h2>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1 rounded ${theme.bg.secondary} ${theme.text.primary} hover:opacity-80`}
            title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          {/* Real-time Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {getConnectionStatusDisplay()}
            
            {syncStatus.pendingCount > 0 && (
              <span className={theme.status.pending}>
                {syncStatus.pendingCount} pending
              </span>
            )}
            
            {syncStatus.syncing && (
              <span className={`text-xs ${theme.text.muted} italic`}>
                Syncing...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className={`text-xs ${theme.text.muted} mb-2 flex-shrink-0 space-y-1`}>
        {syncStatus.lastSync && (
          <div>Last sync: {formatLastSync(syncStatus.lastSync)}</div>
        )}
        <div className="flex gap-4">
          <span>API: {syncStatus.isOnline ? '✓' : '✗'}</span>
          <span>WebSocket: {syncStatus.wsConnected ? '✓' : '✗'}</span>
          {syncStatus.pendingCount > 0 && (
            <span className={theme.status.pending}>
              {syncStatus.pendingCount} queued
            </span>
          )}
        </div>
      </div>

      {/* Action Input Form */}
      <form onSubmit={addAction} className="mb-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Add a new action..."
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${getInputClasses(isDark)}`}
          />
          <button
            type="submit"
            className={`px-4 py-2 ${theme.bg.button} text-white rounded-md ${theme.bg.buttonHover} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            Add
          </button>
        </div>
      </form>
      
      {/* Suggested Actions */}
      <div className="mb-4 flex-shrink-0">
        <h3 className={`text-lg font-semibold mb-2 ${theme.text.primary}`}>
          Suggested Actions
          {isLoading && (
            <span className={`text-sm ${theme.text.muted} ml-2`}>Loading...</span>
          )}
        </h3>
        {error && (
          <p className={`text-sm ${theme.text.danger} ${isDark ? 'bg-red-900/20' : 'bg-red-100'} p-2 rounded mb-2`}>
            {error}
          </p>
        )}
        {candidates.length > 0 && (
          <div className={`space-y-2 overflow-y-auto border rounded p-4 ${theme.border.primary} ${theme.bg.secondary}`}>
            {candidates.map((candidate, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 border rounded-md shadow-sm transition-colors duration-200 ${getSuggestionItemClasses(isDark)}`}
              >
                <span className={`flex-1 text-sm ${theme.text.primary}`}>{candidate.text}</span>
                <button
                  onClick={() => onAddCandidate(candidate.text)}
                  className={`px-2 cursor-pointer py-1 text-xs ${theme.bg.success} text-white rounded ${theme.bg.successHover} flex-shrink-0`}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
        {!isLoading && candidates.length === 0 && (
          <p className={`text-sm ${theme.text.muted} italic`}>No suggestions found.</p>
        )}
      </div>
      
      {/* Action List */}
      <div className="flex-1 overflow-y-auto">
        <h3 className={`text-lg font-semibold mb-2 ${theme.text.primary}`}>Your Actions</h3>
        <ul className="space-y-2">
          {actions.map((action) => (
            <li
              key={action.id}
              className={`flex items-center gap-2 p-2 border rounded-md shadow-sm ${getActionItemClasses(isDark, action.completed)}`}
            >
              <input
                type="checkbox"
                checked={action.completed}
                onChange={() => toggleAction(action.id)}
                className="h-4 w-4 text-blue-500"
              />
              <span
                className={`flex-1 ${
                  action.completed ? "line-through" : ""
                } ${action.completed ? theme.text.muted : theme.text.primary}`}
              >
                {action.text}
              </span>
              <div className="flex items-center gap-2">
                {!action.serverId && (
                  <span 
                    className={`text-xs ${theme.status.pending} animate-pulse`} 
                    title="Queued for sync"
                  >
                    ●
                  </span>
                )}
                <span className={`text-xs ${theme.text.muted}`}>
                  {new Date(action.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteAction(action.id)}
                  className={`cursor-pointer ${theme.text.danger} hover:opacity-80`}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
          {actions.length === 0 && (
            <p className={`text-sm ${theme.text.muted} italic`}>
              Your action list is empty.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
} 