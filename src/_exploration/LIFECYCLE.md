# Query Lifecycle

## Architecture

```
useFetch → UserQueryManager → UserQuery → Store → Cache → Loader → ApiRequester → API
                                            ↑                           ↓
                                            └─────── onLoaded ──────────┘
```

**Components:**

- **UserQueryManager**: Deduplicates queries, manages lifecycle
- **Store**: Orchestrates cache + loader
- **ImmediateCache**: Field-level storage with 3 states (fresh/dirty/optimistic)
- **BatchedLoader**: Batches & deduplicates requests
- **ApiRequester**: Consolidates fields per instance, rate limits
- **OptimisticManager**: Manages optimistic update layers

---

## Query Scenarios

### 1. Empty Cache

```
Hook renders
  → cache.get() returns undefined
  → Component suspends
  → Request added to batch
  → Timeout fires (0ms) → API call
  → Response arrives → cache.set(state: "fresh")
  → Subscribers notified
  → Component re-renders with data
```

**Result:** Suspends until data loads

---

### 2. Fresh Cache

```
Hook renders
  → cache.get() returns {value, meta: {state: "fresh"}}
  → Immediate return
  → Component renders synchronously
```

**Result:** Instant render, no API call

---

### 3. Dirty Cache

```
Hook renders
  → cache.get() returns {value, meta: {state: "dirty"}}
  → Stale data accepted (acceptDirty=true)
  → Component renders immediately with stale data
  → Background refetch triggered → cache.set(state: "fresh")
  → Subscribers notified
  → Component re-renders with fresh data
```

**Result:** Immediate render with stale data, then updates when fresh data arrives (stale-while-revalidate)

**Note:** Dirty entries marked during `store.invalidate(partKeyPatterns)`

---

## Mutation Lifecycle

### Optimistic Update Flow

```
store.mutate(mutationFn, {onMutate, onSuccess})
  ↓
1. mutationFn() called → Promise starts
  ↓
2. createOptimisticLayer(promise)
  ↓
3. onMutate(updater) → updater.setField("Card", "123", "title", "New Title")
  ↓
4. Layer added to stack → flatView rebuilt
  ↓
5. Subscribers notified → React shows optimistic data
  ↓
6. Promise resolves
  ↓
7. onSuccess() → store.invalidate(["Card:123:title"]), store.setField(..., "dirty")
  ↓
8. Layer auto-removed → flatView rebuilt
  ↓
9. Subscribers notified → cache returns dirty data
  ↓
10. Background refetch starts → fresh data loads
  ↓
11. React shows real server data
```

**On Error:**

```
Promise rejects
  → onError() called
  → Layer auto-removed
  → UI reverts to previous data
```

---

## Key Mechanisms

### Batching & Deduplication

- Requests collected within timeout window (default 0ms = next microtask)
- Duplicate requests (same key) share single API call
- All fields for all instances across all models consolidated into a single HTTP request

### Field-Level Subscriptions

- Cache tracks subscribers per field: `"Card:123:title"`
- UserQuery subscribes to all fields in query tree
- Auto-unsubscribe on component unmount

### Optimistic Layers

- Stack of pending mutations
- Later layers override earlier ones
- Flattened view for O(1) lookups: `flatView.get("Card:123:title")`
- Auto-cleanup when promises settle

### Structural Sharing

- `deepUpdateTree()` reuses unchanged object references
- React skips re-rendering unchanged components
- Tracks added/removed instances for subscription management

### Invalidation

- Pattern-based: `store.invalidate(["Card:123:*"])`
- Marks fields as dirty via `partKeyToFields` reverse map
- Only reloads fields with active subscriptions

### Cache Lookup Priority

1. Check optimistic layers (newest to oldest)
2. Return base cache value
3. Return `undefined` if missing
