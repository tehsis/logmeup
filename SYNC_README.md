# Actions Sync - Offline-First Implementation

This implementation provides offline-first functionality for the Actions feature, allowing users to work seamlessly whether online or offline, with automatic synchronization when connectivity is restored.

## Features

### ✅ Offline-First Architecture
- **Local Storage**: All actions are stored locally in browser localStorage
- **Queue System**: Operations are queued when offline and synced when online
- **Conflict Resolution**: Server data takes priority during sync
- **Automatic Sync**: Syncs automatically when coming back online

### ✅ Sync Status Indicators
- **Online/Offline Status**: Visual indicator showing connection status
- **Pending Count**: Shows number of unsynced operations
- **Sync Progress**: Loading indicator during sync operations
- **Last Sync Time**: Displays when last successful sync occurred
- **Unsynced Items**: Orange dot indicator for items not yet synced to server

### ✅ Manual Sync Control
- **Sync Button**: Manual trigger for synchronization
- **Error Handling**: Graceful error handling with user feedback
- **Retry Logic**: Automatic retry when connection is restored

## API Endpoints

The sync system uses the following REST API endpoints:

```
GET    /api/actions           - Fetch all actions
POST   /api/actions           - Create new action
PUT    /api/actions/:id       - Update action (completion status)
DELETE /api/actions/:id       - Delete action
HEAD   /api/actions           - Check server connectivity
```

## How It Works

### 1. Local Operations
When users perform actions (create, update, delete), they are:
1. **Immediately applied locally** for instant UI feedback
2. **Saved to localStorage** for persistence
3. **Queued for sync** when online

### 2. Sync Queue
The sync system maintains three queues:
- **Create Queue**: New actions to be created on server
- **Update Queue**: Actions to be updated on server
- **Delete Queue**: Actions to be deleted from server

### 3. Sync Process
When syncing:
1. **Check connectivity** to server
2. **Process creates** - Send new actions to server
3. **Process updates** - Update existing actions on server
4. **Process deletes** - Remove actions from server
5. **Fetch latest** - Get all actions from server
6. **Merge data** - Combine local and server data (server wins)
7. **Clear queues** - Remove successfully synced operations

### 4. Conflict Resolution
- **Server Priority**: Server data always takes precedence
- **Local Preservation**: Local-only actions are preserved
- **Smart Merging**: Avoids duplicates and maintains data integrity

## Usage

### Starting the API Server
```bash
cd logmeup-api
go run cmd/api/main.go
```
The API will be available at `http://localhost:8080`

### Testing the API
```bash
node test_api.js
```

### Frontend Integration
The sync functionality is automatically integrated into the Action component:

```typescript
const { 
  actions, 
  syncStatus, 
  syncWithServer 
} = useAction();
```

### Sync Status Object
```typescript
interface SyncStatus {
  isOnline: boolean;        // Server connectivity
  lastSync: number | null;  // Last successful sync timestamp
  pendingCount: number;     // Number of unsynced operations
  syncing: boolean;         // Currently syncing
}
```

## Technical Implementation

### Files Modified/Created

#### Frontend (React/TypeScript)
- `app/services/actionApi.ts` - API service layer
- `app/services/actionSync.ts` - Sync service with offline queue
- `app/hooks/useAction.ts` - Updated hook with sync integration
- `app/components/Action.tsx` - UI with sync status indicators
- `app/models/Action.tsx` - Extended model with sync fields

#### Backend (Go/Gin)
- `internal/routes/routes.go` - Added GET /api/actions endpoint
- `internal/handlers/action_handler.go` - Added GetAll handler
- `internal/repository/action_repository.go` - Added GetAll method
- `cmd/api/main.go` - Added CORS middleware

### Key Features

#### Offline Queue Management
```typescript
// Queue operations for offline use
queueCreateAction(action: ActionItem)
queueUpdateAction(action: ActionItem)  
queueDeleteAction(action: ActionItem)
```

#### Automatic Sync
```typescript
// Auto-sync when coming online
useEffect(() => {
  if (syncStatus.isOnline && syncStatus.pendingCount > 0) {
    syncWithServer();
  }
}, [syncStatus.isOnline]);
```

#### Smart Merging
```typescript
// Merge server and local data
const mergeActions = (localActions, serverActions) => {
  // Server actions take priority
  // Local-only actions are preserved
  // Sorted by creation date
}
```

## Error Handling

- **Network Errors**: Gracefully handled, operations queued for retry
- **Server Errors**: User feedback with error messages
- **Timeout Handling**: 5-second timeout for API calls
- **Abort Controllers**: Prevent race conditions

## Performance Considerations

- **Debounced Sync**: Prevents excessive sync calls
- **Batch Operations**: Multiple operations synced together
- **Efficient Storage**: Minimal localStorage usage
- **Memory Management**: Proper cleanup of listeners and timers

## Future Enhancements

- **Conflict Resolution UI**: Allow users to resolve conflicts manually
- **Sync History**: Track sync operations and failures
- **Background Sync**: Service worker for background synchronization
- **Optimistic Updates**: More sophisticated optimistic UI updates
- **Compression**: Compress sync payloads for better performance 