# Action Sync System Documentation

## Overview

The Action Sync System provides offline-first functionality for managing action items with automatic synchronization to a REST API backend. **Actions are always associated with today's note**, ensuring proper organization and context.

## Key Features

- **Offline-first architecture**: Actions work seamlessly without internet connection
- **Automatic note association**: All actions are automatically linked to today's note
- **Intelligent sync**: Batched operations with conflict resolution
- **Real-time status**: Live sync indicators and pending operation counts
- **Error handling**: Comprehensive logging and graceful degradation

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

3. **Action Sync Service** (`app/services/actionSync.ts`)
   - Offline queue management (create/update/delete)
   - Batch synchronization with server
   - Conflict resolution (server priority)
   - Status tracking and notifications

4. **useAction Hook** (`app/hooks/useAction.ts`)
   - React integration for action management
   - Automatic sync when coming online
   - Local state management with persistence

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

## Sync Process

### 1. Queue Management
```typescript
// Actions are queued with today's note ID
await actionSyncService.queueCreateAction(action);
```

### 2. Batch Sync
```typescript
// Sync processes all queued operations
const result = await actionSyncService.fullSync();
```

### 3. Conflict Resolution
- Server data takes priority over local changes
- Local-only actions are preserved during merge
- Timestamps determine most recent updates

## Usage Examples

### Creating an Action
```typescript
const { addAction } = useAction();

// Action is automatically associated with today's note
await addAction(formEvent);
```

### Manual Sync
```typescript
const { syncWithServer } = useAction();

const result = await syncWithServer();
if (result.success) {
  console.log("Sync completed successfully");
}
```

### Monitoring Sync Status
```typescript
const { syncStatus } = useAction();

console.log({
  isOnline: syncStatus.isOnline,
  pendingCount: syncStatus.pendingCount,
  lastSync: syncStatus.lastSync,
  syncing: syncStatus.syncing
});
```

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- Graceful degradation to offline mode
- User-friendly error messages

### Data Conflicts
- Server data takes precedence
- Local changes are preserved when possible
- Detailed logging for debugging

### Note Creation Failures
- Falls back to default note ID when offline
- Resolves proper association during sync
- Maintains data integrity

## Logging

### Note API Operations
```
[NoteAPI-GetOrCreateToday] 2024-01-01T12:00:00.000Z: Getting or creating today's note {"date":"2024-01-01"}
[NoteAPI-Create] 2024-01-01T12:00:00.000Z: Successfully created note with ID 1
```

### Sync Operations
```
[ActionSync-QueueCreate] 2024-01-01T12:00:00.000Z: Action queued for creation {"noteId":1}
[ActionSync-Sync] 2024-01-01T12:00:00.000Z: Sync completed successfully {"createdCount":1}
```

## Configuration

### API Base URL
```typescript
const API_BASE_URL = "http://localhost:8080/api";
```

### Timeout Settings
```typescript
const DEFAULT_TIMEOUT = 5000; // 5 seconds
```

### Storage Keys
```typescript
const SYNC_QUEUE_KEY = "sync_queue";
const LAST_SYNC_KEY = "last_sync";
```

## Best Practices

1. **Always use the provided hooks** for action management
2. **Monitor sync status** to provide user feedback
3. **Handle offline scenarios** gracefully
4. **Test with network interruptions** to ensure reliability
5. **Check logs** for debugging sync issues

## Troubleshooting

### Common Issues

1. **Actions not syncing**
   - Check network connectivity
   - Verify API server is running
   - Review browser console for errors

2. **Note association failures**
   - Ensure backend note endpoints are available
   - Check date format compatibility
   - Verify note creation permissions

3. **Sync conflicts**
   - Review conflict resolution logs
   - Check server timestamps
   - Verify data integrity

### Debug Commands

```bash
# Test note API
curl -X GET "http://localhost:8080/api/notes?date=$(date +%Y-%m-%d)"

# Test action creation
curl -X POST "http://localhost:8080/api/actions" \
  -H "Content-Type: application/json" \
  -d '{"note_id": 1, "description": "Test action"}'

# Check all actions
curl -X GET "http://localhost:8080/api/actions"
``` 