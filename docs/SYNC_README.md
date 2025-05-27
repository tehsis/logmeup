# Action Sync System Documentation

## Overview

The Action Sync System provides **offline-first functionality with real-time synchronization** for managing action items with automatic synchronization to a REST API backend and WebSocket-based real-time updates.
**Actions are always associated with today's note**, ensuring proper organization and context. In the future, the user will be able to track other kind of notes rather than logs and those notes might have their own actions.

## Key Features

- **Offline-first architecture**: Actions work seamlessly without internet connection
- **Real-time synchronization**: WebSocket-based instant updates across all connected clients
- **Automatic sync**: No manual sync buttons - everything syncs automatically when online
- **Automatic note association**: All actions are automatically linked to today's note
- **Intelligent sync**: Batched operations with conflict resolution and duplicate detection
- **Real-time status**: Live sync indicators, WebSocket connection status, and pending operation counts
- **Error handling**: Comprehensive logging and graceful degradation
- **Auto-reconnection**: WebSocket connections automatically reconnect with exponential backoff

## Architecture

### Core Components

1. **Note API Service** (`app/services/noteApi.ts`)
   - Manages note creation and retrieval
   - Automatically gets or creates today's note
   - Handles date-based note organization

2. **Action API Service** (`app/services/actionApi.ts`)
   - HTTP client for action CRUD operations
   - Connectivity checking and timeout handling
   - Structured error responses

3. **WebSocket Service** (`app/services/websocketService.ts`)
   - Real-time WebSocket connection management
   - Automatic reconnection with exponential backoff
   - Message handling for action events (created/updated/deleted)
   - Connection state monitoring

4. **Action Sync Service** (`app/services/actionSync.ts`)
   - Offline queue management (create/update/delete)
   - Automatic synchronization when online
   - Real-time event handling from WebSocket
   - Conflict resolution and duplicate detection
   - Status tracking and notifications
   - Remote event listener management

5. **useAction Hook** (`app/hooks/useAction.ts`)
   - React integration for action management
   - Real-time UI updates from WebSocket events
   - Automatic sync when coming online
   - Local state management with persistence
   - Enhanced duplicate detection and server ID management

## Real-Time Sync System

### How It Works

1. **Action Creation**:
   - Action created locally → immediately visible in UI
   - Automatically queued for sync → sent to server when online
   - Server creates action and broadcasts WebSocket event
   - All connected clients receive the event → action appears in real-time
   - Original client updates local action with server ID

2. **Action Updates**:
   - Action updated locally → immediately visible in UI
   - Automatically queued for sync → sent to server when online
   - Server updates action and broadcasts WebSocket event
   - All connected clients receive the event → update appears in real-time

3. **Action Deletion**:
   - Action deleted locally → immediately removed from UI
   - Automatically queued for sync → sent to server when online
   - Server deletes action and broadcasts WebSocket event
   - All connected clients receive the event → action removed in real-time

### WebSocket Events

```typescript
// Event types broadcasted by the server
type WebSocketMessageType = 
  | "action_created" 
  | "action_updated" 
  | "action_deleted";

// Event structure
interface WebSocketMessage {
  type: WebSocketMessageType;
  action?: ApiAction; // For created/updated events
  id?: number;        // For deleted events
}
```

### Duplicate Detection

The system uses intelligent duplicate detection to prevent the same action from appearing multiple times:

```typescript
// Enhanced duplicate detection logic
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
```

## Note Association System

### How It Works

1. **Action Creation**: When a user creates an action, the system:
   - Gets today's date in `YYYY-MM-DD` format
   - Calls `noteApiService.getOrCreateTodayNote()` to ensure today's note exists
   - Associates the action with the returned note ID

2. **Note Management**: The note service:
   - First tries to find an existing note for today
   - If no note exists, creates a new one with minimal content
   - Returns the note ID for action association

3. **Offline Handling**: When offline:
   - Uses fallback note ID (1) to queue actions
   - Resolves proper note ID when sync occurs
   - Maintains action-note relationships

### API Endpoints

#### Notes
- `GET /api/notes?date=YYYY-MM-DD` - Get notes by date
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Actions
- `GET /api/actions` - Get all actions
- `POST /api/actions` - Create action (requires `note_id`)
- `PUT /api/actions/:id` - Update action
- `DELETE /api/actions/:id` - Delete action
- `GET /api/actions/note/:note_id` - Get actions by note

#### WebSocket
- `ws://localhost:8080/ws` - WebSocket endpoint for real-time updates

## Sync Process

### 1. Automatic Queue Management
```typescript
// Actions are automatically queued and synced
await actionSyncService.queueCreateAction(action); // Auto-syncs if online
await actionSyncService.queueUpdateAction(action); // Auto-syncs if online
await actionSyncService.queueDeleteAction(action); // Auto-syncs if online
```

### 2. Real-Time Event Handling
```typescript
// Set up remote event listeners
actionSyncService.addRemoteEventListener((event: RemoteActionEvent) => {
  switch (event.type) {
    case 'created':
      // Handle remote action creation
      break;
    case 'updated':
      // Handle remote action update
      break;
    case 'deleted':
      // Handle remote action deletion
      break;
  }
});
```

### 3. Automatic Sync
```typescript
// Sync happens automatically when:
// - Actions are created/updated/deleted (if online)
// - WebSocket connection is established
// - Coming back online after being offline
const result = await actionSyncService.autoSyncIfOnline();
```

### 4. Conflict Resolution
- Server data takes priority over local changes
- Local-only actions are preserved during merge
- Enhanced duplicate detection prevents action duplication
- Server IDs are automatically assigned to local actions after sync

## Usage Examples

