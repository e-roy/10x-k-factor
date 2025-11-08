# StudentSidebar Auto-Refresh Architecture

## Overview

The StudentSidebar now auto-refreshes when the user earns XP or completes challenges, providing real-time feedback without page reloads.

## Architecture

### Components

1. **StudentSidebar** (`components/app-layout/StudentSidebar.tsx`)
   - Pure presentational component
   - Receives data via props
   - No state management or side effects

2. **StudentSidebarClient** (`components/app-layout/StudentSidebarClient.tsx`)
   - Client-side wrapper with refresh logic
   - Manages data fetching and state
   - Listens for custom events
   - Implements memoization for performance

3. **API Endpoint** (`app/api/sidebar/student-data/route.ts`)
   - Fetches fresh sidebar data
   - Same logic as layout's `fetchStudentSidebarData`
   - Returns JSON response

### Data Flow

```
Server (Layout)
  ↓ [initialData via SSR]
StudentSidebarClient (Client Component)
  ↓ [manages state + refresh]
StudentSidebar (Pure Component)
  ↓ [renders UI]
```

## Refresh Triggers

### Event-Driven (Primary)
- `challengeCompleted` - When user completes a challenge
- `xpEarned` - When user earns XP (generic)
- `challengeGenerated` - When a new challenge is created

### Time-Based (Fallback)
- Automatic refresh every 60 seconds
- Ensures data stays fresh even if events are missed

## Performance Optimizations

### Memoization
```typescript
export const StudentSidebarClient = memo(function StudentSidebarClient({ ... }) {
  // Component only re-renders when props change
});
```

### Debounced Refresh
```typescript
const refreshData = useCallback(async () => {
  // Prevent concurrent refreshes
  if (isRefreshing) return;
  // ... fetch logic
}, [isRefreshing]);
```

### Event Listener Cleanup
```typescript
useEffect(() => {
  window.addEventListener("challengeCompleted", handleChallengeCompleted);
  
  return () => {
    window.removeEventListener("challengeCompleted", handleChallengeCompleted);
  };
}, [refreshData]);
```

## Event Dispatching

Events are dispatched from various parts of the application:

### ModalManager
```typescript
window.dispatchEvent(
  new CustomEvent("challengeCompleted", {
    detail: { challengeId, score },
  })
);
```

### Challenge API
XP events are tracked server-side when challenges are completed, and the client-side event triggers the sidebar refresh.

## Adding New Refresh Triggers

To add a new refresh trigger:

1. **Dispatch the event** where the action occurs:
```typescript
window.dispatchEvent(new CustomEvent("xpEarned", {
  detail: { amount: 50 }
}));
```

2. **Add listener** in `StudentSidebarClient.tsx`:
```typescript
useEffect(() => {
  const handleXpEarned = () => {
    console.log("[StudentSidebarClient] XP earned, refreshing...");
    refreshData();
  };
  
  window.addEventListener("xpEarned", handleXpEarned);
  return () => window.removeEventListener("xpEarned", handleXpEarned);
}, [refreshData]);
```

## Benefits

1. **Real-time Feedback**: Users see XP gains immediately
2. **Minimal Re-renders**: Memoization prevents unnecessary updates
3. **Resilient**: Fallback timer ensures eventual consistency
4. **Scalable**: Easy to add new refresh triggers
5. **Type-Safe**: Full TypeScript support
6. **SSR Compatible**: Initial data from server, client handles updates

## Future Improvements

- [ ] Add optimistic updates for instant UI feedback
- [ ] Implement exponential backoff for failed refreshes
- [ ] Add visual indicators for refreshing state
- [ ] Use WebSocket/SSE for real-time updates instead of polling
- [ ] Cache API responses with SWR or React Query