### Creating an Action (Real-time)
```typescript
const { addAction } = useAction();

// Action appears immediately in UI and syncs automatically
// Other clients see it in real-time via WebSocket
await addAction(formEvent);
```

### Monitoring Real-time Status
```typescript
const { syncStatus } = useAction();

console.log({
  isOnline: syncStatus.isOnline,        // API connectivity
  wsConnected: syncStatus.wsConnected,  // WebSocket connectivity
  pendingCount: syncStatus.pendingCount, // Queued operations
  lastSync: syncStatus.lastSync,        // Last successful sync
  syncing: syncStatus.syncing          // Currently syncing
});

// Status indicators:
// "Real-time" - Both API and WebSocket connected
// "Online" - Only API connected
// "Offline" - Neither connected
// "Syncing..." - Sync in progress
```

### Manual Sync (For Debugging)
```typescript
const { manualSync } = useAction();

const result = await manualSync();
if (result.success) {
  console.log("Manual sync completed successfully");
}
```

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- Graceful degradation to offline mode
- WebSocket auto-reconnection
- User-friendly error messages

### Data Conflicts
- Server data takes precedence
- Local changes are preserved when possible
- Enhanced duplicate detection
- Detailed logging for debugging

### WebSocket Connection Issues
- Automatic reconnection with exponential backoff
- Connection state monitoring
- Fallback to polling when WebSocket fails
- Graceful handling of connection drops

### Note Creation Failures
- Falls back to default note ID when offline
- Resolves proper association during sync
- Maintains data integrity

## Logging

### WebSocket Operations
```
[WebSocket-Connect-SUCCESS] 2024-01-01T12:00:00.000Z: WebSocket connection established
[WebSocket-Message] 2024-01-01T12:00:00.000Z: Received WebSocket message {"type":"action_created","action":{...}}
[WebSocket-Reconnect] 2024-01-01T12:00:00.000Z: Scheduling reconnection attempt 1 {"delayMs":1000}
```

### Real-time Sync Operations
```
[ActionSync-WebSocket] 2024-01-01T12:00:00.000Z: Handling remote action created {...}
[ActionSync-RemoteEvent] 2024-01-01T12:00:00.000Z: Adding remote action: {...}
[ActionSync-AutoSync] 2024-01-01T12:00:00.000Z: Starting automatic sync
```

### Note API Operations
```
[NoteAPI-GetOrCreateToday] 2024-01-01T12:00:00.000Z: Getting or creating today's note {"date":"2024-01-01"}
[NoteAPI-Create] 2024-01-01T12:00:00.000Z: Successfully created note with ID 1
```

### Enhanced Sync Operations
```
[ActionSync-QueueCreate] 2024-01-01T12:00:00.000Z: Action queued for creation {"noteId":1}
[ActionSync-Sync-SUCCESS] 2024-01-01T12:00:00.000Z: Sync completed successfully {"createdCount":1,"updatedCount":0,"deletedCount":0}
```

## Configuration

### API Base URL
```typescript
const API_BASE_URL = "http://localhost:8080/api";
```

### WebSocket URL
```typescript
const WS_URL = "ws://localhost:8080/ws";
```

### Timeout Settings
```typescript
const DEFAULT_TIMEOUT = 5000; // 5 seconds
```

### WebSocket Reconnection
```typescript
const maxReconnectAttempts = 5;
const reconnectInterval = 1000; // Start with 1 second
const maxReconnectInterval = 30000; // Max 30 seconds
```

### Storage Keys
```typescript
const SYNC_QUEUE_KEY = "sync_queue";
const LAST_SYNC_KEY = "last_sync";
```

## Best Practices

1. **Use the provided hooks** for all action management
2. **Monitor both API and WebSocket status** for complete connectivity picture
3. **Handle offline scenarios** gracefully with automatic sync
4. **Test with network interruptions** to ensure reliability
5. **Check logs** for debugging sync and real-time issues
6. **Trust the automatic sync** - no manual sync buttons needed
7. **Test multi-client scenarios** to verify real-time updates

## Troubleshooting

### Common Issues

1. **Actions not syncing in real-time**
   - Check WebSocket connectivity (`syncStatus.wsConnected`)
   - Verify WebSocket server is running on port 8080
   - Review browser console for WebSocket errors
   - Check if automatic sync is working (`syncStatus.syncing`)

2. **Duplicate actions appearing**
   - Check duplicate detection logic in browser console
   - Verify server ID assignment is working
   - Review action creation timestamps
   - Check for race conditions in action creation

3. **WebSocket connection issues**
   - Verify WebSocket endpoint is accessible
   - Check for CORS issues
   - Review reconnection attempts in logs
   - Test with different network conditions

4. **Actions not syncing**
   - Check API connectivity (`syncStatus.isOnline`)
   - Verify API server is running
   - Review browser console for API errors
   - Check pending count (`syncStatus.pendingCount`)

5. **Note association failures**
   - Ensure backend note endpoints are available
   - Check date format compatibility
   - Verify note creation permissions

### Debug Commands

```bash
# Test API connectivity
curl -X GET "http://localhost:8080/api/health"

# Test note API
curl -X GET "http://localhost:8080/api/notes?date=$(date +%Y-%m-%d)"

# Test action creation
curl -X POST "http://localhost:8080/api/actions" \
  -H "Content-Type: application/json" \
  -d '{"note_id": 1, "description": "Test action"}'

# Check all actions
curl -X GET "http://localhost:8080/api/actions"

# Test WebSocket connection (using wscat)
npm install -g wscat
wscat -c ws://localhost:8080/ws
```

### Browser Console Debugging

```javascript
// Check sync status
console.log(actionSyncService.getSyncStatus());

// Check WebSocket connection
console.log(webSocketService.getConnectionState());

// Monitor real-time events
actionSyncService.addRemoteEventListener(console.log);
``` 